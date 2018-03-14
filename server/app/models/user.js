"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const async = require("async");

const Pack = require("./pack");
const Generator = require("./generator");
const BuiltPack = require("./builtpack");

// define the schema for our user model
var userSchema = mongoose.Schema({
	name: String,
	role: String,
	local: {
		email: String,
		password: String
	},
	facebook: {
		id: String,
		token: String,
		name: String,
		email: String
	},
	twitter: {
		id: String,
		token: String,
		displayName: String,
		username: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.deleteMe = async function(done) {
	var packs = await Pack.find({ _user: this.id }).exec();

	if(!packs || !packs.length){
		deleteUser(this, (err, user) => {
			if (err) done(err);
			done(null, {
				deletedUser: user
			});
		});
		return;
	}

	var user = this;
	var packIdArr = packs.map(p=>p._id);

	async.parallel(
		{
			deletedPacks: function(cb){
				Pack.remove({ _id: { $in: packIdArr } }).exec(cb);
			},
			deletedGenerators: function(cb) {
				Generator.remove({ _pack: { $in: packIdArr } }).exec(cb);
			},
			deletedBuilds: function(cb) {
				BuiltPack.remove({ _id: { $in: packIdArr } }).exec(cb);
			},
			deletedUser: function(cb) {
				deleteUser(user, cb);
			}
		},
		function(err, result){
			result.deletedPackIds = packIdArr;
			done(err, result)
		}
	);

	return;
};

function deleteUser(user, callback) {
	user.remove((err, deletedUser) => {
		if (err) callback(err);
		return callback(null, deletedUser);
	});
}

// create the model for users and expose it to our app
module.exports = mongoose.model("User", userSchema);

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
		name: String,
		username: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

userSchema.pre('remove', async function(next){
	var packs = await this.model('Pack').find({ _user: this.id }).exec();
	var results = await Promise.all(packs.map(p=>p.remove()));
	
	next();
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

// create the model for users and expose it to our app
module.exports = mongoose.model("User", userSchema);

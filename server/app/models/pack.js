'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const generatorSchema = require("./generator")
const Generator = require("./generator");

const BUILD_FREQUENCY = 1000 * 3600; // 1 hour
const SEED_DELIM = ">";

var packSchema = Schema({

	//optional because dummy universe packs leave this out
	_user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},

	// for universe custom changes dummy packs. Packs with a _universe id were auto-generated, and are for backend use. Shouldn't be shown to the user!
	_universe: {
		type: Schema.Types.ObjectId,
		ref: 'Universe'
	},
	name: {
		type: String,
		required: true
	},
	url: {
		type: String
	},
	description: String,
	defaultSeed: {
		type: String,
		isAsync: true,
		set: function(val){
			if(val.charAt(val.length-1) != SEED_DELIM)
				return val+SEED_DELIM;
			return val;
		}
	},
	createdOn: { type: Date, default: Date.now },
	updatedOn: { type: Date, default: Date.now },
	public: {
		type: Boolean,
		default: false
	},
	dependencies: [{
		type: Schema.Types.ObjectId,
		ref: 'Pack'
	}], // packs
});

/** 
 * @return Array of Generator isa's representing the seed
 */
packSchema.virtual('seedArray').get(function() {
	return seedArray(this.defaultSeed);
});

function seedArray(defaultSeed){
	if(!defaultSeed) return [];

	if(defaultSeed.charAt(defaultSeed.length-1) !== SEED_DELIM)
		defaultSeed = defaultSeed+SEED_DELIM;

	var arr = defaultSeed.split(">")
	arr.splice(arr.length-1,1);

	return arr;
}

packSchema.methods.getGenByIsa = function(isa,callback){
	return this.model('Generator').findById(this.combinedGenerators.id(isa)._generator,callback);
}

packSchema.methods.seedIsValid = function(seed, generators){
	var arr = seedArray(seed);
	for(var i = 0; i < arr.length; i++){
		if(!generators[arr[i]]){
			return false;
		}
	}
	return true;
}

packSchema.methods.renameDefaultSeed = async function(oldname, newname){
	if(this.defaultSeed){
		var newSeed = this.defaultSeed.replace(new RegExp(oldname+SEED_DELIM, "g"), newname+SEED_DELIM);
		if(newSeed !== this.defaultSeed){
			this.defaultSeed = newSeed;
			return await this.save();
		}
	}
	return true;
}

packSchema.methods.checkDependencies = function(){
	// array stack
	// this.dependencies and populate it, only grabbing dependencies

	//each in order, add the dependecies if not already added, 
}

// delete all of the generators in this pack when you delete pack;
packSchema.statics.deleteMe = function(callback){
	Generator.remove({ _pack: this._id }, (err,docs) => {
		if(err) callback(err)
		this.remove((err)=>{
			callback(err);
		})
	});
}

module.exports = mongoose.model('Pack', packSchema);
module.exports.packSchema = packSchema;
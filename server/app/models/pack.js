'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const generatorSchema = require("./generator")

const BUILD_FREQUENCY = 1000 * 3600; // 1 hour
const SEED_DELIM = ">";

var packSchema = Schema({

	//optional because dummy universe packs leave this out
	_user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},

	// for universe custom changes dummy packs. Packs with a _universe id were auto-generated, and are for backend use. Shouldn't be shown to the user!
	universe_id: {
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
	desc: String,
	seed: {
		type: String,
		isAsync: true,
		set: function(val){
			if(val.charAt(val.length-1) != SEED_DELIM)
				return val+SEED_DELIM;
			return val;
		}
	},
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now },
	public: {
		type: Boolean,
		default: false
	},
	dependencies: [{
		type: Schema.Types.ObjectId,
		ref: 'Pack'
	}], // packs
});

// remove related data on delete
packSchema.post('remove', function(pack){
	return Promise.all([ 
		pack.model('Generator').remove({ pack_id: pack._id }),
		pack.model('BuiltPack').remove({ _id: pack._id })
	]);
})

/** 
 * @return Array of Generator isa's representing the seed
 */
packSchema.virtual('seedArray').get(function() {
	return seedArray(this.seed);
});

/**
 * Check if seed is valid and get array of generators
 * @param  {string} seed       to check
 * @param  {Object} generators map of built generators
 * @return {Object[]|boolean}            array of generators or false
 */
packSchema.methods.seedIsValid = function(seed, generators){
	var arr = seedArray(seed);
	var gens = []
	for(var i = 0; i < arr.length; i++){
		if(!generators[arr[i]]){
			return false;
		}
		gens.push(generators[arr[i]]);
	}
	return (gens.length) ? gens : false;
}

/**
 * When a isa name changes, this adjusts the seed to the new isa
 * @param  {string} isaOld old isa name
 * @param  {string} isaNew new isa name
 */
packSchema.methods.renameSeed = async function(isaOld, isaNew){
	if(this.seed){
		var newSeed = this.seed.replace(new RegExp(isaOld+SEED_DELIM, "g"), isaNew+SEED_DELIM);
		if(newSeed !== this.seed){
			this.seed = newSeed;
			await this.save();
		}
	}
}

/**
 * @param  {string} seed 
 * @return {string[]}      
 */
function seedArray(seed){
	if(!seed) return [];

	if(seed.charAt(seed.length-1) !== SEED_DELIM)
		seed = seed+SEED_DELIM;

	var arr = seed.split(">")
	arr.splice(arr.length-1,1);

	return arr;
}

module.exports = mongoose.model('Pack', packSchema);
module.exports.packSchema = packSchema;
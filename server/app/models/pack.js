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
	font: String,
	cssClass: String,
	txt: String,
	desc: String,
	seed: {
		type: String,
		isAsync: true,
		set: function(val){
			if(val.charAt(val.length-1) !== SEED_DELIM)
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
	}] // packs
});

// remove related data on delete
packSchema.post('remove', function(pack){
	return Promise.all([ 
		pack.model('Generator').deleteMany({ pack: pack._id }),
		pack.model('BuiltPack').deleteMany({ _id: pack._id })
	]);
})

packSchema.pre('save', ()=>{
	this.updated = Date.now();
});

packSchema.pre('validate', function(next) {
	if (this.isModified('created')) {
		this.invalidate('created');
	}
	next();
});

/** 
 * @return Array of Generator isa's representing the seed
 */
packSchema.virtual('seedArray').get(function() {
	return seedArray(this.seed);
});

/**
 * Searches through a nested universe to find the seed node
 * @param  {Object} tree The universe
 * @return {Object}      the node
 */
packSchema.methods.getSeedFromTree = function(tree){
	var seed = this.seedArray;
	var foundNode = tree;

	// if the seed doesn't match, just return the tree
	if(tree.isa !== seed[0])
		foundNode = tree;

	else {
		var currentNode = tree;
		for (var i = 1; i < seed.length; i++) {
			
			// node had no children, can't finish finding
			if(!currentNode.in) {
				foundNode = currentNode;
				break;
			}

			// search in children for next seed
			var found = false;
			for (var j = 0; j < currentNode.in.length; j++) {
				if(currentNode.in[j].isa === seed[i]){
					currentNode = currentNode.in[j];
					foundNode = currentNode;
					found = true;
					break;
				}
			}
			// can't find it, return what we have so far without going to next seed.
			if(!found) {
				foundNode = currentNode;
				break;
			}
		}// loop seed;
	}
	
	// save the style of the seed
	this.txt = foundNode.txt;
	this.cssClass = foundNode.cssClass;

	return foundNode;
}

/**
 * Check if seed is valid and get array of generators
 * @param  {string} seed       to check
 * @param  {BuiltPack} builtpack the built pack
 * @return {Object[]|boolean}            array of generators or false
 */
packSchema.methods.seedIsValid = function(seed, builtpack){
	var arr = seedArray(seed);
	var gens = []
	for(var i = 0; i < arr.length; i++){
		if(!builtpack.getGen(arr[i])){
			return false;
		}
		gens.push(builtpack.getGen(arr[i]));
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
		var newSeed = this.seed.replace(new RegExp(escapeRegExp(isaOld)+SEED_DELIM, "g"), escapeRegExp(isaNew)+SEED_DELIM);
		if(newSeed !== this.seed){
			this.seed = newSeed;
			await this.save();
		}
	}
}

function escapeRegExp(str) {
 	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
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
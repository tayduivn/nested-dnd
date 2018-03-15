const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var schema = Schema({
	_id: {
		type: Schema.Types.ObjectId
	},
	buildDate: {
		type: Date,
		default: Date.now
	},
	generators: { //map
		type: Schema.Types.Mixed,
		default: {}
	} 
});

schema.path('generators').get(function(value){
	return (!value) ? {} : value;
});

/**
 * Compiles all of the dependencies of a pack into a built version
 * @param  {Pack} pack the pack to build
 * @return {Promise<BuiltPack>}      the built pack
 * @async
 */
schema.statics.findOrBuild = async function(pack){
	var builtpack = await this.findById(pack._id).exec();
	if( builtpack ) return builtpack;
	
	const allPackIds = pack.dependencies.concat([pack.id]);
	var newBuiltPack = { _id: pack.id };
	var map = {};

	var gens = await this.model('Generator').find({ pack_id: { $in: allPackIds} }).exec();

	// no generators, create pack
	if(!gens || !gens.length){
		return await this.create(newBuiltPack);
	}

	// map array of generators to their unique names and sort by dependency order
	sortGensByPack(gens, allPackIds);
	gens.forEach((g) => {
		if(!map[g.isa])
			map[g.isa] = [];
		map[g.isa].push(g);
	});

	//make generators
	for(var isa in map){
		map[isa] = combineGenerators(map[isa])
	}

	newBuiltPack.generators = map;
	await this.create(newBuiltPack);
}

/**
 * This will push a new generator into the build without actually building it. Generator cannot have dependencies
 * @param  {Generator} gen the new generator to add
 */
schema.methods.pushGenerator = function(gen){
	if(gen.gen_ids && gen.gen_ids.length > 1){
		throw new Error("Cannot auto push new generator that has dependencies");
	}

	this.generators[gen.isa] = combineGenerators([gen]);
	this.markModified('generators.'+gen.isa)
}

/**
 * This will get all the depencies for a specific generator and rebuild it
 * @param  {string} isa  the isa name of the generator
 * @param  {Pack} pack the pack it belongs to
 */
schema.methods.rebuildGenerator = async function(isa, pack){
	if(!isa) throw new Error("isa is undefined");
	if(!pack) throw new Error("pack is undefined");

	var allPacks = pack.dependencies.concat([pack.id]);
	var query = {
		pack_id: { $in: allPacks}, 
		isa: isa
	};
	var gens = await this.model('Generator').find(query).exec();

	sortGensByPack(gens, allPacks);

	if(!this.generators)
		this.generators = {};

	this.generators[isa] = combineGenerators(gens);
	this.markModified('generators.'+isa)
	await this.save();
}

/**
 * Using this buildpack, it will generate 
 * @param  {Pack} seedArray array of isa's
 * @return {Object}           the grown tree of generated things to be passed to the user
 */
schema.methods.growFromSeed = function(pack){
	if(!pack.seed){
		var error = new Error("Seed is not defined");
		error.name = "Precondition Failed"
		throw error;
	}

	var gens = pack.seedIsValid(pack.seed, this.generators);
	if(!gens){
		throw new Error("Could not find seed "+pack.seed+" in built pack "+this._id);
	}
	return this.model('Generator').makeAsRoot(gens, this);
}

// ---------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------

/**
 * Sorts generators by a list of pack Ids
 * @param  {Generator[]} gens    an unsorted array of generators
 * @param  {string[]} packIds an array of pack id dependencies
 */
function sortGensByPack(gens, packIds){
	gens.sort(function(a, b){
		return packIds.indexOf(a.pack_id) - packIds.indexOf(b.pack_id);
	});
}

/**
 * Takes a bunch of generators and compiles them into one build
 * @param  {Generator[]} generators Generators to compile together
 * @return {Object}              a built version of the generators
 */
function combineGenerators(generators){
	var generator = null;
	var gen_ids = [];

	//loop dependencies and overwrite
	generators.forEach((d)=>{
		gen_ids.push(d._id);

		if(!generator) // first
			generator = d;
		else // combine 
			generator.set(d) 
	});

	//save to map
	generator = Object.assign({},generator._doc);
	generator.gen_ids = gen_ids;
	delete generator._id;
	delete generator.pack_id; 

	return generator;
}

module.exports = mongoose.model('BuiltPack', schema);

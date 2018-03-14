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
	if(!value)
		return {};
	return value;
});


// TODO: Validate seed during build

schema.statics.findOrBuild = async function(pack){
	var builtpack = await this.findById(pack._id).exec();
	if( builtpack ) { 
		return builtpack;
	}

	var newBuiltPack = {};
	newBuiltPack._id = pack.id;

	var allPacks = pack.dependencies.concat([pack.id]);

	var gens = await this.model('Generator').find({ pack_id: { $in: allPacks} }).exec();

	var map = {};

	// map array of generators to their unique names and sort by dependency order
	gens.sort(function(a, b){
		return allPacks.indexOf(a.pack_id) - allPacks.indexOf(b.pack_id);
	});
	gens.forEach((gen) => {
		if(!map[gen.isa]){
			map[gen.isa] = [];
		}
		map[gen.isa].push(gen);
	});

	//make geerators
	for(var isa in map){
		map[isa] = makeGenerator(map[isa])
	}

	newBuiltPack.generators = map;
	
	var builtpack = await this.create(newBuiltPack);

	return builtpack;
}


function makeGenerator(dependencies){
	var generator = null;
	var gen_ids = [];

	//loop dependencies and overwrite
	dependencies.forEach((d)=>{
		gen_ids.push(d._id);

		if(!generator) generator = d;
		else {
			// set style
			generator.set(d)
		};
	});

	//save to map
	generator = Object.assign({},generator._doc);

	// use array of generators, not id and pack
	generator.gen_ids = gen_ids;
	delete generator._id;
	delete generator.pack_id; 

	return generator;
}

/* Only use if absolutely certain does not have dependencies */
schema.methods.pushGenerator = function(gen){
	this.generators[gen.isa] = makeGenerator([gen]);
	this.markModified('generators.'+gen.isa)
}

schema.methods.rebuildGenerator = async function(isa, pack, done){
	if(!isa) throw new Error("isa is undefined");
	if(!pack) throw new Error("pack is undefined");

	var allPacks = pack.dependencies.concat([pack.id]);
	var query = {
		pack_id: { $in: allPacks}, 
		isa: isa
	};
	var gens = await this.model('Generator').find(query).exec();

	// sort gens by dependency order
	gens.sort(function(a, b){
		return allPacks.indexOf(a.pack_id) - allPacks.indexOf(b.pack_id);
	});

	if(!this.generators)
		this.generators = {};

	this.generators[isa] = makeGenerator(gens);
	this.markModified('generators.'+isa)
	this.save(done);

}

schema.methods.generateFromSeed = function(seedArray){

	var Generator = this.model('Generator');

	if(!seedArray || !seedArray.length){
		return { "error": "Missing seed" };
	}
	var gens = seedArray.map((isa)=>{
		var gen = this.generators[isa];
		if(!gen) { 
			throw new Error("Could not find seed generator that is a "+isa);
		};
		return gen;
	});

	var tree = Generator.generateAsSeed(gens, this);

	return tree;
}

// get build

module.exports = mongoose.model('BuiltPack', schema);

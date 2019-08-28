const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { sortGensByPack, combineGenerators } = require("./util");

var schema = Schema({
	_id: {
		type: Schema.Types.ObjectId
	},
	buildDate: {
		type: Date,
		default: Date.now
	},
	generators: {
		//map
		type: Schema.Types.Mixed,
		default: {}
	}
});

schema.path("generators").get(function(value) {
	return !value ? {} : value;
});

/**
 * This will push a new generator into the build without actually building it. Generator cannot have dependencies
 * @param  {Generator} gen the new generator to add
 */
schema.methods.pushGenerator = function(gen) {
	if (gen.gen_ids && gen.gen_ids.length > 1) {
		throw new Error("Cannot auto push new generator that has dependencies");
	}

	var BuiltPack = this.model("BuiltPack");

	const ISA = gen.isa;
	gen = combineGenerators([gen]);
	this.setGen(gen);
	BuiltPack.extend(ISA, this);

	this.markModified("generators." + ISA);
};

/**
 * Retrieve a generator with a specific isa name
 * @param  {string} isa what the generator is
 * @return {Generator}     the generator out of the map
 */
schema.methods.getGen = function(isa) {
	var gen = this.generators[isa];
	if (!gen) return undefined;

	// prevent extending itself
	if (gen.extendsPath && gen.extendsPath.includes(gen.isa)) gen.extends = undefined;

	// TODO: temporary cleanup
	if (!gen.gen_ids) gen.gen_ids = [gen._id];

	if (gen.toJSON || gen.model) {
		throw new Error("generator was not stored properly");
	}

	gen.isa = isa;
	return gen;
};

/**
 * Put a generator into the map, without duplicating isa name
 * @param  {Generator} generator the generator to push
 */
schema.methods.setGen = function(generator) {
	if (generator.toJSON) throw new Error("Cannot put raw generator object into builtpack");
	if (!generator.gen_ids) throw new Error("Must have gen_ids");

	var gen = Object.assign({}, generator);
	var isa = gen.isa;
	delete gen.isa;
	this.generators[isa] = gen;
};

/**
 * This will get all the depencies for a specific generator and rebuild it
 * @param  {string} isa  the isa name of the generator
 * @param  {Pack} pack the pack it belongs to
 */
// eslint-disable-next-line
schema.methods.rebuildGenerator = async function(isa, p) {
	const { Pack, Generator, BuiltPack } = this.db.models;
	let pack;

	if (!isa) throw new Error("isa is undefined");
	if (!p) {
		pack = await Pack.findById(this._id);
	} else {
		pack = p;
	}

	var allPacks = pack.dependencies.concat([pack.id]);
	var query = {
		pack: { $in: allPacks },
		isa: isa
	};
	var gens;
	if (this.RAW_GENS) {
		gens = this.RAW_GENS.filter(g => g.isa === isa);
	} else gens = await Generator.find(query).exec();

	sortGensByPack(gens, allPacks);

	if (!this.generators) this.generators = {};

	var combined = combineGenerators(gens);
	const oldGen = this.getGen(isa);
	combined.isa = isa;
	combined.extendsThis = oldGen ? oldGen.extendsThis || [] : [];
	this.setGen(combined);

	BuiltPack.extend(isa, this);

	this.markModified("generators." + isa);

	// recurse to build things that extend this
	combined.extendsThis.forEach(e => {
		this.rebuildGenerator(e, pack);
	});
};

/**
 * Using this buildpack, it will generate
 * @param  {Pack} seedArray array of isa's
 * @return {Promise<Nested>} the grown tree of generated things to be passed to the user
 */
schema.methods.growFromSeed = function(pack) {
	if (!pack.seed) {
		var error = new Error("Seed is not defined");
		error.status = 412;
		throw error;
	}

	var gens = pack.seedIsValid(pack.seed, this);
	if (!gens || !gens.length) {
		throw new Error("Could not find seed " + pack.seed + " in built pack " + this._id);
	}
	return this.model("Generator").makeAsRoot(gens, this);
};

module.exports = mongoose.model("BuiltPack", schema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { Generator } = require("./generator");

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

schema.statics.rebuild = async function(pack) {
	var id = typeof pack === "string" ? pack : pack._id;
	var builtpack = await this.findById(id).exec();
	return await this.build(pack, builtpack);
};

schema.statics.findOrBuild = async function(pack) {
	debugger;
	var id = typeof pack === "string" ? pack : pack._id;
	var builtpack = await this.findById(id).exec();
	if (builtpack) return builtpack;

	return await this.build(pack, builtpack);
};

/**
 * Compiles all of the dependencies of a pack into a built version
 * @param  {Pack} pack the pack to build
 * @return {Promise<BuiltPack>}      the built pack
 * @async
 */
schema.statics.build = async function(pack, builtpack) {
	var id = typeof pack === "string" ? pack : pack._id;

	if (typeof pack === "string") {
		pack = await this.model("Pack").findById(id);
	}

	if (!pack.dependencies) pack.dependencies = [];

	const allPackIds = pack.dependencies.concat([pack.id]);
	const gens = await this.model("Generator")
		.find({ pack: { $in: allPackIds } })
		.exec();
	const isNew = !builtpack;
	var map = {};

	if (isNew) {
		const BuiltPack = this.db.models.BuiltPack;
		builtpack = new BuiltPack({ _id: pack.id });

		// no generators, create pack
		if (!gens || !gens.length) {
			const bp = await this.create(builtpack);
			bp.originalGen = [];
			return bp;
		}
	}

	// map array of generators to their unique names and sort by dependency order
	sortGensByPack(gens, allPackIds);
	gens.forEach(g => {
		if (!map[g.isa]) map[g.isa] = [];
		map[g.isa].push(g);
	});

	//make generators
	for (var isa in map) {
		map[isa] = combineGenerators(map[isa]);
	}

	builtpack.generators = map;
	builtpack.RAW_GENS = gens; // shouldn't save to the DB

	//process extends
	for (var isa in map) {
		this.extend(isa, builtpack);
	}

	const bp = isNew ? await this.create(builtpack) : await builtpack.save();
	bp.originalGen = gens;
	return bp;
};

schema.statics.extend = function(isa, builtpack, extendsThis = []) {
	var genData = builtpack.getGen(isa);
	if (!genData) return [];

	// already extended
	if (genData.extendsPath !== undefined) {
		genData.extendsThis = (genData.extendsThis || []).concat(extendsThis);
		builtpack.setGen(genData);
		return genData.extendsPath.concat([]); // send back a copy so not modified
	}

	const Generator = this.db.models.Generator;
	var generator = new Generator(genData);

	var extendsPath = [];

	if (
		generator.extends &&
		!extendsThis.includes(generator.extends) &&
		!extendsThis.includes(generator.isa) // prevent infinite looping
	) {
		// extend parent
		extendsPath = this.extend(generator.extends, builtpack, [isa]);

		// trying to extend something that extends this
		if (extendsPath.includes(generator.extends)) {
			generator.extends = undefined;
		} else {
			// it's all good, do the extend
			extendsPath.push(generator.extends);
			generator = generator.extend(builtpack);
		}
	}

	if (generator && generator.toJSON) generator = Object.assign({}, generator.toJSON());

	generator.extendsPath = extendsPath;
	generator.extendsThis = (genData.extendsThis || []).concat(extendsThis);
	generator._id = genData._id;
	generator.gen_ids = genData.gen_ids;
	builtpack.setGen(generator);

	return extendsPath.concat([]); // send back a copy so not modified
};

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

	var final = this.getGen(ISA);

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
 * @param  {Generator} the generator to push
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
schema.methods.rebuildGenerator = async function(isa, pack) {
	const { Pack, Generator, BuiltPack } = this.db.models;

	if (!isa) throw new Error("isa is undefined");
	if (!pack) {
		pack = await Pack.findById(this._id);
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
 * @return {Promise<Nested>}           the grown tree of generated things to be passed to the user
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

// ---------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------

/**
 * Sorts generators by a list of pack Ids
 * @param  {Generator[]} gens    an unsorted array of generators
 * @param  {string[]} packIds an array of pack id dependencies
 */
function sortGensByPack(gens, packIds) {
	gens.sort(function(a, b) {
		return packIds.indexOf(a.pack) - packIds.indexOf(b.pack);
	});
}

/**
 * Takes a bunch of generators and compiles them into one build
 * @param  {Generator[]} generators Generators to compile together
 * @return {Object}              a built version of the generators
 */
function combineGenerators(generators) {
	var generator = new Generator();
	var gen_ids = [];

	//loop dependencies and overwrite
	generators.forEach(d => {
		gen_ids.unshift(d._id);

		if (!generator)
			// first
			generator = d;
		// combine
		else generator.set(d);
	});

	//save to map
	generator = Object.assign({}, generator.toJSON());
	generator.gen_ids = gen_ids;
	delete generator._id;
	delete generator.pack;

	return generator;
}

module.exports = mongoose.model("BuiltPack", schema);

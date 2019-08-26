const BuiltPack = require("./BuiltPack");
const Pack = require("../pack/Pack");
const Generator = require("../generator/Generator");

const { sortGensByPack, combineGenerators } = require("./util");

const rebuild = async function(pack) {
	var id = typeof pack === "string" ? pack : pack._id;
	var builtpack = await BuiltPack.findById(id).exec();
	return await build(pack, builtpack);
};

const findOrBuild = async function(pack) {
	var id = typeof pack === "string" ? pack : pack._id;
	var builtpack = await BuiltPack.findById(id).exec();
	if (builtpack) return builtpack;

	return await build(pack, builtpack);
};

/**
 * Compiles all of the dependencies of a pack into a built version
 * @param  {Pack} pack the pack to build
 * @return {Promise<BuiltPack>}      the built pack
 * @async
 */
//eslint-disable-next-line
const build = async function(p, builtpack) {
	var id = typeof p === "string" ? p : p._id;
	let pack;

	if (typeof pack === "string") {
		pack = await Pack.findById(id).exec();
	}

	if (!pack.dependencies) pack.dependencies = [];

	const allPackIds = pack.dependencies.concat([pack.id]);
	const gens = await Generator.find({ pack: { $in: allPackIds } }).exec();
	const isNew = !builtpack;
	var map = {};

	if (isNew) {
		builtpack = new BuiltPack({ _id: pack.id });

		// no generators, create pack
		if (!gens || !gens.length) {
			const bp = await BuiltPack.create(builtpack);
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
	for (var is in map) {
		extend(is, builtpack);
	}

	const bp = isNew ? await BuiltPack.create(builtpack) : await builtpack.save();
	bp.originalGen = gens;
	return bp;
};

// eslint-disable-next-line
function extend(isa, builtpack, extendsThis = []) {
	var genData = builtpack.getGen(isa);
	if (!genData) return [];

	// already extended
	if (genData.extendsPath !== undefined) {
		genData.extendsThis = (genData.extendsThis || []).concat(extendsThis);
		builtpack.setGen(genData);
		return genData.extendsPath.concat([]); // send back a copy so not modified
	}

	var generator = new Generator(genData);

	var extendsPath = [];

	if (
		generator.extends &&
		!extendsThis.includes(generator.extends) &&
		!extendsThis.includes(generator.isa) // prevent infinite looping
	) {
		// extend parent
		extendsPath = extend(generator.extends, builtpack, [isa]);

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
}

module.exports = {
	findOrBuild,
	rebuild
};

const { Generator } = require("../../models/generator");
const BuiltPack = require("../../models/builtpack");

/**
 * Gets a generator by ID
 * @param  {string} id the id
 * @return {Generator}   the generator
 */
async function getById(id) {
	var gen = await Generator.findById(id);
	if (!gen) {
		var err = new Error("Couldn't find generator " + id);
		err.status = 404;
		err.data = { id };
		throw err;
	}
	return gen;
}

/**
 * Gets a generator by isa
 * @param  {string} isa  the isa name
 * @param  {Pack} the current pack
 * @return {Generator}   the generator
 */
async function getByIsa(isa, pack) {
	var builtpack = await BuiltPack.findOrBuild(pack);
	var gen = builtpack.getGen(isa);

	if (!gen) {
		var err = new Error("Can't find a generator that is a " + isa);
		err.status = 404;
		err.data = {
			pack,
			builtpack
		};
		throw err;
	}

	return { gen, builtpack };
}

module.exports = { getById, getByIsa };

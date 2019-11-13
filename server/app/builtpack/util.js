const Generator = require("../generator/Generator");

// ---------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------

/**
 * Sorts generators by a list of pack Ids
 * @param  {Generator[]} gens    an unsorted array of generators
 * @param  {ObjectId[] || string[]} packIds an array of pack id dependencies
 * @return the sorted gens
 */
function sortGensByPack(gens = [], packIds) {
	if (!packIds.length) throw Error("Need at least one packId");
	if (typeof packIds[0] !== "string") {
		packIds = packIds.filter(id => id).map(id => id.toString());
	}

	gens.sort(function(a, b) {
		const aPack = typeof a.pack !== "string" ? a.pack.toString() : a.pack;
		const bPack = typeof b.pack !== "string" ? b.pack.toString() : b.pack;
		return packIds.indexOf(aPack) - packIds.indexOf(bPack);
	});

	return gens;
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
		// store the id
		gen_ids.unshift(d._id);
		generator.set(d);
	});

	//save to map
	generator = generator.toJSON();
	generator.gen_ids = gen_ids;
	delete generator._id;
	delete generator.pack;

	return generator;
}

module.exports = {
	sortGensByPack,
	combineGenerators
};

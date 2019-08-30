const Generator = require("../generator/Generator");

// ---------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------

/**
 * Sorts generators by a list of pack Ids
 * @param  {Generator[]} gens    an unsorted array of generators
 * @param  {string[]} packIds an array of pack id dependencies
 */
function sortGensByPack(gens = [], packIds) {
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

const Instance = require("./Instance");

const { getUniverseExplore } = require("../universe/query");

async function getInstanceByIndex(univ, index, user_id) {
	return await Instance.aggregate([
		{
			$match: { univ, n: index }
		}
	]);
}

async function getInstanceFromUniverse(univ, user_id) {
	let universe = await getUniverseExplore(univ, user_id);

	// get rid of the duplicate $last result
	const instance = universe.upArray[universe.upArray.length - 1];
	universe.upArray.splice(universe.upArray.length - 1, 1);
	universe.inArray.splice(universe.inArray.length - 1, 1);
	instance.universe = {
		...universe,
		array: [...universe.inArray, ...universe.upArray],
		inArray: undefined,
		upArray: undefined
	};

	return instance;
}

module.exports = { getInstanceByIndex, getInstanceFromUniverse };

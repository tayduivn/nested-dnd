const getAncestors = (startWith = "$last", fieldName = "ancestors") => [
	{
		$graphLookup: {
			from: "instances",
			startWith: startWith,
			connectFromField: "up",
			connectToField: "_id",
			as: fieldName
		}
	}
];

const getAncestorsAndDescendents = (ancStart = "$last", descStart = "$last", maxDepth = 2) => [
	...getAncestors(ancStart),
	{
		$graphLookup: {
			from: "instances",
			startWith: descStart,
			connectFromField: "in",
			connectToField: "_id",
			as: "inArr",
			maxDepth: maxDepth
		}
	}
];

module.exports = { getAncestors, getAncestorsAndDescendents };

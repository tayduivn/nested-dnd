const deepmerge = require("deepmerge");

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

const merge = (dest, src) => {
	return deepmerge(dest, src, { arrayMerge: overwriteMerge });
};

module.exports = merge;

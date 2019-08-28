import deepmerge from "deepmerge";

/*
const arrayMerge = (destinationArray, sourceArray, options) => {
	const newArr = [...destinationArray];

	sourceArray.forEach((item, i) => {
		newArr[i] = item;
	});

	return newArr;
};*/

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

const merge = (dest, src) => {
	return deepmerge(dest, src, { arrayMerge: overwriteMerge });
};
export default merge;

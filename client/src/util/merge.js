import deepmerge from "deepmerge";

const arrayConcat = (destinationArray, sourceArray) => {
	return [...destinationArray, ...sourceArray];
};

const arrayIndex = (destinationArray, sourceArray, options) => {
	const newArr = [...destinationArray];

	sourceArray.forEach((item, i) => {
		newArr[i] = item;
	});

	return newArr;
};

const overwrite = (destinationArray, sourceArray) => sourceArray;

const merge = (dest, src) => {
	return deepmerge(dest, src, { arrayMerge: overwrite });
};
export function mergeAtIndex(dest, src) {
	return deepmerge(dest, src, { arrayMerge: arrayIndex });
}
export function mergeConcat(dest, src) {
	return deepmerge(dest, src, { arrayMerge: arrayConcat });
}

export default merge;

const { normalizePacks } = require("../pack/normalize");

function normalizeInstance(inst) {
	const result = {
		data: {
			type: "Instance",
			id: inst._id.toString(),
			attributes: { ...inst, _id: undefined, __v: undefined }
		},
		included: []
	};
	if (inst.universe) {
		const { data, included } = normalizeUniverse(inst.universe);
		delete inst.universe;
		result.included.push(data, ...included);
	}
	return result;
}

function normalizeUniverses(list = []) {
	const result = {
		data: [],
		included: []
	};

	result.data = list.map(u => {
		// push the pack name into the dependencies for display
		const { data, included } = normalizeUniverse(u);
		result.included.push(...included);
		return data;
	});

	return result;
}

const normalizeArray = ({ array }) => {
	if (!array) return { array: [], includedInst: [] };

	const includedInst = [];

	const newArray = array.reduce((obj, inst) => {
		obj[inst.n] = inst._id.toString();
		includedInst.push(normalizeInstance(inst).data);
		return obj;
	}, {});

	return { array: newArray, includedInst };
};

function normalizeUniverse(universe) {
	let u = universe.toJSON ? universe.toJSON() : universe;
	const result = {
		data: {
			type: "Universe",
			id: u._id,
			attributes: u
		},
		included: []
	};
	delete result.data.attributes._id;
	delete result.data.attributes.__v;

	// todo favorites

	let { data, included } = normalizePacks(u.packs);
	result.included.push(...data);
	result.included.push(...included);
	delete u.packs;

	const { newArray, includedInst } = normalizeArray(u);
	u.array = newArray;
	result.included.push(...includedInst);

	return result;
}

module.exports = {
	normalizeUniverse,
	normalizeUniverses,
	normalizeInstance
};

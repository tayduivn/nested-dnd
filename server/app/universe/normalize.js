const { normalizePacks, normalizePack } = require("../pack/normalize");

function normalizeInstances(list = []) {
	if (!list.map) {
		throw Error("Something has gone wrong - normalizeInstances only accepts an array as a param.");
	}
	const result = {
		data: [],
		included: []
	};

	result.data = list.map(instance => {
		// push the pack name into the dependencies for display
		const { data, included } = normalizeInstance(instance);
		result.included.push(...included);
		return data;
	});

	return result;
}

/**
 * Expects a POJO to be passed
 * @param {Object} inst
 */
// eslint-disable-next-line max-statements, complexity
function normalizeInstance(inst) {
	if (!inst) return null;

	if (!inst._id) {
		const e = new Error("HELP: why does this instance not have an id?");
		console.error(e);
		return null;
	}

	const pojo = inst.toJSON ? inst.toJSON() : inst;
	const result = {
		data: {
			type: "Instance",
			id: inst._id.toString(),
			attributes: { ...pojo, _id: undefined, __v: undefined }
		},
		included: []
	};

	if (inst.universe) {
		const { data, included } = normalizeUniverse(inst.universe);
		result.included.push(data, ...included);
		delete result.data.attributes.universe;
	}
	if (inst.pack) {
		const { data, included } = normalizePack(inst.pack);
		result.included.push(data, ...included);
		delete result.data.attributes.pack;
	}
	if (inst.parent) {
		const { data, included } = normalizeInstance(inst.parent);
		result.included.push(data, ...included);
		delete result.data.attributes.parent;
	}

	function processInstances(attribute) {
		if (!inst[attribute]) return;
		const { data, included } = normalizeInstances(inst[attribute]);
		result.included.push(...data, ...included);
		delete result.data.attributes[attribute];
	}
	processInstances("inArr");
	processInstances("descendents");
	processInstances("ancestors");
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

function normalizeUniverse(u) {
	if (!u) return;

	const pojo = u.toJSON ? u.toJSON() : u;
	const result = {
		data: {
			type: "Universe",
			id: u._id,
			attributes: { ...pojo, __v: undefined, _id: undefined }
		},
		included: []
	};

	// todo favorites

	if (u.packs) {
		let { data, included } = normalizePacks(u.packs);
		result.included.push(...data);
		result.included.push(...included);
		delete u.packs;
	}

	const { newArray, includedInst } = normalizeArray(u);
	u.array = newArray;
	result.included.push(...includedInst);

	return result;
}

module.exports = {
	normalizeUniverse,
	normalizeUniverses,
	normalizeInstance,
	normalizeInstances
};

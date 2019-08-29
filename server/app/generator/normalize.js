function normalizeGenerators(list = []) {
	const result = {
		data: [],
		included: []
	};

	result.data = list.map(item => {
		// push the pack name into the dependencies for display
		const { data, included } = normalizeGenerator(item);
		result.included.push(...included);
		return data;
	});

	return result;
}

function normalizeGenerator(generator) {
	let result = {
		data: {
			type: "Generator",
			id: generator._id,
			attributes: { ...generator, _id: undefined, __v: undefined }
		},
		included: []
	};
	return result;
}

module.exports = { normalizeGenerators };

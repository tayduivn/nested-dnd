function normalizeTables(list = []) {
	const result = {
		data: [],
		included: []
	};

	result.data = list.map(item => {
		// push the pack name into the dependencies for display
		const { data, included } = normalizeTable(item);
		result.included.push(...included);
		return data;
	});

	return result;
}

function normalizeTable(table) {
	const pojo = table.toJSON ? table.toJSON() : table;
	let result = {
		data: {
			type: "Table",
			id: table._id,
			attributes: { ...pojo, _id: undefined, __v: undefined }
		},
		included: []
	};
	return result;
}

module.exports = {
	normalizeTables,
	normalizeTable
};

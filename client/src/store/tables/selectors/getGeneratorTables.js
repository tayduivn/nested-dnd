export default function getGeneratorTables(state, allTables = []) {
	const tables = {};
	allTables.forEach(id => {
		const table = state.tables.byId[id];

		if (table && table.returns === "generator") tables[id] = table;
	});
	return tables;
}

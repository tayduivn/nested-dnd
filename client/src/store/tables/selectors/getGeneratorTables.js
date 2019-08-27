export default function getGeneratorTables(state, builtpack) {
	const tables = [];
	if (!builtpack || !builtpack.tables) return tables;
	builtpack.tables.forEach(id => {
		const table = state.tables.byId[id];

		if (table && table.returns === "generator") tables.push(table);
	});
	return tables;
}

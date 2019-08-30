import { getGeneratorTables } from "store/tables";

export default function getIsaOptions(state, pack_id) {
	const { generators = [], tables = [] } = state.packs.options[pack_id] || {};
	const tablesFiltered = getGeneratorTables(state, tables);
	const genOpts = generators.map(g => ({ label: g, value: g }));
	const tableOpt = [];
	let table_id;
	for (table_id in tablesFiltered) {
		const t = tablesFiltered[table_id];
		tableOpt.push({ label: t.title, value: table_id, table: true });
	}
	return genOpts.concat(tableOpt);
}

import { getGeneratorTables } from "store/tables";

export default function getIsaOptions(state, builtpack = {}) {
	const tables = getGeneratorTables(state, builtpack);
	const gens = builtpack.generators || {};
	const genOpts = Object.keys(gens)
		.sort()
		.map(g => ({ label: g, value: g }));
	const tableOpt = tables.map(t => ({ label: t.title, value: `${t._id}`, table: true }));
	return genOpts.concat(tableOpt);
}

import { getGeneratorTables } from "store/tables";

export default function getIsaOptions(state, pack = {}) {
	const tables = getGeneratorTables(state, pack.tables || []);
	const gens = pack.generators || [];
	const genOpts = gens.map(g => ({ label: g, value: g }));
	const tableOpt = tables.map(t => ({ label: t.title, value: `${t._id}`, table: true }));
	return genOpts.concat(tableOpt);
}

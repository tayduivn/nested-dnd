const Table = require("../Table");
async function getTables(pack) {
	const allPackIds = pack.dependencies.concat([pack.id]);
	var tables = await Table.find({ pack: { $in: allPackIds } }, "title _id pack returns").exec();
	tables.sort((a, b) => a.title.localeCompare(b.title));
	const packTables = [];
	const tablesById = {};
	const tableIds = tables.map(t => {
		if (t.pack.toString() === pack.id) packTables.push(t._id);
		tablesById[t._id] = t;
		return t._id;
	});
	return { tableIds, tablesById, packTables };
}
module.exports = { getTables };

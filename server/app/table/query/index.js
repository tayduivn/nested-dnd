const debug = require("debug")("app:table:query");
const Table = require("../Table");
const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectId;
const processFlat = require("util/processFlat");

const deleteTablesByUser = async id => {
	await Table.deleteMany({ user_id: id }).exec();
};

const findTableRecurse = async (ids, alreadyFoundTable = new Set()) => {
	const _ids = Array.from(ids).map(str => ObjectId(str));

	debug("STARTING  Table.aggregate --- findTableRecurse");
	const array = await Table.aggregate([
		{ $match: { _id: { $in: _ids } } },
		{
			$graphLookup: {
				from: "tables",
				startWith: "rows.value",
				connectFromField: "rows.value",
				connectToField: "_id",
				as: "tables"
			}
		}
	]);
	debug("DONE      Table.aggregate --- findTableRecurse");

	if (!array.length) return [];
	const tables = array;

	_ids.map(i => alreadyFoundTable.add(i.toString()));
	tables.forEach(t => {
		tables.push(...t.tables);
		delete t.tables;
	});
	tables.map(({ _id }) => alreadyFoundTable.add(_id.toString()));

	const toFindTables = new Set();
	processFlat(tables, alreadyFoundTable, new Set(), new Set(), toFindTables);

	// recurse
	if (toFindTables.size > 0) {
		const newTables = await findTableRecurse(toFindTables, alreadyFoundTable);
		tables.push(...newTables);
	}

	return tables || [];
};

module.exports = {
	deleteTablesByUser,
	findTableRecurse
};

const router = require("express").Router();

const MW = require("../../util/middleware");
const BuiltPack = require("../../builtpack/BuiltPack");
const Table = require("../../table/Table");

const { stringify, normalUniverseResponse, setLastSaw } = require("../../util");

const { getInstanceByIndex, getInstanceFromUniverse } = require("../../instance/query");
const { normalizeInstance } = require("../../universe/normalize");

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

router.get("/:universe/:index?", async (req, res, next) => {
	try {
		if (req.params.index) {
			const dbResult = await getInstanceByIndex(
				req.params.universe,
				req.params.index,
				req.user._id
			);
			res.json(normalizeInstance(dbResult));
		} else {
			const dbResult = await getInstanceFromUniverse(req.params.universe, req.user._id);
			res.json(normalizeInstance(dbResult));
		}
	} catch (e) {
		next(e);
	}

	/*
		// generate if we need to
		.getNested(sentIndex, req.universe.pack)
		.then(async nested => {
			const index = setLastSaw(nested.index, req.universe);
			const firstBatch = normalUniverseResponse(req.universe, index);
			const pack = req.universe.pack;

			// send the first batch to display crucial info
			res.write(stringify("Instance", firstBatch));

			// send the whole universe
			res.write(stringify("Universe", { ...req.universe.toObject(), pack: pack.id }));

			// send pack metadata
			res.write(stringify("Pack", pack.toObject()));

			const builtpack = await BuiltPack.findOrBuild(pack);

			// get tables
			const { tablesById, tableIds, packTables } = await getTables(pack);

			const result = {
				...pack.toObject(),
				builtpack: { ...builtpack.toObject(), tables: tableIds },
				tables: packTables
			};
			res.write(stringify("Pack", result));
			res.write(stringify("Table", tablesById));

			res.end();
		})
		.catch(next);*/
});

router.get("/:universe/:index/lite", (req, res, next) => {
	req.universe
		// generate if we need to
		.getNested(req.params.index, req.universe.pack)
		.then(nested => {
			req.universe.save();
			const index = nested.index;
			const firstBatch = normalUniverseResponse(req.universe, index);

			// send the first batch to display crucial info
			res.write(stringify("Instance", firstBatch));

			res.end();
		})
		.catch(next);
});

module.exports = router;

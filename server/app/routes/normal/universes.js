const router = require("express").Router();

const MW = require("../middleware");
const { BuiltPack, Table } = require("../../models");
// const Nested = require("../packs/nested");

const { stringify, normalUniverseResponse, setLastSaw } = require("./utils");

router.use("/:universe", MW.ownsUniverse);

router.get("/:universe/explore/:index?", (req, res, next) => {
	const sentIndex = req.params.index !== undefined ? req.params.index : req.universe.lastSaw;
	req.universe
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
			var tables = await Table.find({ pack: pack.id }).exec();
			tables.sort((a, b) => a.title.localeCompare(b.title));

			const result = { ...pack.toObject(), builtpack, tables };
			res.write(stringify("Pack", result));

			res.end();
		})
		.catch(next);
});

router.get("/:universe/explore/:index/lite", (req, res, next) => {
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

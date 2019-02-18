const router = require("express").Router();

const MW = require("../middleware");
const Universe = require("../../models/universe");
const { stringify, normalUniverseResponse, setLastSaw } = require("./utils");

router.get("/:url/:index?", MW.canViewPack, async (req, res, next) => {
	Universe.getTemp(req.sessionID, req.pack, req.params.index)
		.then(async universe => {
			const index = setLastSaw(req.params.index, universe);
			const firstBatch = normalUniverseResponse(universe, index);

			const meta = {
				universeId: universe._id,
				packId: req.pack._id,
				packUrl: req.params.url
			};

			res.write(stringify("Pack", req.pack.toObject(), meta));

			// send the metatdata about the universe
			const metaUni = universe.toObject();
			delete metaUni.array;
			res.write(stringify("Universe", metaUni, meta));

			// send the first batch to display crucial info
			res.write(stringify("Instance", firstBatch, meta));

			// send the whole universe
			res.write(stringify("Universe", universe.toObject(), meta));

			await universe.save();
			res.end();
		})
		.catch(next);
});

// only give me the node, not everything else
router.get("/:url/:index/lite", MW.canViewPack, async (req, res, next) => {
	Universe.getTemp(req.sessionID, req.pack, req.params.index)
		.then(async universe => {
			const index = setLastSaw(req.params.index, universe);
			const firstBatch = normalUniverseResponse(universe, index);

			// send the first batch to display crucial info
			res.write(stringify("Instance", firstBatch, { universeId: universe._id }));

			await universe.save();

			res.end();
		})
		.catch(next);
});

module.exports = router;

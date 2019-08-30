const router = require("express").Router();
const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectId;

const MW = require("../../util/middleware");
const Maker = require("generator/util/make");

const { stringify, normalUniverseResponse } = require("util");
const { getInstanceFromUniverse, createInstancesFromNested } = require("instance/query");
const getInstanceByIndex = require("instance/query/getInstanceByIndex");
const { normalizeInstance } = require("universe/normalize");
const makeBuiltpack = require("builtpack/makeBuiltpack");
const { NOT_FOUND } = require("util/status");

// eslint-disable-next-line max-statements
router.get("/:universe/:index?", MW.isLoggedIn, async (req, res, next) => {
	try {
		const universe_id = ObjectId(req.params.universe);
		const index = parseInt(req.params.index, 10);
		let dbResult;

		if (req.params.index) {
			dbResult = await getInstanceByIndex(universe_id, index, req.user._id);
		}

		// either we provided no index or it doesn't exit
		if (!dbResult) {
			dbResult = await getInstanceFromUniverse(req.params.universe, req.user._id);
		}

		let { instance, generators, tables, pack, universe, ancestorData } = dbResult;

		if (!instance) {
			res.status(NOT_FOUND).json({});
			return;
		}

		// we need to generate the children of this
		let descendents = [];
		if (dbResult.todo) {
			const builtpack = makeBuiltpack(pack, generators);
			const maker = new Maker({ builtpack, tables });
			let generator = builtpack.getGen(instance.isa);
			const nested = maker.make(generator, 1, instance, ancestorData);

			instance.set("todo", false);
			const { parent, instances } = await createInstancesFromNested(
				nested.TEMP_IN,
				instance,
				universe
			);
			instance.in = parent.in;
			descendents = instances;
		}

		if (instance.toJSON) instance = instance.toJSON();

		const result = { pack, universe, generators, tables, descendents, ...instance };
		res.json(normalizeInstance(result));
	} catch (e) {
		next(e);
	}
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

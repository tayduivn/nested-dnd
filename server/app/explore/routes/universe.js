const router = require("express").Router();
const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectId;

const MW = require("../../util/middleware");
const Maker = require("generator/util/make");

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
			dbResult = await getInstanceFromUniverse(universe_id, req.user._id);
		}

		let { instance, generators, tables, pack, universe, ancestorData, ancestors = [], descendents = [] } = dbResult;

		if (!instance) {
			res.status(NOT_FOUND).json({});
			return;
		}

		// we need to generate the children of this
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

		instance.pack = pack;
		instance.universe = universe;
		instance.generators = generators;
		instance.tables = tables;
		instance.descendents = descendents;
		instance.ancestors= ancestors;
		res.json(normalizeInstance(instance));
	} catch (e) {
		next(e);
	}
});

module.exports = router;

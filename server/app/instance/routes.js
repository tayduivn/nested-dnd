/* eslint-disable max-statements */
const debug = require("debug")("app:unverse:routes:instances");
const router = require("express").Router({ mergeParams: true });
const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectId;

const MW = require("util/middleware");
const Maker = require("generator/util/make");

const { normalizeInstance } = require("../universe/normalize");
const {
	createInstance,
	createInstancesFromNested,
	updateInstance,
	deleteInstance,
	moveInstance
} = require("instance/query");
const getBuiltGen = require("universe/query/getBuiltGen");
const makeBuiltpack = require("builtpack/makeBuiltpack");
const { NOT_FOUND } = require("util/status");

/**
 * Update multiple instances
 */
router.put("/", MW.ownsUniverse, async (req, res) => {
	const tasks = req.body;
	const universe_id = req.universe._id;
	let bulkChanges = false;
	const results = [];

	async function processBulkChange(index) {
		let { instance_id, changes } = bulkChanges;
		instance_id = ObjectId(instance_id);
		const instance = await updateInstance(universe_id, instance_id, changes);
		if (!instance) {
			results[index] = {
				meta: { action: "CHANGE" },
				errors: [{ id: { instance_id, universe_id }, title: "Not found", status: NOT_FOUND }]
			};
		} else results[index] = { meta: { action: "CHANGE" }, ...normalizeInstance(instance) };
	}

	for (let index = 0; index < tasks.length; index++) {
		const task = tasks[index];
		let { instance_id, changes } = task;
		instance_id = ObjectId(instance_id);

		// move!
		if (changes.up) {
			const newUp = parseInt(changes.up, 10);
			const { instance, newParent, oldParent } = await moveInstance(
				universe_id,
				instance_id,
				newUp
			);
			// should 404
			if (!instance) {
				results[index] = {
					meta: { action: "MOVE" },
					errors: [{ id: { instance_id, universe_id }, title: "Not found", status: NOT_FOUND }]
				};
				continue;
			}
			instance.parent = newParent;
			instance.instances = [oldParent];
			results[index] = { meta: { action: "MOVE" }, ...normalizeInstance(instance) };
			continue;
		}

		// we haven't stored any bulk changes yet, so push it in and loop
		if (!bulkChanges) {
			bulkChanges = task;
			results[index] = { meta: { status: "bulked" } };
			continue;
		}

		// the instance_id is different, so we should send our bulk changes
		// we have to store the instance_id as a string in bulkChanges so this comparison works
		if (bulkChanges.instance_id !== task.instance_id) {
			await processBulkChange(index - 1);

			// send this task in for next time
			// eslint-disable-next-line require-atomic-updates
			bulkChanges = task;
			return;
		}

		// same instance_id, merge into changes
		bulkChanges = { ...bulkChanges, changes };
	}

	// at the end of the loop, process any remaining changes
	if (bulkChanges) {
		await processBulkChange(tasks.length - 1);
	}

	res.send(results);
});

router.delete("/:instance", MW.ownsUniverse, async (req, res) => {
	const results = await deleteInstance(ObjectId(req.params.instance), req.universe._id);
	res.send({ meta: results });
});

/**
 * Make a new node
 */
// eslint-disable-next-line max-statements
router.post("/:instance", async (req, res, next) => {
	debug(`STARTING  POST ${req.url}`);
	try {
		// TODO: verify the instance actually exists
		const up_id = ObjectId(req.params.instance);
		const universe_id = ObjectId(req.params.universe);

		// this has a unique name, so just push it in and go
		if (req.body.name) {
			const newInst = await createInstance(universe_id, req.user._id, up_id, {
				name: req.body.name
			});
			if (!newInst) {
				return res.json({ errors: [{ status: NOT_FOUND, id: { universe_id, up_id } }] });
			}
			const normal = normalizeInstance(newInst);
			return res.json(normal);
		}

		// make a new node by generator isa
		else if (req.body.isa) {
			const {
				pack,
				generators,
				tables,
				toFindIsas,
				alreadyFoundTable,
				alreadyFoundIsa,
				up,
				ancestors,
				universe,
				ancestorData
			} = await getBuiltGen(universe_id, req.user._id, up_id, [req.body.isa]);
			// generate children
			if (toFindIsas.size) {
				debug(`Second round of isas: ${Array.from(toFindIsas)}`);
				const inArrResult = await getBuiltGen(
					universe_id,
					req.user._id,
					up_id,
					Array.from(toFindIsas),
					alreadyFoundIsa,
					alreadyFoundTable
				);
				generators.push(...inArrResult.generators);
				tables.push(...inArrResult.tables);
			}

			const builtpack = makeBuiltpack(pack, generators);
			const maker = new Maker({ builtpack, tables });
			const nested = maker.make(builtpack.getGen(req.body.isa), 1, undefined, ancestorData);

			// make sure the result has any additional options passed in the request
			const TEMP_IN = nested.TEMP_IN;
			const requestedValues = {...req.body};
			delete requestedValues.isa;
			nested.set(requestedValues);
			nested.TEMP_IN = TEMP_IN;
			
			const { parent, instances } = await createInstancesFromNested([nested], up, universe);

			debug(`DONE      POST ${req.url}`);
			const currentInstance = instances[0].toJSON();
			currentInstance.parent = parent;
			currentInstance.descendents = [...instances.slice(1)];
			currentInstance.ancestors = ancestors.filter(anc => !anc._id.equals(parent._id));
			return res.json(normalizeInstance(currentInstance));
		} else if (req.body.table) {
			return res.json({});
		}
	} catch (e) {
		next(e);
	}
});

module.exports = router;

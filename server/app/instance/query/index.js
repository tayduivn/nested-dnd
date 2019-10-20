const debug = require("debug")("app:instance:query");
const Instance = require("../Instance");
const Universe = require("universe/Universe");

const { getUniverseExplore, allocateSpaceForNewInstances } = require("universe/query");

/**
 * From a universe id, get the initial view of the universe.
 * @param {ObjectId} universe_id A universe id
 * @param {ObjectId} user_id
 */
async function getInstanceFromUniverse(universe_id, user_id) {
	let universe = await getUniverseExplore(universe_id, user_id);

	// grab the copy of this instance out of the ancestors list
	let instanceIndex = universe.ancestors.findIndex((inst) => inst._id.equals(universe.last));
	const instance = universe.ancestors.splice(instanceIndex, 1)[0];
	
	// remove the copy of this instance from the inArr
	instanceIndex = universe.inArr.findIndex((inst) => inst._id.equals(universe.last));
	universe.inArr.splice(instanceIndex, 1);

	return { instance, ancestors: universe.ancestors, descendents: universe.inArr, universe };
}

/**
 * Update an instance with changes
 * @param {ObjectId} universe_id
 * @param {ObjectId} id instance
 * @param {Object} data the changes
 */
async function updateInstance(universe_id, id, data) {
	debug("STARTING  \t Instance.findOneAndUpdate --- updateInstance");
	const inst = await Instance.findOneAndUpdate({ _id: id, univ: universe_id }, data, {
		runValidators: true,
		new: true
	}).exec();
	debug("DONE      Instance.findOneAndUpdate --- updateInstance");
	return inst;
}

async function moveInstance(universe_id, instance_id, up_n) {
	// get the new parent and instance
	const instances = await Instance.find({
		univ: universe_id,
		$or: [{ _id: instance_id }, { n: up_n }]
	});
	if (instances.length !== 2) {
		// something has gone wrong
		debug(`Move instance request couldn't find`, { universe_id, instance_id, up_n });
		return {};
	}

	let instance, newParent;
	if (instances[0]._id.equals(instance_id)) {
		(instance = instances[0]), (newParent = instances[1]);
	} else {
		(instance = instances[1]), (newParent = instances[0]);
	}

	// update old parent to remove it
	let oldParent;
	if (instance.up) {
		oldParent = await Instance.findByIdAndUpdate(instance.up, { $pull: { in: instance._id } });
	}

	// update new parent
	if (!newParent.in) newParent = [];
	newParent.in.push(instance._id);
	newParent.save(); // we don't wait because we alrady got it

	// update myself
	instance.up = newParent._id;
	instance.save(); // we don't need to wait because we already got it

	return { instance, newParent, oldParent };
}

/**
 * From raw instance data, saves a new instance
 * @param {ObjectId} universe_id
 * @param {ObjectId} user_id
 * @param {ObjectId} up_id
 * @param {Object} data
 */
async function createInstance(universe_id, user_id, up_id, data) {
	// Allocate space in the universe first so no one taks this #n
	debug("STARTING  Universe.updateOne --- createInstance");
	const universe = await Universe.findOneAndUpdate(
		{ _id: universe_id, user: user_id },
		{ $inc: { count: 1 } }
	);
	debug("DONE      Universe.updateOne --- createInstance");

	if (!universe) {
		return null;
	}

	let inst;
	debug("STARTING  Instance.create --- createInstance");
	try {
		inst = await Instance.create({
			univ: universe._id,
			up: up_id,
			n: universe.count + 1,
			...data
		});
	} catch (e) {
		// E11000 duplicate key error, our universe count is wrong!
		if (e.code === 11000) {
			universe.set("count", universe.count + 10);
			debug("STARTING  universe.save --- createInstance");
			await universe.save();
			debug("DONE      universe.save --- createInstance");
			return createInstance(universe, up_id, data);
		}
	}
	debug("DONE      Instance.create --- createInstance");

	// update the parent
	const parent = await updateInstance(universe._id, up_id, { $push: { in: inst._id } });
	inst.parent = parent;

	return inst;
}

/**
 * From an array of created instances, push them into the DB
 * @param {[Instance]} nestedArr
 * @param {ObjectId} up instance
 * @param {ObjectId} universe
 */
// eslint-disable-next-line max-statements
async function createInstancesFromNested(nestedArr = [], up, universe) {
	debug(`createInstancesFromNested ${nestedArr.length} count`);
	const results = [];

	// we are modifying this for storage, but are not saving!
	// the allocation method already did one update for all of them
	// eslint-disable-next-line require-atomic-updates
	universe.count = await allocateSpaceForNewInstances(universe._id, nestedArr);

	nestedArr.forEach(nested => {
		nested.univ = universe._id;
		nested.up = up._id;
		nested.n = universe.count++;
	});

	// add and get their _ids
	let withIdArr;
	debug("STARTING  Instance.insertMany --- createInstancesFromNested");
	try {
		withIdArr = await Instance.insertMany(nestedArr);
	} catch (e) {
		console.error(
			`This should not be possible! `,
			`Something is up with how I'm incrementing universe count attribute`
		);
		throw e;
	}
	debug("DONE      Instance.insertMany --- createInstancesFromNested");

	const asyncFunction = async (instance, i) => {
		if (nestedArr[i].TEMP_IN) {
			// create children
			let result = await createInstancesFromNested(nestedArr[i].TEMP_IN, instance, universe);
			return [result.parent, ...result.instances];
		}
		return [instance];
	};

	const promises = withIdArr.map((instance, i) => asyncFunction(instance, i));

	// loop into children
	const fromEachChild = await Promise.all(promises);
	fromEachChild.forEach(arr => results.push(...arr));

	// push them into my parent instance
	debug("STARTING  Instance.save --- createInstancesFromNested");
	if (!up.in) up.in = [];
	up.in.push(...withIdArr.map(i => i._id));
	up.save(); // I don't have to wait for this becuase I already have the object
	debug("DONE      Instance.save --- createInstancesFromNested");

	return { parent: up, instances: results };
}

async function getInstancesToDelete(instance_id, universe_id) {
	const inst = await Instance.aggregate([
		{ $match: { _id: instance_id, univ: universe_id } },
		{
			$graphLookup: {
				from: "instances",
				startWith: "$in",
				connectFromField: "in",
				connectToField: "_id",
				as: "descendents"
			}
		},
		{
			$project: { descendents: "$descendents._id" }
		}
	]);
	return inst;
}

async function deleteInstance(instance_id, universe_id) {
	// get the ids to delete
	let inst = await getInstancesToDelete(instance_id, universe_id);
	if (!inst.length) return null;
	inst = inst[0];
	const idsToDelete = [inst._id, ...inst.descendents];

	// update anyone who has them in their in arrays, and delete
	debug("STARTED  Instance.updateMany -- deleteInstance");
	const updateResults = await Instance.updateMany({
		$pull: { in: { $in: idsToDelete } }
	});
	debug("    DONE  Instance.updateMany -- deleteInstance");

	debug("STARTED  Instance.deleteMany -- deleteInstance");
	const deleteResults = await Instance.deleteMany({ _id: { $in: idsToDelete } });
	debug("    DONE  Instance.deleteMany -- deleteInstance");

	return { ids: idsToDelete, updateResults, deleteResults };
}

module.exports = {
	getInstanceFromUniverse,
	updateInstance,
	createInstance,
	createInstancesFromNested,
	deleteInstance,
	moveInstance
};

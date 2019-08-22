const router = require("express").Router();

const MW = require("./middleware.js");
const Universe = require("../models/universe");
const Pack = require("../models/pack");
const BuiltPack = require("../models/builtpack");
const Maker = require("../models/generator/make");
const Nested = require("./packs/nested");
const Table = require("../models/table");

const getPack = require("../queries/getPack");
const normalizeUniverse = require("../util/normalizeUniverse");

function saveInstance(index, newValues, universe) {
	const newChanges = {};

	// move
	if (typeof newValues.up !== "undefined") {
		const oldUp = universe.array[index].up;

		//do the move
		universe.moveInstance(index, newValues.up);

		// return changed instances
		newChanges[newValues.up] = universe.array[newValues.up].toJSON();
		newChanges[oldUp] = universe.array[oldUp].toJSON();

		delete newValues.up;
	}

	// set favorite
	if (typeof newValues.isFavorite !== "undefined") {
		universe.setFavorite(index, newValues.isFavorite);
		delete newValues.isFavorite;
	}

	// delete
	if (newValues.delete) {
		const oldLength = universe.array.length;
		const { length, emptyIndexes } = universe.deleteInstance(index) || {};

		// send all the empties that are now null
		emptyIndexes.forEach(i => (newChanges[i] = null));
		// send all the stripped off from the end are null
		for (let i = length; i < oldLength; i++) newChanges[i] = null;
	}

	// edit
	else if (universe.array[index]) {
		const newInstance = { ...universe.array[index].toJSON(), ...newValues };
		universe.array.set(index, newInstance);
		// if it's not deleted, send the result
		newChanges[index] = universe.array[index].toJSON();
	}

	return newChanges;
}

router
	.route("/")
	// Get All Universes
	// ---------------------------------
	.get((req, res, next) => {
		Universe.find({ user_id: req.user.id })
			.populate("pack", "name dependencies font url public desc txt cssClass")
			.then(async uniArray => {
				let packs = {};
				const universes = {};
				Promise.all(
					uniArray.map(async u => {
						let lastSaw = (await u.getNested(u.lastSaw, u.pack)) || {};
						// push the pack name into the dependencies for display
						const { universe, packs: morePacks } = normalizeUniverse({
							...u.toJSON(),
							array: { [u.lastSaw]: lastSaw }
						});

						universes[universe._id.toString()] = universe;
						packs = { ...packs, ...morePacks };
					})
				).then(() =>
					res.json({
						universes: universes,
						packs
					})
				);
			})
			.catch(next);
	})
	// Create Universe
	// ---------------------------------
	// TODO: Multiple packs
	.post((req, res, next) => {
		req.params.pack = req.body.pack;

		MW.canViewPack(req, res, async err => {
			if (err) throw err;

			if (res.headersSent) return;

			var { universe } = await Universe.build(req.pack);
			universe.title = req.body.title;
			universe.user_id = req.user.id;

			universe.save();

			res.json(universe);
		}).catch(next);
	});

router
	.route("/:universe")
	// Get universe
	// ---------------------------------
	.get(MW.ownsUniverse, async (req, res) => {
		// populate the dependencies so we can see them
		await req.universe.pack.populate({ path: "dependencies" }).execPopulate();

		const pack = await getPack(req.universe.pack, req.user);

		const { universe, packs, generators, tables } = normalizeUniverse({
			...req.universe.toJSON(),
			pack
		});

		res.json({ universe, packs, generators, tables });
	})
	// Edit Universe
	// ---------------------------------
	.put(async (req, res, next) => {
		var toSave = Object.assign({}, req.body);
		var result = {};

		Universe.findById(req.params.universe)
			.populate("pack")
			.then(async universe => {
				if (!universe) return res.status(404);
				if (!universe.user_id || universe.user_id.toString() !== req.user.id)
					return res.status(401);

				//check if array
				if (toSave.array) {
					result.array = {};

					// for each instance
					for (var index in toSave.array) {
						index = parseInt(index, 10);
						var newValues = toSave.array[index];
						const newChanges = saveInstance(index, newValues, universe, result);
						result.array = { ...result.array, ...newChanges };
					}
					delete toSave.array;
				}

				delete toSave.array;

				if (Object.keys(toSave).length) {
					universe.set(toSave);
				}

				await universe.save();

				result = Object.assign(result, toSave);
				res.json({ request: req.body, result: result });
			})
			.catch(next);
	})
	// Delete Universe
	// ---------------------------------
	.delete(MW.isLoggedIn, async (req, res, next) => {
		Universe.findOneAndRemove({
			_id: req.params.universe,
			user_id: req.user.id
		})
			.then(async deleted => {
				if (!deleted) {
					var err = new Error(
						`Could not find universe with id ${req.params.universe} for currently logged in user`
					);
					err.status = 404;
					throw err;
				}
				return res.json(deleted);
			})
			.catch(next);
	});

// Explore universe
// ---------------------------------
router.get("/:universe/explore/:index?", MW.ownsUniverse, (req, res, next) => {
	req.universe
		.getNested(req.params.index, req.universe.pack)
		.then(nested => {
			req.universe.save(); //save lastSaw
			res.json({ current: nested, pack: req.pack });
		})
		.catch(next);
});

const generateNew = async (universe, index, isa, name) => {
	let ancestorData = universe.getAncestorData(index);
	let parent = universe.array[index];
	var nestedParent = parent.expand(1);
	const pack = universe.pack;
	var builtpack = await BuiltPack.findOrBuild(pack);

	let generator = false;
	if (typeof isa === "string") {
		generator = builtpack.getGen(isa || name);
	} else if (typeof isa === "object" && isa) {
		generator = isa;
	}
	var generated = generator
		? await Maker.make(generator, 0, builtpack, undefined, ancestorData)
		: new Nested(name);

	nestedParent.index = index;
	generated.setUp(nestedParent.makeAncestorArray());
	generated.setIndex(universe);
	if (!(parent.in instanceof Array)) parent.in = [];
	if (!(nestedParent.in instanceof Array)) nestedParent.in = [];
	parent.in.push(generated.index);
	nestedParent.in.push(generated);

	// save to universe
	generated.flatten(universe);

	return generated.index;
};

function getRelevantInstances(index, newIndex, universe) {
	const parent = universe.array[index];
	const instances = {
		[index]: parent
	};
	parent.in.forEach(i => {
		if (i === newIndex) {
			instances[i] = universe.array[i];
			// include child nodes if they were generated
			if (instances[i].in instanceof Array) {
				instances[i].in.forEach(childIndex => (instances[childIndex] = universe.array[childIndex]));
			}
		}
		if (i !== null) instances[i] = universe.array[i];
	});
	return instances;
}

// Make a new node
// ---------------------------------
router.post("/:universe/explore/:index", (req, res, next) => {
	const index = parseInt(req.params.index, 10);

	Universe.findById(req.params.universe)
		.populate("pack")
		.then(async universe => {
			if (!universe) return res.status(404);
			if (universe.user_id.toString() !== req.user.id) return res.status(401);

			if (!universe.array[index]) return res.status(404);

			let isa = req.body.isa;

			// table that returns a generator
			if (req.body.table) {
				let table = await Table.findById(req.body.table).exec();
				if (table && table.returns === "generator") {
					isa = await table.roll();
				}
			}

			const newIndex = await generateNew(universe, index, isa, req.body.name);

			universe.save();

			res.json({ instances: getRelevantInstances(index, newIndex, universe), pack: universe.pack });
		})
		.catch(next);
});

router.post("/:universe/pack/create", MW.ownsUniverse, async (req, res) => {
	const id = req.params.universe;

	// we already have a universe pack, bail
	if (req.universe.pack.universe_id && req.universe.pack.universe_id.toString() === id) {
		res.json(req.universe);
	}

	const { font, cssClass, txt, desc, seed } = req.universe.pack;

	const newPack = new Pack({
		_id: id,
		universe_id: id,
		name: req.universe.title,
		url: id,
		dependencies: [req.universe.pack.id],
		public: false,
		font,
		cssClass,
		txt,
		desc,
		seed
	});

	const oldPack = req.universe.pack;
	req.universe.set("pack", id);
	await newPack.save();
	await req.universe.save();

	let { universe, packs } = normalizeUniverse(req.universe);
	packs[newPack._id.toString()] = newPack;
	packs[oldPack._id.toString()] = oldPack;

	res.json({ universe, packs });
});

module.exports = router;

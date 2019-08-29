const router = require("express").Router();

const { MW } = require("../../util");
const Universe = require("../Universe");
const Pack = require("../../pack/Pack");
const BuiltPack = require("../../builtpack/BuiltPack");
const Maker = require("../../generator/make");
const Nested = require("../../pack/Nested");
const Table = require("../../table/Table");

const { getPack } = require("../query");
const { normalizeUniverse, normalizeUniverses } = require("../normalize");
const { getUniversesByUser } = require("../query");
const { saveInstance } = require("../util");
const { updateInstance } = require("../../instance/query");

router
	.route("/")
	// Get All Universes
	// ---------------------------------
	.get(MW.isLoggedIn, async (req, res) => {
		const uniArray = await getUniversesByUser(req.user._id);
		res.json(normalizeUniverses(uniArray));
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

				res.json({
					request: req.body,
					result: { ...result, ...toSave }
				});
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

/**
 * Make a new pack specific to this universe, so we can edit it.
 */
router.post("/:universe/pack/create", MW.ownsUniverse, async (req, res) => {
	const id = req.params.universe;

	// we already have a universe pack, bail
	if (req.universe.pack.universe_id && req.universe.pack.universe_id.toString() === id) {
		res.json(req.universe);
	}

	const { font, cssClass, txt, desc, seed } = req.universe.pack;

	const newPack = new Pack({
		_id: id,
		_user: req.user._id,
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

router.put("/:universe/instances", MW.ownsUniverse, async (req, res) => {
	const instances = req.body;
	const results = [];

	instances.forEach(async item => {
		const result = await updateInstance(req.universe._id, item.id, item.changes);
		results.push(result);
	});

	res.send({ meta: results });
});

module.exports = router;

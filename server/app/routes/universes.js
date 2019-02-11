const router = require("express").Router();

const MW = require("./middleware.js");
const Universe = require("../models/universe");
const BuiltPack = require("../models/builtpack");
const Maker = require("../models/generator/make");
const Nested = require("./packs/nested");

// Create Universe
// ---------------------------------
// TODO: Multiple packs
router.post("/", (req, res, next) => {
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

// Get All Universes
// ---------------------------------
router.get("/", (req, res, next) => {
	Universe.find({ user_id: req.user.id })
		.populate("pack", "name dependencies font")
		.then(async universes => {
			Promise.all(
				universes.map(async u => {
					let lastSaw = (await u.getNested(undefined, u.pack)) || {};
					let style = {
						txt: lastSaw.txt,
						cssClass: lastSaw.cssClass,
						lastSaw: lastSaw,
						array: undefined,
						dependencies: [u.pack.name].concat(u.pack.dependencies)
					};
					// push the pack name into the dependencies for display
					return Object.assign({}, u.toJSON(), style);
				})
			).then(styledUnis => res.json(styledUnis));
		})
		.catch(next);
});

// Get universe
// ---------------------------------
router.get("/:universe", MW.ownsUniverse, (req, res) => {
	var u = req.universe.toJSON();

	u.favorites = u.favorites.map(i => {
		if (!u.array[i]) return {};
		return {
			name: u.array[i].name || u.array[i].isa,
			index: i
		};
	});

	delete u.array;
	res.json(u);
});

// Edit Universe
// ---------------------------------
router.put("/:universe", async (req, res, next) => {
	var toSave = Object.assign({}, req.body);
	var result = {};

	Universe.findById(req.params.universe)
		.populate("pack")
		.then(async universe => {
			if (!universe) return res.status(404);
			if (universe.user_id.toString() !== req.user.id) return res.status(401);

			//check if array
			if (toSave.array) {
				result.array = {};

				// for each instance
				for (var index in toSave.array) {
					index = parseInt(index, 10);
					var newValues = toSave.array[index];

					if (typeof newValues.up !== "undefined") {
						universe.moveInstance(index, newValues.up);
						delete newValues.up;
					}
					if (typeof newValues.isFavorite !== "undefined") {
						universe.setFavorite(index, newValues.isFavorite);
						delete newValues.isFavorite;
					}

					if (newValues.delete) universe.deleteInstance(index);
					else
						universe.array.set(index, Object.assign({}, universe.array[index].toJSON(), newValues));
					result.array[index] = universe.array[index];
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
});

// Delete Universe
// ---------------------------------
router.delete("/:universe", MW.isLoggedIn, async (req, res, next) => {
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

// Make a new node
// ---------------------------------
router.post("/:universe/explore/:index", (req, res, next) => {
	const index = parseInt(req.params.index, 10);

	Universe.findById(req.params.universe)
		.populate("pack")
		.then(async universe => {
			if (!universe) return res.status(404);
			if (universe.user_id.toString() !== req.user.id) return res.status(401);

			const parentIndex = index;
			const pack = universe.pack;
			var parent = universe.array[parentIndex];
			if (!parent) return res.status(404);

			let ancestorData = universe.getAncestorData(index);
			var nestedParent = parent.expand(1);
			var builtpack = await BuiltPack.findOrBuild(pack);
			var generator = builtpack.getGen(req.body.isa || req.body.name);
			var generated = generator
				? await Maker.make(generator, 0, builtpack, undefined, ancestorData)
				: new Nested(req.body.name);

			nestedParent.index = parentIndex;
			generated.setUp(nestedParent.makeAncestorArray());
			generated.setIndex(universe);
			if (!(parent.in instanceof Array)) parent.in = [];
			if (!(nestedParent.in instanceof Array)) nestedParent.in = [];
			parent.in.push(generated.index);
			nestedParent.in.push(generated);

			var newNested = generated.flatten(universe);

			universe.save();
			res.json({ current: nestedParent, pack: universe.pack });
		})
		.catch(next);
});

module.exports = router;

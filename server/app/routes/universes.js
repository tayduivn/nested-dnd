const router = require("express").Router();

const MW = require("./middleware.js");
const Universe = require("../models/universe");
const BuiltPack = require("../models/builtpack");
const Maker = require("../models/generator/make");
const Nested = require("./packs/nested");

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
		const { length, emptyIndexes } = universe.deleteInstance(index);

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
				const packs = {};
				const universes = {};
				Promise.all(
					uniArray.map(async u => {
						let lastSaw = (await u.getNested(undefined, u.pack)) || {};
						packs[u.pack._id] = u.pack.toJSON();
						let style = {
							txt: lastSaw.txt,
							cssClass: lastSaw.cssClass,
							lastSaw: lastSaw,
							pack: u.pack._id,
							array: undefined,
							dependencies: [u.pack.name].concat(u.pack.dependencies)
						};
						// push the pack name into the dependencies for display
						universes[u._id] = Object.assign({}, u.toJSON(), style);
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
	.get(MW.ownsUniverse, (req, res) => {
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
	var generator = builtpack.getGen(isa || name);
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
};

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

			await generateNew(universe, index, req.body.isa, req.body.name);

			universe.save();

			const parent = universe.array[index];
			const instances = {
				[index]: parent
			};
			parent.in.forEach(i => {
				if (i !== null) instances[i] = universe.array[i];
			});

			res.json({ instances, pack: universe.pack });
		})
		.catch(next);
});

module.exports = router;

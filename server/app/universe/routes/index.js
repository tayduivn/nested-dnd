/* eslint-disable max-statements */
const debug = require("debug")("app:unverse:routes");
const router = require("express").Router();

const Universe = require("../Universe");

const MW = require("util/middleware");

const { normalizeUniverse, normalizeUniverses } = require("../normalize");
const { getUniversesByUser, getPack } = require("../query");
const { saveInstance } = require("util");

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

router.use("/:universe/pack", require("./pack"));
router.use("/:universe/instances", require("instance/routes"));

module.exports = router;

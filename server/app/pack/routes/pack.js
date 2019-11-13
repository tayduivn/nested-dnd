const router = require("express").Router({ mergeParams: true });

const BuiltPack = require("../../builtpack/BuiltPack");
const Table = require("../../table/Table");
const Pack = require("../../pack/Pack");
const Generator = require("../../generator/Generator");

const { getByIsa } = require("../util/getUtils");
const { MW } = require("../../util");

const generators = require("../../generator/routes/generators");
const { getPackByUrl, getPackOptions, getPackGenerators } = require("../query");
const { normalizePack } = require("../normalize");
const { normalizeGenerators } = require("../../generator/normalize");
const { normalizeTables } = require("table/normalize");

const { sortGensByPack } = require("builtpack/util");

// Read Pack - slim! needs to be simple for edit page, etc. not all options
// ---------------------------------
router.get("/", (req, res, next) => {
	getPackByUrl(req.params.url, req.user._id)
		.then(result => {
			res.json(normalizePack(result));
		})
		.catch(next);
});

// Update Pack
// ---------------------------------
router.put("/", MW.canEditPack, (req, res, next) => {
	var newVals = req.body;

	// validate exists
	if (newVals.seed) {
		BuiltPack.findOrBuild(req.pack)
			.then(builtpack => {
				if (!req.pack.seedIsValid(newVals.seed, builtpack)) {
					return res.status(412).json({ error: "Seed is not valid: " + newVals.seed });
				} else save();
			})
			.catch(next);
	} else save();

	function save() {
		// fields that cannot be changed
		req.pack.set(newVals);
		req.pack
			.save()
			.then(updatedPack => {
				res.json(updatedPack);
			})
			.catch(next);
	}
});

// Delete Pack
// ---------------------------------

//TODO: Delete all the things and tables that belong to that pack
router.delete("/", MW.isLoggedIn, (req, res, next) => {
	Pack.findOneAndRemove({ _id: req.params.pack, _user: req.user.id })
		.then(doc => {
			if (!doc) {
				return res.status(404).json({
					errors:
						"Could not find pack with id " +
						req.params.pack +
						" that is owned by user " +
						req.user.id
				});
			}
			return res.json(doc);
		})
		.catch(next);
});

// get partial data about all the tables in this pack
router.get("/tables", MW.canViewPack, async (req, res, next) => {
	try {
		const tables = await Table.find({ pack: req.pack.id }, "title returns").exec();
		tables.sort((a, b) => a.title.localeCompare(b.title));

		const pack = {
			_id: req.pack.id,
			tables: tables
		};
		return res.json(normalizePack(pack));
	} catch (e) {
		next(e);
	}
});

/**
 * Get partial definition of generators for this pack. Used on the view pack screen
 */
router.get("/generators", MW.canViewPack, async (req, res, next) => {
	try {
		const pack = await getPackGenerators(req.params.url, req.user._id);
		// sort generators by dependency order
		pack.generators = sortGensByPack(pack.generators, [...pack.dependencies, pack._id]);
		const normalPack = normalizePack(pack);

		normalPack.included = normalizeGenerators(pack.generators).data;

		// normal pack should include extends
		res.json(normalPack);
	} catch (e) {
		next(e);
	}
});

router.get("/instances/:isa", MW.canViewPack, (req, res, next) => {
	getByIsa(req.params.isa, req.pack)
		.then(async ({ gen, builtpack }) => {
			var newGen = await Generator.make(gen, builtpack);
			res.json(newGen);
		})
		.catch(next);
});

// get the generators and tables for this pack
router.get("/options", async (req, res) => {
	const pack = await getPackOptions(req.params.url, req.user._id);
	res.json(normalizePack(pack));
});

router.use("/generators", generators);

module.exports = router;

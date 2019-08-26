const router = require("express").Router({ mergeParams: true });

const BuiltPack = require("../../builtpack/BuiltPack");
const Table = require("../../table/Table");
const Pack = require("../../pack/Pack");
const Generator = require("../../generator/Generator");

const { getByIsa } = require("./getUtils");
const { MW } = require("../../util");

const generators = require("./generators");
const { getPack } = require("../query");
const { normalizePack } = require("../normalize");

// Read Pack
// ---------------------------------
router.get("/", MW.canViewPack, (req, res, next) => {
	getPack(req.pack, req.user)
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

router.get("/tables", MW.canViewPack, (req, res, next) => {
	Table.find({ pack: req.pack.id })
		.exec()
		.then(async tables => {
			tables.sort((a, b) => a.title.localeCompare(b.title));
			return res.json(tables);
		})
		.catch(next);
});

router.get("/instances/:isa", MW.canViewPack, (req, res, next) => {
	getByIsa(req.params.isa, req.pack)
		.then(async ({ gen, builtpack }) => {
			var newGen = await Generator.make(gen, builtpack);
			res.json(newGen);
		})
		.catch(next);
});

router.use("/generators", generators);

module.exports = router;

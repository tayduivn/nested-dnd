const router = require("express").Router();

const BuiltPack = require("../models/builtpack");
const MW = require("./middleware.js");

router.get("/:pack", MW.canViewPack, (req, res, next) => {
	BuiltPack.findOrBuild(req.pack)
		.then(builtpack => {
			if (!builtpack)
				res.status(404).json({ error: "Cannot find pack with id " + req.params.pack });
			return res.json(builtpack);
		})
		.catch(next);
});

router.put("/:pack/rebuild", MW.canEditPack, (req, res, next) => {
	BuiltPack.rebuild(req.pack)
		.then(builtpack => {
			if (!builtpack)
				res.status(404).json({ error: "Cannot find pack with id " + req.params.pack });
			return res.json(builtpack);
		})
		.catch(next);
});

// Get generator names
// ---------------------------------
router.get("/:pack/generators", MW.canViewPack, (req, res, next) => {
	BuiltPack.findOrBuild(req.pack)
		.then(builtpack => {
			if (typeof builtpack === "object")
				res.json(Object.keys(builtpack.generators).sort((a, b) => a.localeCompare(b)));
			res.status(404);
		})
		.catch(next);
});

module.exports = router;

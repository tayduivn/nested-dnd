const router = require("express").Router();

const MW = require("../util/middleware.js");

const get404Builtpack = (packid, pack) => {
	const err = new Error("Cannot find builtpack with id " + packid);
	err.status = 404;
	err.data = { pack };
	return err;
};
const { findOrBuild, rebuild } = require("./query");

router.get("/:pack", MW.canViewPack, (req, res, next) => {
	findOrBuild(req.pack)
		.then(builtpack => {
			if (!builtpack) throw get404Builtpack(req.params.pack, req.pack);
			return res.json(builtpack);
		})
		.catch(next);
});

router.put("/:pack/rebuild", MW.canEditPack, (req, res, next) => {
	rebuild(req.pack)
		.then(builtpack => {
			if (!builtpack) throw get404Builtpack(req.params.pack, req.pack);
			return res.json(builtpack);
		})
		.catch(next);
});

// Get generator names
// ---------------------------------
router.get("/:pack/generators", MW.canViewPack, (req, res, next) => {
	findOrBuild(req.pack)
		.then(builtpack => {
			if (!builtpack) throw get404Builtpack(req.params.pack, req.pack);
			res.json(Object.keys(builtpack.generators).sort((a, b) => a.localeCompare(b)));
		})
		.catch(next);
});

module.exports = router;

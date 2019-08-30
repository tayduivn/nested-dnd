const router = require("express").Router({ mergeParams: true });

const MW = require("util/middleware");
const Pack = require("pack/Pack");

const { normalizeUniverse } = require("../normalize");

/**
 * Make a new pack specific to this universe, so we can edit it.
 */
router.post("/create", MW.ownsUniverse, async (req, res) => {
	const id = req.params.universe;

	// we already have a universe pack, bail
	if (req.universe.pack.universe_id && req.universe.pack.universe_id.toString() === id) {
		res.json(req.universe);
	}

	const { font, cls, txt, desc, seed } = req.universe.pack;

	const newPack = new Pack({
		_id: id,
		_user: req.user._id,
		universe_id: id,
		name: req.universe.title,
		url: id,
		dependencies: [req.universe.pack.id],
		public: false,
		font,
		cls,
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

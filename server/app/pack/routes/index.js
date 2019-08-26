const router = require("express").Router();

const Pack = require("../../pack/Pack");

const pack = require("./pack");
const { getAllPacks } = require("../query");
const { normalizePacks } = require("../normalize");

// Get All Packs
// ---------------------------------
router.get("/", async (req, res) => {
	const packs = await getAllPacks(req.user && req.user._id);
	res.json(normalizePacks(packs, req.user._id));
});

// Create Pack
// ---------------------------------

//TODO: Check public packs have unique names
router.post("/", (req, res, next) => {
	var newPack = req.body;
	newPack._user = req.user._id;
	delete newPack.seed; //can't set, don't have any generators yet

	Pack.create(newPack)
		.then(newPack => {
			return res.json(newPack);
		})
		.catch(next);
});

router.use("/:url", pack);

module.exports = router;

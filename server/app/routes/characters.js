const router = require("express").Router();

const Character = require("../models/character.js");
const BuiltPack = require("../models/builtpack.js");
const utils = require("./middleware.js");

// Get All Characters
// ---------------------------------
router.get("/universe/:universe", utils.ownsUniverse, (req, res, next) => {
	Character.find({ universe: req.universe._id })
		.exec()
		.then(chars => res.json(chars))
		.catch(next);
});

// Create Character
// --------------------------------
router.post("/create/:universe", utils.ownsUniverse, (req, res, next) => {
	var newData = req.body;
	newData.universe = req.params.universe;
	newData.user = req.user._id;
	Character.create(newData)
		.then(c => res.json(c))
		.catch(next);
});

// Get Character
// ---------------------------------
router.get("/:character", utils.ownsCharacter, (req, res, next) => {
	BuiltPack.findOrBuild(req.character.universe.pack.toString())
		.then(async builtpack => {
			await Promise.all(req.character.cards.map(c => c.setIcon(builtpack)));
			res.json(req.character);
		})
		.catch(next);
});

// Save Character
// --------------------------------
router.put("/:character", utils.ownsCharacter, (req, res, next) => {
	req.character.set(req.body);
	req.character
		.save()
		.then(c => res.json(c))
		.catch(next);
});

module.exports = router;

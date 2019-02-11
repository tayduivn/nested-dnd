const router = require("express").Router();

const MW = require("./middleware.js");
const Universe = require("../models/universe");

// Explore Pack
// ---------------------------------

router.get("/:url/:index?", MW.canViewPack, (req, res, next) => {
	Universe.getTemp(req.sessionID, req.pack, req.params.index)
		.then(nested => res.json({ current: nested, pack: req.pack }))
		.catch(next);
});

// Restart the universe
router.delete("/", (req, res, next) => {
	var query = {
		session_id: req.sessionID,
		expires: { $exists: true }
	};
	Universe.deleteOne(query)
		.then(o => res.json(o))
		.catch(next);
});

module.exports = router;

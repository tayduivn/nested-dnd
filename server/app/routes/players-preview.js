const router = require("express").Router();

router.get("/", (req, res) => {
	res.json(req.session.playersPreview || {});
});

router.put("/", (req, res) => {
	req.session.playersPreview = req.body;
	res.json(req.body);
});

module.exports = router;

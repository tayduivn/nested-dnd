const router = require("express").Router();

router
	.route("/")
	.put((req, res) => {
		req.session.playersPreview = req.body;
		res.json(req.body);
	})
	.get((req, res) => {
		res.json(req.session.playersPreview || {});
	});

module.exports = router;

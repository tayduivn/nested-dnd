const MW = require("./middleware.js");

module.exports = function(app) {
	app.get("/api/players-preview", (req, res, next) => {
		res.json(req.session.playersPreview || {});
	});

	app.put("/api/players-preview", (req, res, next) => {
		req.session.playersPreview = req.body;
		res.json(req.body);
	});
};

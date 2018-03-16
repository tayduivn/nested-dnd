const Table = require("../models/table");
const utils = require("./middleware.js");

module.exports = function(app) {

	// Create Table
	// ---------------------------------
	app.post("/api/pack/:pack/table", utils.canEditPack, (req, res, next) => {
		var newTable = req.body;
		newTable.pack_id = req.params.pack;

		Table.create(newTable).then(j=>res.json(j)).catch(next);
	});

	// Read Table
	// ---------------------------------
	app.get("/api/pack/:pack/table/:table", utils.canViewPack, (req, res, next) => {
		Table.findById(req.params.table).exec((err, table) => {
			if (err) return res.status(404).json(err);
			if(!table) return res.status(404).json({ "error": "Couldn't find table "+req.params.table });

			return res.json(table);
		});
	});

	app.get("/api/pack/:pack/tables", utils.canViewPack, (req, res, next) => {
		Table.find({ pack_id: req.params.pack}).exec((err, tables) => {
			if (err) return res.status(404).json(err);
			if(!tables) return res.status(404).json({ "error": "Couldn't find tables in pack "+req.params.pack });
			if(!tables.length)  return res.json([]);

			return res.json(tables);
		});
	});

	// Update Table
	// ---------------------------------

	// TODO: When renaming, fix references in all table in, as well as seed
	app.put("/api/pack/:pack/table/:table", utils.isLoggedIn, (req, res, next) => {
		var newVals = req.body;

		// fields that cannot be changed
		delete newVals._id; //can't modify id
		delete newVals.id; //can't modify id
		delete newVals.pack_id; // can't change pack_id for now

		newVals.updated = Date.now();

		Table.findById(req.params.table).exec().then((table) => {
			if (!table) return res.status(404).json({ "error": "Couldn't find table "+req.params.table });

			table.set(newVals);
			table.save().then(r=>res.json(r)).catch(next);

		}).catch(next);// dfind by id
	});

	// Delete Table
	// ---------------------------------

	app.delete("/api/pack/:pack/table/:table", utils.canEditPack, (req, res, next) => {

		Table.remove({ _id: req.params.table }).exec().then(r=>res.json(r)).catch(next);

	});

};

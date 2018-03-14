const Table = require("../models/table");
const utils = require("./middleware.js");

module.exports = function(app) {

	// Create Table
	// ---------------------------------
	app.post("/api/pack/:pack/table", utils.isLoggedIn, (req, res) => {
		var newTable = req.body;
		newTable.pack_id = req.params.pack;

		Table.create(newTable, function(err, newTable) {
			if (err) return res.status(412).json(err);
			return res.json(newTable);
		});
	});

	// Read Table
	// ---------------------------------
	app.get("/api/table/:id", (req, res) => {
		Table.findById(req.params.id).populate("pack_id", "_user public").exec((err, table) => {
			if (err) return res.status(404).json(err);
			if(!table) return res.status(404).json({ "error": "Couldn't find table "+req.params.id });

			table.pack_id.isOwner = (req.user &&  table.pack_id._user == req.user.id);

			// only can see public or your tables
			if (!table.pack_id.public && !table.pack_id.isOwner) {
				return res
					.status(401)
					.json({ errors: "You do not have permission to see this page" });
			}

			return res.json(table);
		});
	});

	// TODO: better auth
	app.get("/api/tables/pack/:id", (req, res) => {
		Table.find({ pack_id: req.params.id}).populate("pack_id", "_user public").exec((err, tables) => {
			if (err) return res.status(404).json(err);
			if(!tables) return res.status(404).json({ "error": "Couldn't find tables in pack "+req.params.id });
			if(!tables.length)  return res.json([]);

			var pack = tables[0].pack_id;
			var isOwner = (req.user &&  pack._user == req.user.id);

			// only can see public or your tables
			if (!pack.public && !isOwner) {
				return res
					.status(401)
					.json({ errors: "You do not have permission to see this page" });
			}

			return res.json(tables);
		});
	});

	// Update Table
	// ---------------------------------

	// TODO: When renaming, fix references in all table in, as well as seed
	app.put("/api/table/:id", utils.isLoggedIn, (req, res) => {
		var newVals = req.body;

		// fields that cannot be changed
		delete newVals._id; //can't modify id
		delete newVals.pack_id; // can't change pack_id for now

		newVals.updated = Date.now();

		Table.findById(req.params.id).populate("pack_id", "_user public").exec((err, table) => {
			if (err) return res.status(404).json(err);

			table.pack_id.isOwner = (req.user &&  table.pack_id._user == req.user.id);

			// only can see public or your tables
			if (!table.pack_id.public && !table.pack_id.isOwner) {
				return res
					.status(401)
					.json({ errors: "You do not have permission to update this table" });
			}

			table.set(newVals);

			table.save((err, updatedTable) => {
				if (err) return res.status(404).json(err);

				return res.json(updatedTable);
			});

		});// dfind by id
	});

	// Delete Table
	// ---------------------------------

	app.delete("/api/table/:id", utils.isLoggedIn, (req, res) => {

		Table.findById(req.params.id).populate("pack_id").exec((err, table) => {
			if (err) return res.status(404).json(err);
			if(!table) return res.status(404).json({"errors":"Could not find table with id "+req.params.id});

			if(table.pack_id._user != req.user.id){
				return res.status(401).json({"errors": "You do not have permission to delete this table"});
			}

			table.remove((err,deletedGen)=>{
				if(err) return res.status(500).json(err);
				return res.json(deletedGen);
			})
			
		});
	});

};

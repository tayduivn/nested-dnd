const Table = require("../models/table");
const utils = require("./middleware.js");

module.exports = function(app) {

	// Create Table
	// ---------------------------------
	app.post("/api/pack/:pack/table", utils.canEditPack, (req, res, next) => {
		var newTable = req.body;
		newTable.pack = req.params.pack;
		newTable.user = req.user.id;

		Table.create(newTable).then(j=>res.json(j)).catch(next);
	});

	// Read Table
	// ---------------------------------
	app.get("/api/tables/:table", utils.canViewTable, (req, res, next) => {
		if(req.table && req.table.roll){
			req.table.roll().then(result=>{
				return res.json(Object.assign({},req.table.toJSON(),{ roll: result }));
			})
		}
		else return res.json(Object.assign({},req.table.toJSON()));
	});

	app.get("/api/pack/:pack/tables", utils.canViewPack, (req, res, next) => {
		Table.find({ pack: req.params.pack}).exec((err, tables) => {
			if (err) return res.status(404).json(err);
			if(!tables) return res.status(404).json({ "error": "Couldn't find tables in pack "+req.params.pack });
			if(!tables.length)  return res.json([]);

			// temp data clean
			tables.forEach((t)=>{
				if(!t.pack)
					t.set({pack: packs[0]});
				t.save();
			})

			tables.sort((a,b)=>a.title.localeCompare(b.title));
			return res.json(tables);
		});
	});

	// Update Table
	// ---------------------------------

	// TODO: When renaming, fix references in all table in, as well as seed
	app.put("/api/tables/:table", utils.canEditTable, (req, res, next) => {
		var newVals = req.body;

		// fields that cannot be changed
		delete newVals._id; //can't modify id
		delete newVals.id; //can't modify id

		newVals.updated = Date.now();

		req.table.set(newVals);
		req.table.save().then(r=>res.json(r)).catch(next);

	});

	// Delete Table
	// ---------------------------------

	app.delete("/api/tables/:table", utils.canEditTable, (req, res, next) => {

		Table.deleteOne({ _id: req.params.table }).exec().then(r=>res.json(r)).catch(next);

	});

};

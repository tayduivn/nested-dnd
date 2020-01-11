const router = require("express").Router();

const Table = require("../table/Table");
const { MW } = require("../util");
const merge = require("../util/merge");
const { normalizeTable } = require("./normalize");

// Create Table
// ---------------------------------
router.post("/create/:pack/", MW.canEditPack, (req, res, next) => {
	var newTable = req.body;
	newTable.pack = req.pack._id;
	newTable.user = req.user.id;

	Table.create(newTable)
		.then(j => res.json(j))
		.catch(next);
});

router.get("/pack/:pack/", MW.canViewPack, (req, res) => {
	Table.find({ pack: req.params.pack }).exec((err, tables) => {
		if (err) return res.status(404).json(err);
		if (!tables)
			return res.status(404).json({ error: "Couldn't find tables in pack " + req.params.pack });
		if (!tables.length) return res.json([]);

		// temp data clean
		tables.forEach(t => {
			if (!t.pack) t.set({ pack: t.packs[0] });
			t.save();
		});

		tables.sort((a, b) => a.title.localeCompare(b.title));
		return res.json(tables);
	});
});

// Read Table
// ---------------------------------
router.get("/:table", MW.canViewTable, (req, res) => {
	if (req.table && req.table.roll) {
		// TODO
		req.table.roll().then(result => {
			const normalTable = normalizeTable(req.table);
			normalTable.related = { roll: result };
			return res.json(normalTable);
		});
	} else return res.json(normalizeTable(req.table));
});

// Update Table
// ---------------------------------
function updateRows(table, newRows) {
	for (let i in newRows) {
		const oldRow = (table.rows[i] && table.rows[i].toJSON()) || {};
		table.set(`rows.${i}`, newRows[i] ? merge(oldRow, newRows[i]) : null);
	}
	// loop through and remove null (deleted) rows
	let i = table.rows.length;
	while (i--) {
		if (!table.rows[i]) table.rows.splice(i, 1);
	}
}

// TODO: When renaming, fix references in all table in, as well as seed
router.put("/:table", MW.canEditTable, (req, res, next) => {
	var newVals = req.body;

	// fields that cannot be changed
	delete newVals._id; //can't modify id
	delete newVals.id; //can't modify id

	newVals.updated = Date.now();

	// rows is array, but newVals.rows comes in as an object. We need to iterate it
	if (newVals.rows) {
		updateRows(req.table, newVals.rows);
		delete newVals.rows;
	}

	req.table.set(newVals);
	req.table
		.save()
		.then(r => res.json(r))
		.catch(next);
});

// Delete Table
// ---------------------------------

router.delete("/:table", MW.canEditTable, (req, res, next) => {
	Table.deleteOne({ _id: req.params.table })
		.exec()
		.then(r => res.json(r))
		.catch(next);
});

module.exports = router;

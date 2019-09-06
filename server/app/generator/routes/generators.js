const router = require("express").Router({ mergeParams: true });

const Generator = require("../Generator");
const BuiltPack = require("../../builtpack/BuiltPack");

const Maintainer = require("../maintain");
const { MW } = require("../../util");

const { getById, getByIsa } = require("../../pack/util/getUtils");

// Create Generator
// ---------------------------------
router.post("/", MW.canEditPack, (req, res, next) => {
	var newGenerator = req.body;
	newGenerator.pack = req.pack._id;

	Generator.insertNew(newGenerator, req.pack)
		.then(newGenerator => {
			return res.json(newGenerator);
		})
		.catch(next);
});

// Read Generator
// ---------------------------------
router.get("/:isa", MW.canViewPack, (req, res, next) => {
	getByIsa(req.params.isa, req.pack)
		.then(async ({ gen, builtpack }) => {
			var unbuilt = await Generator.findById(gen.gen_ids[0].toString());
			res.json({ built: gen, unbuilt: unbuilt, pack: req.pack, builtpack });
		})
		.catch(next);
});

// Update Generator
// ---------------------------------

// TODO: When renaming, fix references in all generator in, as well as seed
router.put("/:id", MW.canEditPack, (req, res, next) => {
	var newVals = req.body;

	// fields that cannot be changed
	delete newVals._id; //can't modify id
	delete newVals.pack; // can't change pack for now

	newVals.updated = Date.now();

	getById(req.params.id)
		.then(async generator => {
			// clean bad data
			generator = new Generator(generator.toJSON());
			const oldVals = generator.toJSON();
			generator.set(newVals);
			generator.isNew = false;
			generator.save();

			// get builtpack
			var builtpack = await BuiltPack.findOrBuild(generator.pack.toString());

			// if renaming
			if (newVals.isa && oldVals.isa !== newVals.isa) {
				// wait for it to rename so we can catch errors
				await generator.rename(oldVals.isa, req.pack, builtpack);
			}

			// rebuild
			await builtpack.rebuildGenerator(generator.isa);
			builtpack.save();

			res.json({
				unbuilt: generator,
				built: builtpack.getGen(generator.isa)
			});
		})
		.catch(next); // dfind by id
});

// Delete Generator
// ---------------------------------

router.delete("/:id", MW.canEditPack, (req, res, next) => {
	Generator.findOneAndRemove({ _id: req.params.id })
		.exec()
		.then(function(gen) {
			return Maintainer.cleanAfterRemove.call(gen);
		})
		.then(gen => {
			res.json(gen);
		})
		.catch(next);
});

module.exports = router;

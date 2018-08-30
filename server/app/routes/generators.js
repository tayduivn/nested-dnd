const Generator = require("../models/generator");
const BuiltPack = require('../models/builtpack');

const Maintainer = require("../models/generator/maintain.js");
const utils = require("./middleware.js");

module.exports = function(app) {

	// Create Generator
	// ---------------------------------
	app.post("/api/packs/:pack/generators", utils.canEditPack, (req, res, next) => {
		var newGenerator = req.body;
		newGenerator.pack = req.pack._id;

		Generator.insertNew(newGenerator, req.pack).then((newGenerator)=>{
			return res.json(newGenerator);
		}).catch(next);
	});

	// Read Generator
	// ---------------------------------
	app.get("/api/packs/:pack/generators/:isa", utils.canViewPack, (req, res, next) => {
		getByIsa(req.params.isa, req.pack).then(async ({gen, builtpack})=> {
			var unbuilt = await Generator.findById(gen.gen_ids[0].toString())
			res.json({ built: gen, unbuilt: unbuilt });
		}).catch(next)
	});

	app.get("/api/packs/:pack/instances/:isa", utils.canViewPack, (req, res, next) => {
		getByIsa(req.params.isa, req.pack).then(async ({gen, builtpack})=> {
			var newGen = await Generator.make(gen, builtpack)
			res.json(newGen);
		}).catch(next)
	});

	// Update Generator
	// ---------------------------------

	// TODO: When renaming, fix references in all generator in, as well as seed
	app.put("/api/packs/:pack/generators/:id", utils.canEditPack, (req, res, next) => {
		var newVals = req.body;

		// fields that cannot be changed
		delete newVals._id; //can't modify id
		delete newVals.pack; // can't change pack for now

		newVals.updated = Date.now();

		getById(req.params.id).then(async (generator) => {

			// clean bad data
			generator = new Generator(generator.toJSON());
			const oldVals = generator.toJSON();
			generator.set(newVals);
			generator.isNew = false;
			generator.save();

			// get builtpack
			var builtpack = await BuiltPack.findOrBuild(generator.pack.toString());

			// if renaming
			if(newVals.isa && oldVals.isa !== newVals.isa){
				// wait for it to rename so we can catch errors 
				await generator.rename(oldVals.isa, req.pack, builtpack)
			}

			// rebuild
			builtpack.rebuildGenerator(generator.isa);

			res.json({
				unbuilt: generator,
				built: builtpack.getGen(generator.isa)
			});
		}).catch(next);// dfind by id
	});

	// Delete Generator
	// ---------------------------------

	app.delete("/api/packs/:pack/generators/:id", utils.canEditPack, (req, res,next) => {

		Generator.findOneAndRemove({ _id: req.params.id}).exec()
			.then(function(gen){
				return Maintainer.cleanAfterRemove.call(gen);
			})
			.then((gen)=>{
				res.json(gen);
			})
			.catch(next);
	});

};

/**
 * Gets a generator by ID
 * @param  {string} id the id
 * @return {Generator}   the generator
 */
async function getById(id){
	var gen = await Generator.findById(id);
	if(!gen) {
		var err = new Error("Couldn't find generator "+id)
		err.status = 404;
		throw err;
	}
	return gen;
}

/**
 * Gets a generator by isa
 * @param  {string} isa  the isa name
 * @param  {Pack} the current pack
 * @return {Generator}   the generator
 */
async function getByIsa(isa, pack){
	var builtpack = await BuiltPack.findOrBuild(pack);
	var gen = builtpack.getGen(isa);

	if(!gen) {
		var err = new Error("Can't find a generator that is a "+isa)
		err.status = 404;
		throw err;
	}

	return { gen, builtpack };
}
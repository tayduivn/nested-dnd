const Generator = require("../models/generator");
const BuiltPack = require('../models/builtpack');

const Maintainer = require("../models/generator/maintain.js");
const utils = require("./middleware.js");

module.exports = function(app) {

	// Create Generator
	// ---------------------------------
	app.post("/api/pack/:pack/generator", utils.canEditPack, (req, res, next) => {
		var newGenerator = req.body;
		newGenerator.pack_id = req.pack._id;

		Generator.insertNew(newGenerator, req.pack).then((newGenerator)=>{
			return res.json(newGenerator);
		}).catch(next);
	});

	// Read Generator
	// ---------------------------------
	app.get("/api/pack/:pack/generator/:id", utils.canViewPack, (req, res, next) => {
		getById(req.params.id).then(generator => {
			return res.json(generator);
		}).catch(next);
	});

	app.get("/api/pack/:pack/generate/:isa", utils.canViewPack, (req, res, next) => {
		getByIsa(req.pack).then(async (builtpack)=> {
			var newGen = await Generator.make(gen, builtpack)
			res.json(newGen);
		}).catch(next)
	});

	// Update Generator
	// ---------------------------------

	// TODO: When renaming, fix references in all generator in, as well as seed
	app.put("/api/pack/:pack/generator/:id", utils.canEditPack, (req, res, next) => {
		var newVals = req.body;

		// fields that cannot be changed
		delete newVals._id; //can't modify id
		delete newVals.pack_id; // can't change pack_id for now

		newVals.updated = Date.now();

		getById(req.params.id).then(async (generator) => {
			var oldVals = Object.assign({},generator._doc);
			generator.set(newVals);

			await generator.save();

			if(oldVals.isa !== newVals.isa){
				// wait for it to rename so we can catch errors 
				await generator.rename(oldVals.isa, req.pack)
			}

			res.json(generator);
		}).catch(next);// dfind by id
	});

	// Delete Generator
	// ---------------------------------

	app.delete("/api/pack/:pack/generator/:id", utils.canEditPack, (req, res,next) => {

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
	var gen = await Generator.findById(id).exec();
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
	return gen;
}
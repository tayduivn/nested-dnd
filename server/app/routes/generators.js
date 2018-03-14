const Generator = require("../models/generator");
const utils = require("./middleware.js");

module.exports = function(app) {

	// Create Generator
	// ---------------------------------
	app.post("/api/pack/:pack/generator", utils.canEditPack, (req, res) => {
		var newGenerator = req.body;
		newGenerator.pack_id = req.pack._id;

		// TODO: Check that in with generator type provide a valid ID

		Generator.insertNew(newGenerator, req.pack, function(err, newGenerator) {
			if (err) return res.status(412).json(err);

			return res.json(newGenerator);
		});
	});

	// Read Generator
	// ---------------------------------
	app.get("/api/pack/:pack/generator/:id", utils.canViewPack, (req, res) => {
		Generator.findById(req.params.id).exec((err, generator) => {
			if (err) return res.status(404).json(err);
			if(!generator) return res.status(404).json({ "error": "Couldn't find generator "+req.params.id });

			return res.json(generator);
		});
	});

	app.get("/api/pack/:pack/generate/:id", utils.canViewPack, (req, res, next) => {

		BuiltPack.findOrBuild(req.pack).then((builtpack)=> {
			Generator.findById(req.params.id, (err, generator)=>{
				return generator.generate(builtpack);
			})
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

		Generator.findById(req.params.id).exec().then(async (generator)=> {
			if(!generator) return res.status(404).json(err);

			
			var oldVals = Object.assign({},generator._doc);
			generator.set(newVals);

			await generator.save();

			if(oldVals.isa !== newVals.isa){
				var gen = await generator.rename(oldVals.isa, req.pack)
				if(gen)
					return res.json(gen);
				else return res.json(generator);
			}
			else return res.json(generator);

		}).catch(next);// dfind by id
	});

	// Delete Generator
	// ---------------------------------

	app.delete("/api/pack/:pack/generator/:id", utils.canEditPack, (req, res,next) => {

		Generator.deleteOne({ _id: req.params.id}).exec()
			.then((gen)=>res.json(gen))
			.catch(next);
	});

};

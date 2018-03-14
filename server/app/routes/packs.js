const assert = require('assert');

const MW = require("./middleware.js");
const Pack = require("../models/pack");
const Generator = require("../models/generator");
const BuiltPack = require("../models/builtpack");
const Explore = require('./packs/explore');


module.exports = function(app) {
	// Get All Packs
	// ---------------------------------
	app.get("/api/packs", (req, res) => {
		var publicPackSettings = {
			public: true
		};
		//if logged in, don't get pack I own
		if (req.user) {
			publicPackSettings._user = { $ne: req.user._id };
		}

		//get public packs
		Pack.find(publicPackSettings).exec((err, publicPacks) => {
			if (err) return res.status(404).json(err);

			if (!req.user) {
				return res.json({ publicPacks });
			}

			// find packs I own
			Pack.find({ _user: req.user._id }).exec((err, myPacks) => {
				if (err) return res.status(404).json(err);

				return res.json({ myPacks, publicPacks });
			});
		});
	});


	// Explore Pack
	// ---------------------------------

	app.get("/api/explore/:url", MW.canViewPack, (req, res, next) =>{
		var universe = req.session.universe;
		if(universe && universe._pack.toString() === req.pack.id){
			var tree = Explore.arrayToTree(universe.array);
			return res.json(tree)  //array to tree
		}

		BuiltPack.findOrBuild(req.pack).then((builtpack)=>{
			var generated;
			generated = builtpack.generateFromSeed(req.pack.seedArray)


			// save to universe
			//todo get from DB if logged in
			var { tree, array } = Explore.treeToArray(generated);
			req.session.universe = {
				_pack: req.pack._id,
				array: array
			};

			return res.json(tree);
		}).catch(next)

	})

	app.get("/api/explore/:url/:index", MW.canViewPack, (req, res,next) =>{
		var universe = req.session.universe;
		if(!universe || universe._pack.toString() !== req.pack.id) 
			return res.status(404).send();

		if(!universe.array[req.params.index]) 
			return res.status(404).send();

		var node = Explore.arrayToTree(universe.array, req.params.index);

		BuiltPack.findOrBuild(req.pack).then((builtpack)=>{
			if(err) throw err;

			var generated = Generator.generateFromNode(node, universe, builtpack);

			// TODO get an array of only the newly generated ones

			// save to universe
			//todo get from DB if logged in
			var { tree, array } = Explore.treeToArray(generated);

			//TODO: figure out how to store the newly generated stuff in array
			
			return res.json(tree);
		}).catch(next);
	});


	// Read Pack
	// ---------------------------------
	app.get("/api/pack/:pack", MW.canViewPack, (req, res) => {
		return res.json(req.pack);
	});

	app.get("/api/builtpack/:pack", MW.canViewPack, (req, res, next) => {

		BuiltPack.findOrBuild(req.pack).then(builtpack=>{
			if(!builtpack) 
				res.status(404).json({"error": "Cannot find pack with id "+req.params.pack})
			return res.json(builtpack);
		}).catch(next)
	});

	// Create Pack
	// ---------------------------------

	//TODO: Check public packs have unique names
	app.post("/api/pack", MW.isLoggedIn, (req, res) => {
		var newPack = req.body;
		newPack._user = req.user._id;
		delete newPack.defaultSeed; //can't set, don't have any generators yet

		Pack.create(newPack, function(err, newPack) {
			if (err) return res.status(412).json(err);

			return res.json(newPack);
		});
	});

	// Update Pack
	// ---------------------------------
	app.put("/api/pack/:pack", MW.canEditPack, (req, res, next) => {
		var newVals = req.body;

		//----------------------------------
		// Validation
		//----------------------------------

		// fields that cannot be changed
		delete newVals._id; //can't modify id
		delete newVals._user; // can't change user for now
		delete newVals.createdOn;

		newVals.updatedOn = Date.now();

		

		// validate exists
		if(newVals.defaultSeed){
			BuiltPack.findOrBuild(req.pack).then(builtpack=>{

				if(!req.pack.seedIsValid(newVals.defaultSeed, builtpack.generators)){
					res.status(412).json({ error: "Seed is not valid: "+newVals.defaultSeed});
					return;
				}
				else
					save();
			}).catch(next);
		}
		else save();

		function save(){
			req.pack.set(newVals);
			req.pack.save((err,updatedPack)=>{
				if(err) return res.status(412).json(err);

				return res.json(updatedPack);
			});
		}
	});

	// Delete Pack
	// ---------------------------------

	//TODO: Delete all the things and tables that belong to that pack
	app.delete("/api/pack/:pack", MW.isLoggedIn, (req, res) => {
		Pack.findOneAndRemove(
			{ _id: req.params.pack, _user: req.user.id },
			(err, doc) => {
				if (err) {
					return res.status(404).json(err);
				}

				if (!doc){
					return res
						.status(404)
						.json({
							errors:
								"Could not find pack with id " +
								req.params.pack +
								" that is owned by user " +
								req.user.id
						});
				}
				return res.json(doc);
			}
		);
	});

	
	app.put("/api/pack/:pack/legacyPackUpload/", MW.isAdmin, (req, res) => {
		var legacyThings = req.body.things;
		var generators = [];

		//todo: check pack exists

		//format
		for (var name in legacyThings) {
			var old = legacyThings[name];

			var newGen = {
				_pack: req.params.pack,
				isa: old.name,
				extends: old.isa
			};
		}

		return res.json(generators);
	});
};

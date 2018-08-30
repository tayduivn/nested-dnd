const MW = require("./middleware.js");
const Pack = require("../models/pack");
const Generator = require("../models/generator");
const BuiltPack = require("../models/builtpack");
const Universe = require("../models/universe");
const Nested = require('./packs/nested');
const Table = require("../models/table");

module.exports = function(app) {
	
	// Get All Packs
	// ---------------------------------
	app.get("/api/packs", (req, res, next) => {

		var publicPackSettings = {
			public: true
		};
		//if logged in, don't get pack I own
		if (req.user) {
			publicPackSettings._user = { $ne: req.user._id };
		}

		//get public packs
		Pack.find(publicPackSettings).exec().then((publicPacks) => {

			if (!req.user) {
				return res.json({ publicPacks });
			}

			// find packs I own
			Pack.find({ _user: req.user._id }).exec().then((myPacks) => {
				return res.json({ myPacks, publicPacks });
			}).catch(next);

		}).catch(next);
	});


	// Explore Pack
	// ---------------------------------

	app.get("/api/explore/:url/:index?", MW.canViewPack, (req, res, next) =>{

		Universe.getTemp(req.sessionID, req.pack, req.params.index)
			.then(nested=>res.json({ current: nested, pack: req.pack }))
			.catch(next);

	})

	// Restart the universe
	app.delete("/api/explore", (req,res,next) =>{
		var query = {
			session_id: req.sessionID,
			expires: { $exists: true }
		}
		Universe.deleteOne(query).then(o=>res.json(o)).catch(next);
	});

	// Read Pack
	// ---------------------------------
	app.get("/api/packs/:pack", MW.canViewPack, (req, res, next) => {

		BuiltPack.findOrBuild(req.pack).then(async (builtpack)=>{
			console.log('after BuiltPack.findOrBuild')	
			var isOwner = req.user && req.pack._user.id === req.user.id;

			// run getGen so correct format
			var generators = {};
			for(var isa in builtpack.generators){
				generators[isa] = builtpack.getGen(isa);
			}

			// get tables
			var tables = await Table.find({ pack: req.pack.id }).select('id title returns').exec()
			tables.sort((a,b)=>a.title.localeCompare(b.title));
			
			return res.json(Object.assign({}, req.pack.toJSON(), { 
				generators: generators,
				tables: tables,
				isOwner: isOwner 
			}));
		}).catch(next);
	});

	app.get("/api/packs/:pack/tables", MW.canViewPack, (req, res, next) => {
		Table.find({ pack: req.pack.id }).exec().then(async (tables)=>{
			tables.sort((a,b)=>a.title.localeCompare(b.title));
			return res.json(tables);
		}).catch(next);
	});

	app.get("/api/builtpack/:pack", MW.canViewPack, (req, res, next) => {
		BuiltPack.findOrBuild(req.pack).then(builtpack=>{
			if(!builtpack) 
				res.status(404).json({"error": "Cannot find pack with id "+req.params.pack})
			return res.json(builtpack);
		}).catch(next)
	});

	app.put("/api/builtpacks/:pack/rebuild", MW.canEditPack, (req, res, next) => {
		BuiltPack.rebuild(req.pack).then(builtpack=>{
			if(!builtpack) 
				res.status(404).json({"error": "Cannot find pack with id "+req.params.pack})
			return res.json(builtpack);
		}).catch(next)
	});

	
	// Get generator names
	// ---------------------------------
	app.get("/api/builtpacks/:pack/generators", MW.canViewPack, (req, res, next) => {
		BuiltPack.findOrBuild(req.pack).then(builtpack=>{
			if(typeof builtpack === 'object')
				res.json(Object.keys(builtpack.generators).sort((a,b)=>a.localeCompare(b)))
			res.status(404);
		}).catch(next);
	});

	// Create Pack
	// ---------------------------------

	//TODO: Check public packs have unique names
	app.post("/api/packs", MW.isLoggedIn, (req, res, next) => {
		var newPack = req.body;
		newPack._user = req.user._id;
		delete newPack.seed; //can't set, don't have any generators yet

		Pack.create(newPack).then(newPack => {
			return res.json(newPack);
		}).catch(next);
	});

	// Update Pack
	// ---------------------------------
	app.put("/api/packs/:pack", MW.canEditPack, (req, res, next) => {
		var newVals = req.body;

		// validate exists
		if(newVals.seed){
			BuiltPack.findOrBuild(req.pack)
				.then(builtpack=>{
					if(!req.pack.seedIsValid(newVals.seed, builtpack)){
						return res.status(412).json({ error: "Seed is not valid: "+newVals.seed});
					}
					else save();
				})
				.catch(next);
		}
		else save();

		function save(){
			// fields that cannot be changed
			req.pack.set(newVals);
			req.pack.save().then((updatedPack)=>{
				res.json(updatedPack);
			}).catch(next);
		}
	});

	// Delete Pack
	// ---------------------------------

	//TODO: Delete all the things and tables that belong to that pack
	app.delete("/api/packs/:pack", MW.isLoggedIn, (req, res, next) => {
		Pack.findOneAndRemove({ _id: req.params.pack, _user: req.user.id }).then((doc) => {
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
		}).catch(next);
	});

};

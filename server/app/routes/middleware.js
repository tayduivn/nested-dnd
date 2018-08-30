
const Pack = require("../models/pack");
const BuiltPack = require("../models/builtpack");
const Util = require("../models/utils");
const User = require("../models/user");
const Universe = require("../models/universe");
const Table = require("../models/table");
const Character = require("../models/character");

module.exports = {

	isLoggedIn: function(req, res, next) {
		// do any checks you want to in here

		// CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
		// you can do this however you want with whatever variables you set up
		if (req.isAuthenticated())
			return next();

		// IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
		res.status(401).json({error:"You need to be logged in to do that"})
		return false;
	},

	isAdmin: function(req,res, next) {

		if(req.user.role === "administrator"){
			return next();
		}

		res.status(401).json({error:"You need to be an administrator to do that"})
	},

	canViewTable: function(req, res, next){
		return Table.findById(req.params.table).exec().then(table=>{
			if(!table) return res.status(404);

			if(!table.public && (!req.user || table.user.toString() !== req.user.id))
				return res.status(401).json({error: "You do not have permission to view this table"})

			req.table = table;
			next();
		}).catch(next)
	},

	canEditTable: function(req, res, next){
		return Table.findById(req.params.table).exec().then(table=>{
			if(!table) return res.status(404);

			if(!req.user || table.user.toString() !== req.user.id)
				return res.status(401).json({error: "You do not have permission to edit this table"})

			req.table = table;
			next();
		}).catch(next)
	},

	canViewPack: function(req, res, next){
		console.log('canViewPack');
		return getPack(req, res, ()=>{
			if(!req.pack) return;

			if(req.pack.public || (req.user && req.pack._user.id === req.user.id)) {
				return next();
			}
			else {
				return res.status(401).json({error: "You do not have permission to view this pack"})
			}
		});
	},

	ownsUniverse: function(req, res, next){
		var getProperties = (req.params.index !== undefined || req.url.includes('/explore')) ? undefined : 'title user_id pack favorites array';
		
		Universe.findById(req.params.universe, getProperties).populate('pack').then(async (universe)=>{
			if(!universe) return res.status(404).send();
			if(!req.user || universe.user_id.toString() !== req.user.id) 
				return res.status(401).json({error: "You do not have permission to view this universe"})
			req.universe = universe;
			req.universe.pack = universe.pack;
			next();
		}).catch(next);
	},

	ownsCharacter: function(req, res, next){
		Character.findById(req.params.character).populate('universe','_id pack').then(async (char)=>{
			if(!char) return res.status(404).send();
			if(!req.user || char.user.toString() !== req.user.id) 
				return res.status(401).json({error: "You do not have permission to view this character"})
			req.character = char;
			next();
		}).catch(next);
	},

	canEditPack: function(req, res, next){

		if (!req.isAuthenticated())
			res.status(401).json({error:"You need to be logged in to edit packs."})

		return getPack(req, res, ()=>{

			if(!req.pack)  return;

			if(req.user && req.pack._user.id === req.user.id) {
				return next();
			}
			else {
				return res.status(401).json({error: "You do not have permission to edit this pack"})
			}
		});
	},

	errorHandler: function (err, req, res, next) {

		// headers already sent, continue
		if (res.headersSent) {
			return next(err);
		}
		
		if(err.status) // user error
			res.status(err.status);
		else{
			res.status(500);
			console.error(err); // internal error
			console.error(err.fileName+" | col:"+err.columnNumber+" | line:"+err.lineNumber); // internal error
			console.error(err.stack);
		}

		var errJSON = Util.toJSON(err);

		if(errJSON.errmsg){
			errJSON.message = err.errmsg;
			delete errJSON.errmsg;
		}
		
		return res.json({ error: {
			message: err.message,
			stack: err.stack
		}  });
	},

	getLoggedInUser(req, res, next){
		req.sessionStore.get(req.sessionID, function(err, mySession) {
			if (mySession && mySession.passport && mySession.passport.user) {
				User.find(mySession.passport.user, function(err, user) {
					req.user = user;
					next();
				});
			} else {
				next();
			}
		});
	}
	
}

/** 
	 * Puts the pack in the req object
	 */  
function getPack(req, res, next){
	console.log('getPack');
	var packGetter;

	if(req.params.pack)
		packGetter = Pack.findOne({ _id: req.params.pack }).populate('_user', "name id")
	else if(req.params.url)
		packGetter = Pack.findOne({ url: req.params.url }).populate('_user', "name id")
	else return res.status(412).json({"error": "Missing pack id"});

	console.log('packGetter.exec()');
	return packGetter.exec().then(pack=>{
		console.log('then(pack=>');

		if(!pack){
			console.log('COULDNT FIND PACK')
			var error = {"error": "Couldn't find pack? "+req.params.pack+req.params.url};
			if(!res.headersSent) {
				res.status(404).json(error)
			}
			return next(error);
		}
		console.log('FOUND PACK')

		req.pack = pack;

		if(next){
			next();
		}
		return;
			
	}).catch(next)
};
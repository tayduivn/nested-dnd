
const Pack = require("../models/pack");
const BuiltPack = require("../models/builtpack");
const Util = require("../models/utils");
const User = require("../models/user");

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

	canViewPack: function(req, res, next){
		getPack(req, res, ()=>{
			if(!req.pack)  return;

			if(req.pack.public || req.pack._user.id === req.user.id) {
				return next();
			}
			else {
				return res.status(401).json({error: "You do not have permission to view this pack"})
			}
		});
	},

	canEditPack: function(req, res, next){

		if (!req.isAuthenticated())
			res.status(401).json({error:"You need to be logged in to edit packs."})

		getPack(req, res, ()=>{

			if(!req.pack)  return;

			if(req.pack._user.id === req.user.id) {
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
		
		return res.json({ error: Util.toJSON(err) });
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
	var packGetter;

	if(req.params.pack)
		packGetter = Pack.findOne({ _id: req.params.pack }).populate('_user')
	else if(req.params.url)
		packGetter = Pack.findOne({ url: req.params.url }).populate('_user')
	else return res.status(412).json({"error": "Missing pack id"});

	packGetter.exec().then(pack=>{

		if(!pack){
			var error = {"error": "Couldn't find pack? "+req.params.pack+req.params.url};
			if(!res.headersSent) {
				res.status(404).json(error)
			}
			return next(error);
		}

		req.pack = pack;

		if(next){
			next();
		}
		return;
			
	}).catch(next)
};
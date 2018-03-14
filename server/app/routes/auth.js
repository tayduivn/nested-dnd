const User = require("../models/user");
const md = require("./middleware.js");

module.exports = function(app, passport) {

	app.post("/api/login", function(req, res, next) {
		passport.authenticate("local", function(err, user, info) {
			if (err) {
				return res.status(401).json(err);
			}
			if (!user) {
				return res.status(401).send(info);
			}
			req.logIn(user, function(err) {

				if (err) {
					return res.status(401).json(err);
				}

				res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    		res.header('Access-Control-Allow-Credentials','true')

				return res.json(user);
			});
		})(req, res, next);
	});

	app.post("/api/signup", function(req, res, next) {
		passport.authenticate("local-signup", function(err, user, info) {
			if (err) {
				return res.status(401).json(err);
			}
			if (!user) {
				return res.status(401).send(info);
			}
			req.logIn(user, function(err) {

				if (err) {
					return res.status(401).json(err);
				}

				res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    		res.header('Access-Control-Allow-Credentials','true')

				return res.json(user);
			});
		})(req, res, next);
	});

	app.delete("/api/account", md.isLoggedIn, function(req, res, next) {
		// TODO: Delete all their stuff

		User.findById(req.user._id).then(async (user)=>{
			if(!user) 
				return res.status(404).json({"errorMessage": "Could not find logged in user", "error": err});

			var deletedObjects = await user.remove();
			logout(req, res, function(){
				res.json(deletedObjects);
			});
			

		}).catch(next);
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.post("/api/logout", function(req, res) {
		logout(req,res,(err)=>{
			if(err) return res.status(500).json(err);
			res.json({"success":"Successfully logged in as "+req.user});
		});
	});

	function logout(req, res, callback){
		req.logout();
		req.session.destroy(function(err) {
			if (!err) {
				res.clearCookie("connect.sid", {
					path: "/",
					httpOnly: true,
					secure: false,
					maxAge: null
				});
				callback(null);
			} 
			else callback(err);
		});
	}

	app.get("/api/user", function(req, res) {
		if (req.user) {
			res.json(req.user);
		} else {
			res.status(401).send();
		}
	});


	app.get("/api/loggedOn", function(req, res) {
		return res.json({ loggedOn: !!req.user });
	});

	
};
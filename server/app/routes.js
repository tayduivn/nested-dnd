module.exports = function(app, passport) {
	// test
	app.get("/api/hello", (req, res) => {
		res.send({ express: "Hello From Express" });
	});

	// test
	app.post("/api/quotes", (req, res) => {
		console.log(req.body);

		db.collection("test").save(req.body, (err, result) => {
			if (err) return console.log(err);

			console.log("saved to database");
			res.redirect("/");
		});
	});

	app.post("/api/signup", (req, res) => {
		passport.authenticate("local-signup", (err, user, info) => {
			if(err){
				return res.status(401).json(err);
			}
			if(!user){
				return res.status(401).send(info);
			}

			req.logIn(user, function(err) {
				if (err) { return res.status(401).json(err); }
				return res.json(user);
			});

		})(req, res)
	});

	app.post("/api/login", (req, res) => {
		passport.authenticate("local-login", (err, user, info) => {
			if(err){
				return res.status(401).json(err);
			}
			if(!user){
				return res.status(401).send(info);
			}

			res.header('Access-Control-Allow-Credentials', true);

			req.login(user, function(err) {
				console.log("Is authenticated = "+req.isAuthenticated());

				if (err) { return res.status(401).json(err); }

				req.session.save();
				return res.json(user);
			});

			
		})(req, res), function(req,res){
			req.session.save();
		}
	});

	// =====================================
  // LOGOUT ==============================
  // =====================================
	app.post('/api/logout', function(req, res) {
		req.logout();
		req.logOut();
		req.session.destroy(function (err) {
			if(!err){
				res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: false, maxAge: null });
				res.status(200).json({status: "Success"});
			}
			else
				res.status(500).json(err)
		});
	});

	app.get('/api/user', function(req,res){
		console.log("/api/user Is authenticated = "+req.isAuthenticated());
		if(req.isAuthenticated()){
			res.json(req.user);
		}
		else{
			res.status(401).send()
		}
	})

	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

		// if user is authenticated in the session, carry on
		if (req.isAuthenticated()) return next();

		// if they aren't redirect them to the home page
		res.redirect("/");
	}
};

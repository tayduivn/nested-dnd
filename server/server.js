"use strict";

//get all the packages
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const morgan = require("morgan");
const config = require("./config.js");

const app = express();
const port = process.env.PORT || 5000;

let db;

// serve static files in production
if (process.env.NODE_ENV === "production") {
	const staticPath = path.join(__dirname, "/../client/build");
	app.use(express.static(staticPath));
	console.log("Serving static files at / from " + staticPath);
} else {
	//connect to dev database
	mongoose.connect("mongodb://localhost:27017/nested-dnd");
}

require("./config/passport")(passport); // pass passport for configuration

app.use(morgan("dev")); // log every request to the console
app.enable("trust proxy");

// set up parsers
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser()); // read cookies (needed for auth)

//auth
app.use(
	session({
		secret: 'mysecret',
		proxy: undefined, // Uses the "trust proxy" setting from express
		unset: "destroy",
		resave: false,
		store: new MongoStore({ 
			mongooseConnection: mongoose.connection,
			stringify: false
		}),
		name: "sessionid",
		saveUninitialized: true
	})
); // session secret

app.use(function(req, res, next) {
	req.sessionStore.get(req.sessionID, function(err, mySession) {
		if (mySession && mySession.passport && mySession.passport.user) {
			db.users.find(mySession.passport.user, function(err, user) {
				req.user = user;
				next();
			});
		} else {
			next();
		}
	});
});
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================

// load our routes and pass in our app and fully configured passport
require("./app/routes/auth.js")(app, passport); 
require("./app/routes/packs.js")(app, mongoose);
require("./app/routes/generators.js")(app, mongoose);
require("./app/routes/tables.js")(app, mongoose);


// 404 error handler returns json
app.use("/api", function(req, res, next){
	res.status(404).json({error: "URL "+req.url+" not found"});
	return;
});

// generic error handler
app.use(function (err, req, res, next) {

	// headers already sent, continue
	if (res.headersSent) {
		return next(err);
	}

	// user error
	if(err.name === "Precondition Failed" || err.name === "ValidationError")
		return res.status(412).json({error: err.message});

	// internal error
	console.error(err.name+" on request "+req.url+": "+err.toString());
	console.log(err.stack);
	return res.status(500).json({ error: err.stack });
})


// launch ======================================================================

app.listen(port, () => console.log(`Listening on port ${port}`));

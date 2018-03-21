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

const app = express();
const port = process.env.PORT || 3001;

let db;

// serve static files in production
if (process.env.NODE_ENV === "production") {
	const staticPath = path.join(__dirname, "/../client/build");
	app.use(express.static(staticPath));
	console.log("Serving static files at / from " + staticPath);
} 

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nested-dnd", 
	function (err, client) {
		if (err) {
			console.log(err);
			throw new Error("Couldn't connect to mongo database")
		}
		else{
			// launch ======================================================================
			app.listen(port, () => console.log(`Listening on port ${port}`));
		}
	});


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
		secret: process.env.SESSION_SECRET || 'mysecret',
		proxy: undefined, // Uses the "trust proxy" setting from express
		unset: "destroy",
		resave: false,
		store: new MongoStore({ 
			mongooseConnection: mongoose.connection,
			stringify: false
		}),
		name: "sessionid",
		saveUninitialized: true,
		cookie:{
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
		}
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
	res.status(404).send("");
	return;
});

// generic error handler
app.use(function (err, req, res, next) {

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
	
	return res.json({ error: err.toJSON() });
})

if (!("toJSON" in Error.prototype)){
	Object.defineProperty(Error.prototype, "toJSON", {
		value: function() {
			var alt = {};

			Object.getOwnPropertyNames(this).forEach(function(key) {
				alt[key] = this[key];
			}, this);

			return alt;
		},
		configurable: true,
		writable: true
	});
}
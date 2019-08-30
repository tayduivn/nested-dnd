"use strict";

require("dotenv").config();

//get all the packages
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const morgan = require("morgan");
const enforce = require("express-sslify");

const app = express();
const port = process.env.PORT || 3001;
const server = require("http").createServer(app);
//const io = require("socket.io")(server);

const { MW } = require("./app/util");
const { NOT_FOUND } = require("./app/util/status");

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);

// serve static files in production and enforce https
if (process.env.NODE_ENV === "production") {
	app.use(enforce.HTTPS({ trustProtoHeader: true }));

	const staticPath = path.join(__dirname, "/../client/build");
	app.use(express.static(staticPath));
}

if (process.env.NODE_ENV !== "test") {
	mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/nested-dnd", function(
		err
	) {
		if (err) {
			throw new Error("Couldn't connect to mongo database");
		} else {
			// launch ======================================================================
			server.listen(port, () => console.log(`Listening on port ${port}`));
		}
	});
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
		secret: process.env.SESSION_SECRET || "mysecret",
		proxy: undefined, // Uses the "trust proxy" setting from express
		unset: "destroy",
		resave: false,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			stringify: false
		}),
		name: "sessionid",
		saveUninitialized: false,
		cookie: {
			maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in ms
		}
	})
); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
// app.use(MW.getLoggedInUser);
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================

app.use("/api", require("./config/routes"));

// 404 error handler returns json
app.use("/api", function(req, res) {
	res.status(NOT_FOUND).json({ errors: [{ title: "404 Not Found" }] });
	return;
});

// serve static files in production
if (process.env.NODE_ENV === "production") {
	// Express serve up index.html file if it doesn't recognize route
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "/../client/build/index.html"));
	});
}

// generic error handler
app.use(MW.errorHandler);

module.exports = app;

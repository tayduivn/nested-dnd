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
const server = require("http").createServer(app);
//const io = require("socket.io")(server);

const MW = require("./app/routes/middleware");

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);

// serve static files in production
if (process.env.NODE_ENV === "production") {
	const staticPath = path.join(__dirname, "/../client/build");
	app.use(express.static(staticPath));
}

if (process.env.NODE_ENV !== "test") {
	mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nested-dnd", function(
		err
	) {
		if (err) {
			console.log(err);
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
		saveUninitialized: true,
		cookie: {
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
		}
	})
); // session secret

app.use(MW.getLoggedInUser);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================

const auth = require("./app/routes/auth");
const builtpacks = require("./app/routes/builtpacks");
const characters = require("./app/routes/characters");
const explore = require("./app/routes/explore");
const packs = require("./app/routes/packs");
const playersPreview = require("./app/routes/players-preview");
const tables = require("./app/routes/tables");
const universes = require("./app/routes/universes");
const normal = require("./app/routes/normal");

// load our routes and pass in our app and fully configured passport
app.use("/api", auth);

app.use("/api/builtpacks", builtpacks);
app.use("/api/characters", characters);
app.use("/api/explore", explore);
app.use("/api/packs", packs);
app.use("/api/players-preview", playersPreview);
app.use("/api/tables", tables);
app.use("/api/universes", MW.isLoggedIn, universes);
app.use("/api/normal", normal);

// 404 error handler returns json
app.use("/api", function(req, res) {
	res.status(404).json({ error: { message: "404 Not Found" } });
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

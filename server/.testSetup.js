const assert = require("assert");
const sinon = require("sinon");
const bodyParser = require("body-parser");
const express = require("express");
const passport = require("passport");

require("sinon-mongoose");
require("ignore-styles");
require("chai").should();

require("./config/passport")(passport);
const MW = require("./app/routes/middleware");
const User = require("./app/models/user");
const Pack = require("./app/models/pack");
const BuiltPack = require("./app/models/builtpack");
const { Generator } = require("./app/models/generator");
const Table = require("./app/models/table");
const Universe = require("./app/models/universe");

//const app = require("./server"); // just run it as a sanity check for code coverage
var app = express();

app.use(passport.initialize());
app.use((req, res, next) => {
	req.session = {
		passport: {
			user: {}
		}
	};
	req.session.destroy = cb => {
		cb();
	};
	req.sessionStore = {};
	req.sessionStore.get = (sessionID, callback) => {
		callback(null, req.session);
	};
	sinon.stub(User, "find").callsFake((user, callback) => {
		req.session.passport.user = user;
		callback(null, req.session);
	});

	MW.getLoggedInUser(req, res, next);

	User.find.restore();
});

app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({ extended: true }));

const packs = require("./app/routes/packs");
const auth = require("./app/routes/auth");
const builtpacks = require("./app/routes/builtpacks");
const characters = require("./app/routes/characters");
const explore = require("./app/routes/explore");

const playersPreview = require("./app/routes/players-preview.js");
const tables = require("./app/routes/tables");
const universes = require("./app/routes/universes");
const normal = require("./app/routes/normal");

// load our routes and pass in our app and fully configured passport
app.use("/api", auth);

app.use("/api/packs", packs);
app.use("/api/builtpacks", builtpacks);
app.use("/api/characters", characters);
app.use("/api/explore", explore);
app.use("/api/players-preview", playersPreview);
app.use("/api/tables", tables);
app.use("/api/universes", MW.isLoggedIn, universes);
app.use("/api/normal", normal);

app.use(MW.errorHandler);
app.use("/api", function(req, res) {
	res.status(404).json({ error: { message: "404 Not Found" } });
	return;
});

// stubs
//
const saveFunc = async function(callback) {
	await this.validate(function(err) {
		if (err) {
			if (callback) callback(err);
			else throw err;
		}
	});
	if (callback) callback(null, this); // no errors
	return Promise.resolve(this);
};

const createFunc = async function(data, callback) {
	const C = this;
	var t = new C(data);
	await t.validate(function(err) {
		if (err) {
			if (callback) callback(err);
			else throw err;
		}
	});
	t.exec = Promise.resolve(t);
	t.then = Promise.resolve(t);

	if (callback) callback(null, t); // no errors
	return Promise.resolve(t);
};

sinon.stub(User.prototype, "save").callsFake(saveFunc);
sinon.stub(Pack.prototype, "save").callsFake(saveFunc);
sinon.stub(BuiltPack.prototype, "save").callsFake(saveFunc);
sinon.stub(Generator.prototype, "save").callsFake(saveFunc);
sinon.stub(Table.prototype, "save").callsFake(saveFunc);
sinon.stub(Universe.prototype, "save").callsFake(saveFunc);

sinon.stub(User, "create").callsFake(createFunc);
sinon.stub(Pack, "create").callsFake(createFunc);
sinon.stub(BuiltPack, "create").callsFake(createFunc);
sinon.stub(Generator, "create").callsFake(createFunc);
sinon.stub(Table, "create").callsFake(createFunc);
sinon.stub(Universe, "create").callsFake(createFunc);

global.app = app;

global.assertThrowsAsync = async function(test, error) {
	var result;
	try {
		result = await test();
	} catch (e) {
		if (!error || e instanceof error) {
			return "everything is fine";
		}
	}
	throw new assert.AssertionError({
		message:
			"Missing rejection" + (error ? " with " + error.name : "") + ". Function returned " + result
	});
};

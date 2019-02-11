const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");
const assert = require("assert");
const sinon = require("sinon");
const JSDOM = require("jsdom").JSDOM;
const bodyParser = require("body-parser");
const express = require("express");
const passport = require("passport");

require("sinon-mongoose");
require("@babel/register")();
require("babel-polyfill");
require("ignore-styles");
require("es6-promise").polyfill();
require("chai").should();
//require('isomorphic-fetch');

enzyme.configure({ adapter: new Adapter() });

const exposedProperties = ["window", "navigator", "document"];

// Set up globals
const document = (global.document = new JSDOM("<!DOCTYPE html>", {
	url: "https://nested-dnd.herokuapp.com"
}).window.document);
const window = (global.window = document.defaultView);
global.navigator = {
	userAgent: "node.js"
};
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
global.location = Object.assign({}, global.window.location, {
	configurable: true,
	replace: sinon.stub(),
	href: global.window.location.href || "",
	set: function(o) {
		global.window.location.href = o;
	}
});

var clonedLocation;
Object.defineProperty(window, "location", {
	get: function() {
		return clonedLocation;
	},
	set: function(o) {
		if (typeof o === "string") {
			o = o + "?id=1";
		}
		clonedLocation = o;
	}
});
Object.keys(window || {}).forEach(property => {
	if (typeof global[property] === "undefined") {
		exposedProperties.push(property);
		global[property] = document.defaultView[property];
	}
});

const CanvasStub = {
	fillRect: function() {},
	clearRect: function() {},
	getImageData: function(x, y, w, h) {
		return {
			data: new Array(w * h * 4)
		};
	},
	putImageData: function() {},
	createImageData: function() {
		return [];
	},
	setTransform: function() {},
	drawImage: function() {},
	save: function() {},
	fillText: function() {},
	restore: function() {},
	beginPath: function() {},
	moveTo: function() {},
	lineTo: function() {},
	closePath: function() {},
	stroke: function() {},
	translate: function() {},
	scale: function() {},
	rotate: function() {},
	arc: function() {},
	fill: function() {},
	measureText: function() {
		return { width: 0 };
	},
	transform: function() {},
	rect: function() {},
	clip: function() {}
};
global.window.HTMLCanvasElement.prototype.getContext = function() {
	return CanvasStub;
};
global.window.HTMLCanvasElement.prototype.toDataURL = function() {
	return "";
};

global.fetchReturn = {};

function storageMock() {
	var storage = {};

	return {
		setItem: function(key, value) {
			storage[key] = value || "";
		},
		getItem: function(key) {
			return key in storage ? storage[key] : null;
		},
		removeItem: function(key) {
			delete storage[key];
		},
		get length() {
			return Object.keys(storage).length;
		},
		key: function(i) {
			var keys = Object.keys(storage);
			return keys[i] || null;
		}
	};
}

// causes request size doesn't match content length
window.fetch = function() {
	return Promise.resolve({
		body: {},
		status: 200,
		headers: {
			get: () => {
				return "application/json";
			}
		},
		json: () => Promise.resolve(global.fetchReturn)
	});
};
if (!window.localStorage) {
	window.localStorage = storageMock();
}

class TD {}

global.TextDecoder = TD;

window.parseInt = int => int;

require("./server/config/passport")(passport);
const MW = require("./server/app/routes/middleware");
const User = require("./server/app/models/user");
const Pack = require("./server/app/models/pack");
const BuiltPack = require("./server/app/models/builtpack");
const { Generator } = require("./server/app/models/generator");
const Table = require("./server/app/models/table");
const Universe = require("./server/app/models/universe");

//const app = require("./server/server"); // just run it as a sanity check for code coverage
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

const packs = require("./server/app/routes/packs");
const auth = require("./server/app/routes/auth");
const builtpacks = require("./server/app/routes/builtpacks");
const characters = require("./server/app/routes/characters");
const explore = require("./server/app/routes/explore");

const playersPreview = require("./server/app/routes/players-preview.js");
const tables = require("./server/app/routes/tables");
const universes = require("./server/app/routes/universes");
const normal = require("./server/app/routes/normal");

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

var documentRef = document;

global.app = app;

const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");
const assert = require("assert");
const sinon = require("sinon");
const JSDOM = require("jsdom").JSDOM;

require("ignore-styles");
require("es6-promise").polyfill();
require("chai").should();

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

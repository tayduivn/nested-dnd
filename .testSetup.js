const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const assert = require('assert');
const sinon = require('sinon');
require('sinon-mongoose');

require('babel-register')();
require('ignore-styles');
require('es6-promise').polyfill();
require('isomorphic-fetch');

enzyme.configure({ adapter: new Adapter() });

const jsdom = require('jsdom').jsdom;

const bodyParser = require("body-parser");
const express = require('express');
const passport = require("passport");
const MW = require('./server/app/routes/middleware');
require("./server/config/passport")(passport);

const User = require("./server/app/models/user");
const Pack = require("./server/app/models/pack");
const BuiltPack = require("./server/app/models/builtpack");
const Generator = require("./server/app/models/generator");
const Table = require("./server/app/models/table");
const Universe = require("./server/app/models/universe");

const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

if (!global.window.localStorage) {
  function storageMock() {
    var storage = {};

    return {
      setItem: function(key, value) {
        storage[key] = value || '';
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
  global.window.localStorage = storageMock();
}

global.navigator = {
  userAgent: 'node.js'
};

global.assertThrowsAsync = async function(test, error) {
  var result;
  try {
      result = await test();
  } catch(e) {
      if (!error || e instanceof error){
      	return "everything is fine";
      } 
  }
  throw new assert.AssertionError({
  	message: "Missing rejection" + (error ? " with "+error.name : "")+". Function returned "+result 
  });
}

var app = express();
app.use(bodyParser.json()); // parse application/json
app.use(passport.initialize());
app.use((req, res, next)=>{
	req.session = {
		passport: {
			user: {}
		}
	};
	req.session.destroy = (cb)=>{cb()};
	req.sessionStore = {};
	req.sessionStore.get = (sessionID, callback)=>{
		callback(null, req.session);
	}
	sinon.stub(User, 'find').callsFake((user,callback)=>{
		req.session.passport.user = user;
		callback(null, req.session);
	})

	MW.getLoggedInUser(req, res, next); 

	User.find.restore();
});
require("./server/app/routes/auth.js")(app, passport); 
require("./server/app/routes/packs.js")(app);
require("./server/app/routes/generators.js")(app);
require("./server/app/routes/tables.js")(app);
app.use(MW.errorHandler)
app.use("/api", function(req, res, next){
	res.status(404).json({error: { message: "404 Not Found"}});
	return;
});
global.app = app;

// stubs 
// 
const saveFunc = async function(callback){
	await this.validate(function(err){
		if(err){
			if(callback) callback(err) 
			else throw err;
		}
	});
	if(callback) callback(null, this); // no errors
	return Promise.resolve(this);
}

const createFunc = async function (data, callback){
	const C = this;
	var t = new C(data);
	await t.validate(function(err){
		if(err){
			if(callback) callback(err) 
			else throw err;
		}
	})
	t.exec = Promise.resolve(t);
	t.then = Promise.resolve(t);

	if(callback) callback(null, t); // no errors
	return Promise.resolve(t);
}

sinon.stub(User.prototype, 'save').callsFake(saveFunc);
sinon.stub(Pack.prototype, 'save').callsFake(saveFunc);
sinon.stub(BuiltPack.prototype, 'save').callsFake(saveFunc);
sinon.stub(Generator.prototype, 'save').callsFake(saveFunc);
sinon.stub(Table.prototype, 'save').callsFake(saveFunc);
sinon.stub(Universe.prototype, 'save').callsFake(saveFunc);

sinon.stub(User, 'create').callsFake(createFunc)
sinon.stub(Pack, 'create').callsFake(createFunc)
sinon.stub(BuiltPack, 'create').callsFake(createFunc)
sinon.stub(Generator, 'create').callsFake(createFunc)
sinon.stub(Table, 'create').callsFake(createFunc)
sinon.stub(Universe, 'create').callsFake(createFunc)

require('./server/server') // just run it as a sanity check for code coverage

var documentRef = document;



var enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-16');

require('babel-register')();
require('ignore-styles');
require('es6-promise').polyfill();
require('isomorphic-fetch');

enzyme.configure({ adapter: new Adapter() });


var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

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

var documentRef = document;



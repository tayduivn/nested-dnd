const chai = require('chai');
const Explore = require('../app/routes/packs/explore.js');

var assert = require('assert');
describe('Array', function() {
	describe('#indexOf()', function() {
		it('should return -1 when the value is not present', function() {
			assert.equal([1,2,3].indexOf(4), -1);
		});
	});
});

describe('Explore', function(){
	describe('treeToArray()', function(){
		it('should return a tree and an array', function(){
			var { tree, array } = Explore.treeToArray({});
			assert(array instanceof Array, "returned array is an Array");
			assert(tree instanceof Object, "returned tree is an Object");
		});
	})
})
const chai = require('chai');
const Node = require('../app/routes/packs/Node.js');
const Explore = require('../app/routes/packs/explore.js');
const assert = require('assert');
const should = chai.should();


var sampleNode = {
	name: 'foofoo',
	isa: 'foo',
	up: [],
	cssClass: 'black',
	txt: 'white',
	img: 'fooimg',
	icon: 'fa fa-foo',
	in: [
		{
			isa: 'bar'
		},
		{
			name: 'string'
		},
		{
			isa: 'barbar',
			in: true
		}
	]
}

describe('Node', function(){

	describe('_toIndexes()',function(){

		var flat = Node.copy({
			name: 'foofoo',
			isa: 'foo',
			index: 1,
			up: [{
				cssClass: 'blue',
				txt: 'pink',
				name: 'fooparent',
				index: 0
			}],
			cssClass: 'black',
			txt: 'white',
			img: 'fooimg',
			icon: 'fa fa-foo',
			in: [
				{
					isa: 'bar',
					index: 2
				},
				{
					name: 'string',
					index: 3
				},
				{
					isa: 'barbar',
					in: true,
					index: 4
				}
			]
		})._toIndexes();

		it('should set .up to 0', function(){
			flat.up.should.be.a('number').and.equal(0);
		})

		it('should set .in to indexes', function(){
			flat.in.should.be.an('array').with.lengthOf(3).and.have.members([2,3,4]);
		})
	});

	describe('flatten()',function(){

		it('should return a tree and an array with no input', function(){
			var { tree, array } = new Node().flatten();
			assert(array instanceof Array, "returned array is an Array");
			assert(tree instanceof Object, "returned tree is an Object");
		});

		it('should return a tree and an array with good input', function(){
			var { tree, array } = Node.copy(sampleNode).flatten();
			assert(array instanceof Array, "returned array is an Array");
			assert(tree instanceof Object, "returned tree is an Object");

			array.should.have.lengthOf(4);
			array[0].should.have.property('in').that.is.an('array').with.lengthOf(3).and.have.members([1,2,3]);

			//assert(array.length === 4, "array has 4 items");
			//assert(array[0].index === 1, "index is set");
			//assert(tree.in instanceof Array, "return tree has in");
			//assert(tree.in.length === 3, "return tree has 3 children");
			//assert(tree.in[0].up[0].index === 1, "parent is set");
			//assert(array[1].txt === array[0].txt, "style is inherited");
		});

	});

});
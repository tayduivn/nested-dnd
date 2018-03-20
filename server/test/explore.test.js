const chai = require('chai');
const Node = require('../app/routes/packs/Node.js');
const Explore = require('../app/routes/packs/explore.js');
const assert = require('assert');
const should = chai.should();

// what we get out of the make function
// root node

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



describe('Explore', function(){


})
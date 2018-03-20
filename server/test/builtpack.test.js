const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
chai.use(chaiAsPromised);

const BuiltPack = require('../app/models/builtpack');
const Pack = require('../app/models/pack');
const Node = require('../app/routes/packs/Node')

const builtpack = new BuiltPack({
	generators:{
		'universe': {
			isa: 'universe'
		}
	}
})

const pack = new Pack({
	seed: 'universe'
});

describe('BuiltPack',()=>{

	describe('growFromSeed()', function(){
		
		it('should should return a node',function(){
			return builtpack.growFromSeed(pack).should.eventually.be.an.instanceOf(Node)
		})

	})

})
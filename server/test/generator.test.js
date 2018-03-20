const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
chai.use(chaiAsPromised);

const Generator = require('../app/models/generator');
const Pack = require('../app/models/pack');
const BuiltPack = require('../app/models/builtpack');
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

const generator = new Generator({
	isa: 'universe'
})

describe('Generator', ()=>{

	describe('makeAsRoot()', function(){

		it('should should return a node',function(){
			return Generator.makeAsRoot([generator], builtpack).should.eventually.be.an.instanceOf(Node)
		})
	})

})
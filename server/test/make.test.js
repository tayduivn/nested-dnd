const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
chai.use(chaiAsPromised);

const Maker = require('../app/models/generator/make');
const BuiltPack = require('../app/models/builtpack');
const Generator = require('../app/models/generator');
const Nested = require('../app/routes/packs/nested')

const builtpack = new BuiltPack({
	generators:{
		'universe': {
			isa: 'universe'
		}
	}
})

const generator = {
	isa: 'universe'
}

describe('Maker',()=>{

	describe('make()',()=>{

		it('should return a node',()=>{
			return Maker.make(generator, 0, builtpack).should.eventually.be.an.instanceOf(Nested)
		})

	})
})
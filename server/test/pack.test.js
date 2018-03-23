const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require('sinon');
chai.use(chaiAsPromised);

const Pack = require('../app/models/pack');

describe('Pack',()=>{
	
	var pack;

	before(()=>{
		pack = new Pack({
			id: 123,
			seed: 'universe>'
		});

		sinon.stub(pack, 'save').callsFake(()=>this);
	})

	describe('renameSeed',()=>{

		it('should rename the seed',()=>{
			return pack.renameSeed('universe','uni').then(()=>{
				pack.seed.should.equal('uni>');
			})
		})
		
	})

})
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
chai.use(chaiAsPromised);

const Generator = require('../app/models/generator');
const Pack = require('../app/models/pack');
const BuiltPack = require('../app/models/builtpack');
const Nested = require('../app/routes/packs/nested')
const Maintainer = require('../app/models/generator/maintain')

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
});

describe('Generator', ()=>{

	describe('makeAsRoot()', function(){

		it('should should return a node',function(){
			return Generator.makeAsRoot([generator], builtpack).should.eventually.be.an.instanceOf(Nested)
		})
	})

	describe('Maintainer', ()=>{

		var inputGen = {
			in: [
				{
					value: 'test'
				},
				{
					type: 'generator',
					value: 'supercluster'
				},
				{
					type: 'embed',
					value: {
						name: 'box',
						in: [
							{
								type: 'generator',
								value: 'foo'
							},
							{
								type: 'embed',
								value: {
									name: 'box',
									in: [
										{
											value: 'hey'
										},
										{
											type: 'generator',
											value: 'sandwich'
										}
									]
								}
							}
						]
					}
				}
			]
		}

		describe('getGeneratorChildren()',()=>{

			it('should return nested isas', ()=>{
				var result = Maintainer.getGeneratorChildren(inputGen.in);
				result.should.be.an('array').and.have.lengthOf(3);
			})

			it('should handle bad input', ()=>{
				var result = Maintainer.getGeneratorChildren();
				result.should.be.an('array').and.have.lengthOf(0);
				var result = Maintainer.getGeneratorChildren(undefined);
				result.should.be.an('array').and.have.lengthOf(0);
				var result = Maintainer.getGeneratorChildren(null);
				result.should.be.an('array').and.have.lengthOf(0);
			});

		})

	})

})
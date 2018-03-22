const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require('sinon');
chai.use(chaiAsPromised);

const Generator = require('../app/models/generator');
const Pack = require('../app/models/pack');
const BuiltPack = require('../app/models/builtpack');
const Nested = require('../app/routes/packs/nested')
const Maintainer = require('../app/models/generator/maintain')
const assert = require('assert');

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


describe('Maintainer', ()=>{

	var inputGen = {
		_id: 209810293,
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
			},
			{ }
		]
	}
	//stub
	inputGen.markModified = ()=>{};

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

	describe('renameChildren()',()=>{

		it('should rename top level gen', ()=>{
			
			var result = Maintainer.renameChildren(inputGen, 'supercluster', 'super');
			result.should.have.property('in').that.is.an('array');
			result.in[1].should.have.property('value').that.equals('super');

		});

		it('should rename deeply embedded gen', ()=>{
			
			var result = Maintainer.renameChildren(inputGen, 'sandwich', 'sand');
			result.should.have.property('in').that.is.an('array');
			result.in[2].value.in[1].value.in[1].value.should.equal('sand')

		});

		it('should return false if not modified',()=>{
			var result = Maintainer.renameChildren(inputGen, 'asdasd', 'asASASdasd');
			result.should.equal(false);
		})

		it('should return false if no input',()=>{
			var result = Maintainer.renameChildren();
			result.should.equal(false);
		})

	})

	describe('insertNew',()=>{

		var pack, builtpack, data;

		before(()=>{
			 pack = new Pack({
			 	_id: 1
			 });
			 builtpack = new BuiltPack();
			 sinon.stub(builtpack,'rebuildGenerator').callsFake(()=>{});
			 data = { 
			 	isa: 'foo'
			 };
		})

		it('should return with bad input',()=>{
			return Maintainer.insertNew().should.eventually.equal(undefined);
		});

		it('should return a Generator',()=>{
			return Maintainer.insertNew(data, pack, builtpack).should.eventually.be.an.instanceOf(Generator);
		});

		it('should throw error if generator already exists', ()=>{
			builtpack.generators = {
				'test': {}
			}
			return assertThrowsAsync(()=> { return Maintainer.insertNew({isa:"test"},pack,builtpack) }, Error)
		});

		it("should throw error if extends doens't exist in pack", ()=>{
			return assertThrowsAsync(()=> { return Maintainer.insertNew({extends:"asdasdsa"},pack,builtpack) },Error)
		});

		it("should return an error if child generator doesn't exist", ()=>{
			var data = {
				in: [{ 
					type: 'generator',
					value: "alkjdlakjd" 
				}]
			}
			return assertThrowsAsync(()=> { return Maintainer.insertNew(data,pack,builtpack) },ReferenceError)
		})

	});

	describe('cleanAfterRemove()',()=>{

		before(()=>{
			sinon.stub(BuiltPack, "findById").callsFake(function(id){
				var bp =  new BuiltPack({
					_id: id,
					generators:{
						"universe": {}
					}
				});

				sinon.stub(bp, "save").callsFake(function(){
					return this;
				});

				bp.exec = function(){
					return this;
				};

				return bp;
			});
			
		})

		it('should return the builtpack',()=>{
			return Maintainer.cleanAfterRemove.call(generator)
				.should.eventually.be.instanceOf(BuiltPack)
				.and.have.property('_doc').with.property('generators').not.with.property('universe');
		})
	});

})

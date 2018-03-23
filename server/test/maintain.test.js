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




describe('Maintainer', ()=>{

	var builtpack, pack, generator, gens, childGen, inheritorGen;

	before(()=>{
		sinon.stub(Generator, "create").callsFake(function(data){
			return new Generator(data);
		});

		sinon.stub(Generator, "find").callsFake(()=>gens);

		sinon.stub(BuiltPack, "findOrBuild").callsFake(()=>builtpack);

		sinon.stub(BuiltPack, "findById").callsFake(function(id){
			builtpack._id = id;
			return builtpack;
		});
	})

	beforeEach(()=>{

		pack = new Pack({
			name: 'The Pack',
			seed: 'universe>'
		});

		generator = new Generator({
			pack_id: pack._id,
			isa: 'universe',
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
		});

		childGen = new Generator({
			pack_id: pack._id,
			isa: 'supercluster'
		});

		inheritorGen = new Generator({
			pack_id: pack._id,
			isa: 'foo',
			extends: 'supercluster'
		});

		builtpack = new BuiltPack({
			_id: pack._id,
			generators: {
				'universe': generator._doc,
				'supercluster': childGen._doc,
				'foo': inheritorGen._doc
			}
		});

		gens = [generator, childGen, inheritorGen];
		
		sinon.stub(builtpack, "save").callsFake(()=>builtpack);

		sinon.stub(pack, 'save').callsFake(()=>pack);

		builtpack.exec = ()=>builtpack;

		generator.exec = ()=>generator;

		gens.exec = ()=>gens;

		generator.markModified = ()=>{};

	})

	after(()=>{
		Generator.create.restore();
		Generator.find.restore();
		BuiltPack.findOrBuild.restore();
		BuiltPack.findById.restore();
	})

	describe('getGeneratorChildren()',()=>{

		it('should return nested isas', ()=>{
			var result = Maintainer.getGeneratorChildren(generator.in);
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
			
			var result = Maintainer.renameChildren(generator, 'supercluster', 'super');
			result.should.have.property('in').that.is.an('array');
			result.in[1].should.have.property('value').that.equals('super');

		});

		it('should rename deeply embedded gen', ()=>{
			
			var result = Maintainer.renameChildren(generator, 'sandwich', 'sand');
			result.should.have.property('in').that.is.an('array');
			result.in[2].value.in[1].value.in[1].value.should.equal('sand')

		});

		it('should return false if not modified',()=>{
			var result = Maintainer.renameChildren(generator, 'asdasd', 'asASASdasd');
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

		it('should return the builtpack',()=>{
			return Maintainer.cleanAfterRemove.call(generator)
				.should.eventually.be.instanceOf(BuiltPack)
				.and.have.property('_doc').with.property('generators').not.with.property('universe');
		})
	});

	describe('rename()',()=>{

		it('should return undefined if no generator supplied',()=>{
			return Maintainer.rename().should.eventually.equal(undefined);
		});

		it('should return undefined if no generators in pack',()=>{
			return Maintainer.rename().should.eventually.equal(undefined);
		});

		it('should return builtpack if good vars supplied',()=>{
			generator.isa = 'uni';

			return Maintainer.rename(generator, pack, 'universe').then(()=>{
				builtpack._doc.generators.should.have.property('uni');
				pack.seed.should.equal('uni>');
			});
		});

		it('should rename children in builtpack',()=>{
			childGen.isa = 'super';
			return Maintainer.rename(childGen, pack, 'supercluster').then(()=>{
				builtpack.getGen('universe').in[1].value.should.equal('super');
			});
		})

		it('should rename extends in builtpack',()=>{
			childGen.isa = 'super';
			return Maintainer.rename(childGen, pack, 'supercluster').then(()=>{
				builtpack.getGen('foo').extends.should.equal('super');
			});
		})

		it('should return undefined if there are no generators',()=>{
			gens = [];
			gens.exec = ()=>gens;
			return Maintainer.rename(generator, pack, 'universe').should.eventually.equal(undefined);
		});

	})

})

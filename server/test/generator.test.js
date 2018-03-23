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


describe('Generator', ()=>{

	var generator, pack, builtpack;

	before(()=>{
		sinon.stub(Generator, "create").callsFake(function(data){
			return new Generator(data);
		});
	})

	beforeEach(()=>{

		pack = new Pack({
			seed: 'universe'
		});

		generator = new Generator({
			isa: 'universe',
			pack_id: pack._id,
			in: [
				{
					name: 'always',
					chance: 100
				},
				{
					name: 'never',
					chance: 0,
					amount: {
						min: 5,
						max: 5
					}
				},
				{
					name: 'never',
					chance: 0,
					amount: {
						min: 4
					}
				}
			]
		});

		builtpack = new BuiltPack({
			_id: pack._id,
			generators:{
				'universe': generator._doc
			}
		})

	})

	after(()=>{
		Generator.create.restore();
	})

	describe('makeAsRoot()', function(){

		it('should should return a node',function(){
			return Generator.makeAsRoot([generator], builtpack).should.eventually.be.an.instanceOf(Nested)
		})
	})

	describe('extend()', function(){
		var inherited = {
			style: {
				txt: { value: 'blue' },
				bg: { value: 'black' }
			}
		}
		var inheritor = {
			extends: 'inherited',
			style: {
				txt: { value: 'green' },
				icon: { value: 'fi flaticon-castle' }
			}
		}
		var builtpack;

		before(()=>{
			inherited = new Generator(inherited);
			inheritor = new Generator(inheritor);
			builtpack = new BuiltPack({
				generators: {
					inheritor: inheritor._doc,
					inherited: inherited._doc
				}
			});
		});

		it('should combine styles',()=>{
			var newGen = inheritor.extend(builtpack);
			should.exist(newGen._doc);
			newGen._doc.should.have.property('style');
			var s = newGen._doc.style._doc;

			s.should.have.property('icon').with.property('value').that.equals('fi flaticon-castle');
			s.should.have.property('txt').with.property('value').that.equals('green');
			s.should.have.property('bg').with.property('value').that.equals('black');
		})

		it('should work with no style',()=>{
			builtpack = new BuiltPack({
				generators: {
					inheritor: new Generator({extends: 'inherited'})._doc,
					inherited: new Generator()._doc
				}
			});
			var newGen = inheritor.extend(builtpack);
			should.exist(newGen._doc);
		});

		it('should work with only inherited with style',()=>{
			inheritor = new Generator({extends: 'inherited'});
			delete inheritor.style;

			builtpack = new BuiltPack({
				generators: {
					inheritor: inheritor._doc,
					inherited: inherited._doc
				}
			});
			var newGen = inheritor.extend(builtpack);
			should.exist(newGen._doc);
		});

	})


	describe('childSchema', function(){

		describe('.isIncluded', function(){

			it('should return true if chance 100',()=>{
				generator.in[0].isIncluded.should.equal(true);
			})

			it('should return false if chance 0',()=>{
				generator.in[1].isIncluded.should.equal(false);
			})

		});

		describe('.makeAmount',  function(){

			it('should return 1 if not defined', ()=>{
				generator.in[0].makeAmount.should.equal(1);
			})

			it('should return amount if defined', ()=>{
				generator.in[1].makeAmount.should.equal(5);
			})

			it('should return min if only defined', ()=>{
				generator.in[2].makeAmount.should.equal(4);
			})

			it('should return 0 if only min is 0', ()=>{
				generator.in[2].amount.min = 0;
				generator.in[2].makeAmount.should.equal(0);
			})

		})


	})

	
})
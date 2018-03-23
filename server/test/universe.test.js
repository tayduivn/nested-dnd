const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require('sinon');
chai.use(chaiAsPromised);

const Pack = require('../app/models/pack');
const Universe = require('../app/models/universe');
const BuiltPack = require('../app/models/builtpack')
const Nested = require('../app/routes/packs/nested')


describe('Universe', ()=>{

	var universe, pack;

	before(()=>{

		universe = new Universe({
			array: [
				{
					isa: "universe",
					in: [1, 2]
				},
				{
					isa: 'supercluster',
					up: 0
				},
				{
					isa: 'supercluster',
					up: 0
				}
			]
		});

		pack = new Pack({
			seed: 'universe'
		});


		// replace get builtpack function
		sinon.stub(BuiltPack, "findOrBuild").callsFake(function(){
			return new BuiltPack({
				generators:{
					"universe": {}
				}
			});
		});

		sinon.stub(Universe,'find').callsFake((query)=>{
			return [];
		})

	})

	after(()=>{
		BuiltPack.findOrBuild.restore();
	})

	describe('new Universe()',()=>{

		it('should create a blank array with no input', function(){
			var u = new Universe();
			should.exist(u.array);
			u.array.should.be.an('array').with.lengthOf(0);
		})

		it('should have isa', function(){
			should.exist(universe.array[1].isa);
		});

		it('should not have .in', function(){
			should.not.exist(universe.array[1].in);
		});

	});

	describe('getNested()', ()=>{

		var nested;

		before(function() {
			return universe.getNested(1).then(n=>{
				nested = n;
			})
		});

		it('should return a nested instance', ()=>{
			nested.should.be.an.instanceOf(Nested);
		});

		it('should return isa', ()=>{
			nested.should.have.property('isa').which.equals('supercluster');
		});

		it('should not have _id', ()=>{
			should.not.exist(nested._id);
			should.not.exist(nested.id);
		});

		it('should not have in array', ()=>{
			should.not.exist(nested.in);
		});

		it('should have up', ()=>{
			should.exist(nested.up);
			should.exist(nested.up[0].index);
			nested.up[0].index.should.equal(0);
		});

	});

	describe('build()',()=>{

		var universe, tree;

		before(()=>{
			return Universe.build(pack).then((result)=>{
				universe = result.universe;
				tree = result.tree;
			});
		});

		it('should return a universe',()=>{
			should.exist(universe);
			universe.should.be.instanceOf(Universe);
		})

	})

	describe('getTemp()',()=>{

		it('returns a node', ()=>{
			return Universe.getTemp('ljkflskjdf', pack, 0)
		})

	});
})
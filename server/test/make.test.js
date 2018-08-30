const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require('sinon');
chai.use(chaiAsPromised);

const Maker = require('../app/models/generator/make');
const BuiltPack = require('../app/models/builtpack');
const Generator = require('../app/models/generator');
const Table = require('../app/models/table');
const Nested = require('../app/routes/packs/nested')


describe('Maker',()=>{

	var builtpack, generator, table;

	before(()=>{
		sinon.stub(Table, 'findById').callsFake(id=>{
			table._id = id;
			return new Table(table.value);
		})
	})

	beforeEach(()=>{

		generator = new Generator({
			isa: 'universe',
			name: 'blue banana',
			style: {
				"bg": {
					type: 'table',
					value: {
						rows: ['black', 'red']
					}
				}
			},
			in: [
				{ 
					type: 'embed', 
					value: {
						name: 'notincluded',
					},
					amount:{
						min: 0
					}
				},
				{
					type: 'table',
					value: {
						rows: [
							'test',
							'test',
							'test'
						]
					}
				},
				{
					"type": "generator",
					"value": "supercluster"
				},
				{
					type: 'table',
					value: 'asdsad'
				},
				{
					type: 'table_id',
					value: 'asijlakjs'
				},
				{
					type: 'table',
					value: {
						rowWeights: true,
						rows: [
							{ value: 'test', weight: 2},
							{ value: 'test', weight: 2},
							{ value: 'test', weight: 2}
						]
					}
				},
				{
					type: 'table',
					value: {
						tableWeight: 1.3,
						rows: [
							'test',
							'test',
							'test'
						]
					}
				}
			]
		});

		var supercluster = new  Generator({ isa: 'supercluster '})

		builtpack = new BuiltPack({
			generators:{
				'universe': generator._doc,
				'supercluster': supercluster._doc
			}
		});

		table = generator.in[1];
	})

	after(()=>{
		Table.findById.restore();
	})

	describe('make()',()=>{

		it('should return a node',()=>{
			return Maker.make(generator, undefined, builtpack).then((node)=>{
				node.should.be.an.instanceOf(Nested).and.have.property('name','blue banana');
				node.should.have.property('cssClass', 'bg-blue-900')
			});
		})

		it('should return children',()=>{
			return Maker.make(generator, 1, builtpack).should.eventually.be.an.instanceOf(Nested).and.have.property('in').with.lengthOf(5)
		})

		it('should return an error on bad input',()=>{
			return assertThrowsAsync(()=> { return Maker.make() }, Error)
		})

		it('should set in to undefined if no results',()=>{
			generator.in = [generator.in[0]];
			return Maker.make(generator, 1, builtpack).then(n=>{ 
				should.not.exist(n.in);
			})
		})

	})

	describe('makeChild()',()=>{

		it('should return an empty array if bad input',()=>{
			return Maker.makeChild().should.eventually.be.an('array').with.lengthOf(0);
		})

		it('should return empty array if not included', ()=>{
			return Maker.makeChild(generator.in[0], builtpack).should.eventually.be.an('array').with.lengthOf(0);
		})

		it('should return made table', ()=>{
			return Maker.makeChild(generator.in[1], builtpack).should.eventually.be.an('array').with.lengthOf(1);
		})

		it('should return made generator', ()=>{
			return Maker.makeChild(generator.in[2], builtpack).should.eventually.be.an('array').with.lengthOf(1);
		})

		it('should return made table_id', ()=>{
			return Maker.makeChild(generator.in[2], builtpack).should.eventually.be.an('array').with.lengthOf(1);
		})

		it('should return empty array if table is not valid', ()=>{
			return Maker.makeChild(generator.in[3], builtpack).should.eventually.be.an('array').with.lengthOf(0);
		})
	})

	describe('makeMixedThing()', ()=>{

		it('should return undefined if not passed',()=>{
			return Maker.makeMixedThing().then(result=>{
				should.not.exist(result);
			});
			
		})

		it('should return a string if passed',()=>{
			return Maker.makeMixedThing('test').should.eventually.equal('test');
		})

		it('should return a string if type not set',()=>{
			return Maker.makeMixedThing({value: 'test'}).should.eventually.equal('test');
		})

		it('should return a string if type is string',()=>{
			return Maker.makeMixedThing({type: 'string', value: 'test'}).should.eventually.equal('test');
		})

		it('should return a string if type is incorrect',()=>{
			table.value = 'test';
			return Maker.makeMixedThing(table).should.eventually.equal('test');
		})

		it('should roll on table',()=>{
			return Maker.makeMixedThing(table).should.eventually.equal('test');
		})

		it('should roll on table id',()=>{
			return Maker.makeMixedThing({ type: 'table_id', value: 's124' }, Table).should.eventually.equal('test');
		});

		it('should roll on table',()=>{
			var t = {
				type: 'table',
				value: {
					rowWeights: true,
					rows: [
						{ value: 'test', weight: 2},
						{ value: 'test', weight: 2},
						{ value: 'test', weight: 2}
					]
				}
			}
			return Maker.makeMixedThing(t, Table).should.eventually.equal('test');
		})

		it('should concat table',()=>{
			var t = {
				type: 'table',
				value: {
					concat: true,
					rows: [
						'a ',
						'test'
					]
				}
			}
			return Maker.makeMixedThing(t, Table).should.eventually.equal('a test');
		})

		

	})

})
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
chai.use(chaiAsPromised);

const Pack = require('../app/models/pack');
const Nested = require('../app/routes/packs/nested');
const MW = require('../app/routes/middleware');
const packRoutes = require("../app/routes/packs.js");

describe('Pack',()=>{
	
	var pack, app;

	before(()=>{

		require('../server'); // just run it

		sinon.stub(Pack, 'find').callsFake((query)=>{
			var p = new Pack();
			p.exec = (callback => {
				callback();
				return Promise.resolve(()=>p); 
			});
			return p;
		})
		sinon.stub(MW, 'getLoggedInUser').callsFake((req,res,next)=>{
			next() 
		});
		sinon.stub(MW, 'canViewPack').callsFake((req,res,next)=>{
			next() 
		});
		sinon.stub(MW, 'canEditPack').callsFake((req,res,next)=>{
			next() 
		});

		app = express();
		packRoutes(app);
		app.use(MW.errorHandler)

	})

	beforeEach(()=>{
		pack = new Pack({
			id: 123,
			seed: 'universe>'
		});

		sinon.stub(pack, 'save').callsFake(()=>this);
	})

	after(()=>{
		Pack.find.restore();
		MW.getLoggedInUser.restore();
		MW.canViewPack.restore();
		MW.canEditPack.restore();
	})

	describe('renameSeed()',()=>{

		it('should rename the seed',()=>{
			return pack.renameSeed('universe','uni').then(()=>{
				pack.seed.should.equal('uni>');
			})
		})
		
	})

	describe('getSeedFromTree()',()=>{

		it('returns the seed',()=>{
			var tree = {
				isa: 'universe',
			}
			var node = pack.getSeedFromTree(tree);
			node.isa.should.equal('universe');
		});

		it('returns nested seed',()=>{
			pack.seed = 'foo>bar>';
			var tree = {
				isa: 'foo',
				in: [
					{
						isa: 'bar'
					}
				]
			}
			var node = pack.getSeedFromTree(tree);
			node.isa.should.equal('bar');
		})
	})

	describe('routes', ()=>{

		it('returns ok /api/packs',(done)=>{
			request(app)
				.get('/api/packs')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200, done)

		});
	})

})
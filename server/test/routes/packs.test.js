const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require('sinon');
const request = require('supertest')(app);
const express = require('express');
chai.use(chaiAsPromised);
require('sinon-mongoose');

const MW = require('../../app/routes/middleware');
const Pack = require('../../app/models/pack');
const User = require('../../app/models/user');


describe('/api/packs', ()=>{

	var user, pack, packs, PackMock;

	const USER_ID = '5ab53068b647d20b0c7b308a';

	before(()=>{

		sinon.stub(MW, 'getLoggedInUser').callsFake((req, res, next)=>{
			req.user = user;
			next();
		});

		PackMock = sinon.mock(Pack);

	})

	after(()=>{
		MW.getLoggedInUser.restore();
		Pack.find.restore();
	})

	
	describe('GET',()=>{

		it('returns ok signed out',(done)=>{
			PackMock.expects('find')
				.chain('exec')
				.resolves([{},{}]);

			request.get('/api/packs')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(({body})=>{
					body.should.have.property('publicPacks');
					body.should.not.have.property('myPacks');
				})
				.expect(200, done)

		});

		it('returns ok signed in',(done)=>{
			PackMock.expects('find')
				.chain('exec')
				.resolves([{},{}]);

			PackMock.expects('find')
				.chain('exec')
				.resolves([{},{}]);

			user = new User({ _id: USER_ID });

			request.get('/api/packs')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(({body})=>{
					body.should.have.property('publicPacks').with.lengthOf(2);
					body.should.have.property('myPacks').with.lengthOf(2);
				})
				.expect(200, done)
		});
	})

	describe('POST',()=>{

		before(()=>{
			user = new User({ _id: USER_ID, name: 'testing testing' });
		})

		it('creates correctly', ()=>{
			return request.post('/api/pack')
				.set('Accept', 'application/json')
				.send({
					"name": "animals"
				})
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(({body})=>{
					console.log(body);
					body.should.have.property('name', 'animals');
					body.should.have.property('_user', USER_ID);
				});
		});
	})
})
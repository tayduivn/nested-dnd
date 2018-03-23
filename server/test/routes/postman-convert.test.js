const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require('sinon');
const sinonMg = require('sinon-mongoose');
const request = require('supertest');
const mongoose = require('mongoose');
chai.use(chaiAsPromised);

const MW = require('../../app/routes/middleware');

const User = require('../../app/models/user');

const TEST_USER = 'test@test.com';
const TEST_PASS = 'ca9Y5aOSe9dHu!jiFcyje@3QpC5@075c';

describe('auth', ()=>{

	before(()=>{

	});

	describe('sign on', ()=>{

		before(()=>{

			sinon.stub(User,'findOne').callsFake((data, callback)=>{
				return callback(null, null);
			})

		})

		it('returns the logged in user', (done)=>{
			request(app)
				.post('/api/signup')
				.set('Accept', 'application/json')
				.send( { email: TEST_USER, password: TEST_PASS } )
				.expect('Content-Type', /json/)
				.expect((res)=>{
					console.log(res.body);
					var user = res.body.user;

					user.should.have.property('_id')
					user.should.have.property('local').with.property('email', TEST_USER)
					user.should.have.property('name', 'test')
					user.local.should.not.have.property('password');
					res.body.should.have.property('loggedIn').that.is.true;

				})
				.expect(200, done)
		})

		after(()=>{
			User.findOne.restore();
		})

	})

	describe('sign out',()=>{

		it('returns ok', (done)=>{
			request(app)
				.post('/api/logout')
				.expect(200)
				.then(({body})=>{
					should.exist(body.loggedIn);
					body.loggedIn.should.be.false;
					done();
				})
		})

	})
});
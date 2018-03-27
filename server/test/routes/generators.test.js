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
const Generator = require('../../app/models/generator');
const BuiltPack = require('../../app/models/builtpack');

describe('/api/pack/:pack/generator',()=>{

	var PackMock, BPMock, GenMock;

	before(()=>{
		PackMock = sinon.mock(Pack);
		BPMock = sinon.mock(BuiltPack);
		GenMock = sinon.mock(Generator);
	})

	after(()=>{
		Pack.findOne.restore(); //canEditPack
		MW.getLoggedInUser.restore(); //canEditPack
		BuiltPack.findById.restore();
		Generator.find.restore();
	})

	describe('POST', ()=>{

		var dogeData, pack, user, builtpack;

		before(()=>{
			//canEditPack
			sinon.stub(MW, 'getLoggedInUser').callsFake((req, res, next)=>{
				req.user = user;
				next();
			});
		})

		beforeEach(()=>{
			user = new User(); //canEditPack
			pack = new Pack({
				title: 'Test Pack',
				_user: user.id
			});
			builtpack = new BuiltPack({ //findOrBuild
				_id: pack._id
			}); 

			dogeData = {
				"pack_id": pack.id,
				"isa": "doge",
				"style": {
					"icon":{
						"value": "dog"
					}
				}
			}

		})

		it('creates correctly',()=>{
			pack._user = user;

			//canEditPack
			PackMock.expects('findOne')
				.chain('populate')
				.chain('exec')
				.resolves(pack)

			BPMock.expects('findById') //findOrBuild
				.chain('exec')
				.resolves(builtpack);

			GenMock.expects('find')
				.chain('exec')
				.resolves([new Generator(dogeData)]);

			return request.post('/api/pack/'+pack.id+'/generator')
				.send(dogeData)
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(({body})=>{
					body.should.have.property('isa','doge');
					body.should.have.property('pack_id', pack.id);
				});
		});

		it('throws 412 if contains unknown generator',()=>{
			pack._user = user;

			var petstoreData = {
				"isa": "pet ztore",
				"in": [
					{
						"type": "generator",
						"value": "dog",
						"amount": {
							"min": 1,
							"max": 3
						}
					}
				]
			};

			//canEditPack
			PackMock.expects('findOne')
				.chain('populate')
				.chain('exec')
				.resolves(pack)

			BPMock.expects('findById') //findOrBuild
				.chain('exec')
				.resolves(builtpack);

			return request.post('/api/pack/'+pack.id+'/generator')
				.send(petstoreData)
				.expect('Content-Type', /json/)
				.expect(412)
		})

		it('creates complex generator correctly',()=>{
			pack._user = user;

			var petstoreData = {
				"isa": "pet ztore",
				"style": {
					"txt": { "value": "red" },
					"bg":  { "value": "white" }
				},
				"in": [
					{
						"type": "generator",
						"value": "doge",
						"amount": {
							"min": 1,
							"max": 3
						}
					},
					{
						"type": "embed",
						"value": {
							"name": "cage",
							"in": [
								{
									"type": "generator",
									"value": "doge"
								}
							]
						}
					}
				]
			}

			builtpack.generators = {
				"doge": (new Generator(dogeData))._doc
			}

			//canEditPack
			PackMock.expects('findOne')
				.chain('populate')
				.chain('exec')
				.resolves(pack)

			BPMock.expects('findById') //findOrBuild
				.chain('exec')
				.resolves(builtpack);

			GenMock.expects('find') 
				.chain('exec')
				.resolves([new Generator(petstoreData)]);

			return request.post('/api/pack/'+pack.id+'/generator')
				.send(petstoreData)
				.expect('Content-Type', /json/)
				.expect(({body})=>{
					body.should.have.property('isa','pet ztore');
					body.should.have.property('pack_id', pack.id);
					body.should.have.property('in').with.lengthOf(2);
					body.style.should.have.property('txt').with.property('value',"red");
					body.style.should.have.property('bg').with.property('value',"white");
				})
				.expect(200);
		});

	});

});
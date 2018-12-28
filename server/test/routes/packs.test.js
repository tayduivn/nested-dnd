const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require("sinon");
const request = require("supertest")(app);
const express = require("express");
chai.use(chaiAsPromised);
require("sinon-mongoose");

const MW = require("../../app/routes/middleware");
const Pack = require("../../app/models/pack");
const Generator = require("../../app/models/generator");
const User = require("../../app/models/user");
const BuiltPack = require("../../app/models/builtpack");
const Table = require("../../app/models/table");

describe("/packs", () => {
	var user, pack, packs, PackMock, GenMock, BuiltPackMock, TableMock;

	const USER_ID = "5ab53068b647d20b0c7b308a";

	before(() => {
		sinon.stub(MW, "getLoggedInUser").callsFake((req, res, next) => {
			req.user = user;
			next();
		});

		PackMock = sinon.mock(Pack);
		GenMock = sinon.mock(Generator);
		BuiltPackMock = sinon.mock(BuiltPack);
		TableMock = sinon.mock(Table);
	});

	after(() => {
		MW.getLoggedInUser.restore();
		Generator.find.restore();
		BuiltPack.findById.restore();
		Table.find.restore();
	});

	describe("GET", () => {
		it("returns ok signed out", () => {
			PackMock.expects("find")
				.chain("exec")
				.resolves([{}, {}]);

			return request
				.get("/api/packs")
				.set("Accept", "application/json")
				.expect("Content-Type", /json/)
				.expect(({ body }) => {
					body.should.have.property("publicPacks");
					body.should.not.have.property("myPacks");
				})
				.expect(200);
		});

		it("returns ok signed in", () => {
			PackMock.expects("find")
				.chain("exec")
				.resolves([{}, {}]);

			PackMock.expects("find")
				.chain("exec")
				.resolves([{}, {}]);

			user = new User({ _id: USER_ID });

			return request
				.get("/api/packs")
				.set("Accept", "application/json")
				.expect("Content-Type", /json/)
				.expect(({ body }) => {
					body.should.have.property("publicPacks").with.lengthOf(2);
					body.should.have.property("myPacks").with.lengthOf(2);
				})
				.expect(200);
		});
	});

	describe("POST", () => {
		before(() => {
			user = new User({ _id: USER_ID, name: "testing testing" });
		});

		it("creates correctly", () => {
			return request
				.post("/api/packs")
				.set("Accept", "application/json")
				.send({
					name: "animals"
				})
				.expect("Content-Type", /json/)
				.expect(200)
				.expect(({ body }) => {
					body.should.have.property("name", "animals");
					body.should.have.property("_user", USER_ID);
				});
		});
	});

	describe("/:pack", () => {
		before(() => {
			pack = new Pack({
				_user: 123231,
				title: "test",
				public: true
			});
			pack._user = new User();

			GenMock.expects("find")
				.chain("select")
				.resolves([]);

			PackMock.expects("findOne")
				.chain("populate")
				.chain("exec")
				.resolves(pack);

			TableMock.expects("find")
				.chain("select")
				.chain("exec")
				.resolves([]);
			BuiltPackMock.expects("findById")
				.chain("exec")
				.resolves(new BuiltPack(pack));
		});

		describe("GET", () => {
			it("returns when not logged in", () => {
				//logged Out
				user = undefined;

				return request.get("/api/packs/123124").expect(200);
			});
		});
	});
});

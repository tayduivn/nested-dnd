const chai = require("chai");
const sinon = require("sinon");
const request = require("supertest")(app);
chai.use(require("chai-as-promised"));
require("sinon-mongoose");

const Universe = require("../../app/universe/Universe");

describe("/universes", () => {
	var UniMock;

	before(() => {
		UniMock = sinon.mock(Universe);
	});

	after(() => {
		Universe.find.restore();
	});

	it("should return universes", () => {
		UniMock.expects("find").resolves([new Universe()]);
		request
			.get("/api/universes")
			.expect("Content-Type", /json/)
			.expect(({ body }) => {
				body.should.be.an("array").with.lengthOf(1);
			})
			.expect(200);
	});
});

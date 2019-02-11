const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const request = require("supertest")(app);
chai.use(chaiAsPromised);
require("sinon-mongoose");

const MW = require("../../app/routes/middleware");
const Pack = require("../../app/models/pack");
const User = require("../../app/models/user");
const { Generator } = require("../../app/models/generator");
const BuiltPack = require("../../app/models/builtpack");

describe("/packs/:pack/generator", () => {
	var PackMock, BPMock, GenMock, user, pack, builtpack;

	before(() => {
		PackMock = sinon.mock(Pack);
		BPMock = sinon.mock(BuiltPack);
		GenMock = sinon.mock(Generator);

		//canEditPack
		sinon.stub(MW, "getLoggedInUser").callsFake((req, res, next) => {
			req.user = user;
			next();
		});
	});

	beforeEach(() => {
		user = new User();
		pack = new Pack({
			title: "Test Pack",
			_user: user.id
		});
		builtpack = new BuiltPack({
			//findOrBuild
			_id: pack._id,
			generators: {}
		});

		pack._user = user;

		//canEditPack
		PackMock.expects("findOne")
			.chain("populate")
			.chain("exec")
			.resolves(pack);
	});

	after(() => {
		Pack.findOne.restore(); //canEditPack
		MW.getLoggedInUser.restore(); //canEditPack
		BuiltPack.findById.restore();
		Generator.find.restore();
		Generator.findById.restore();
	});

	describe("POST", () => {
		var dogeData = {
			isa: "doge",
			style: {
				icon: {
					value: "dog"
				}
			}
		};

		beforeEach(() => {
			dogeData.pack = pack.id;
		});

		it("creates correctly", () => {
			pack._user = user;

			BPMock.expects("findById") //findOrBuild
				.chain("exec")
				.resolves(builtpack);

			GenMock.expects("find")
				.chain("exec")
				.resolves([new Generator(dogeData)]);

			return request
				.post("/api/packs/" + pack.id + "/generators")
				.send(dogeData)
				.expect("Content-Type", /json/)
				.expect(200)
				.expect(({ body }) => {
					body.should.have.property("unbuilt");
					body.unbuilt.should.have.property("isa", "doge");
					body.unbuilt.should.have.property("pack", pack.id);
				});
		});

		it("throws 412 if contains unknown generator", () => {
			var petstoreData = {
				isa: "pet ztore",
				in: [
					{
						type: "generator",
						value: "dog",
						amount: {
							min: 1,
							max: 3
						}
					}
				]
			};

			BPMock.expects("findById") //findOrBuild
				.chain("exec")
				.resolves(builtpack);

			return request
				.post("/api/packs/" + pack.id + "/generators")
				.send(petstoreData)
				.expect("Content-Type", /json/)
				.expect(412);
		});

		it("creates complex generator correctly", () => {
			var petstoreData = {
				isa: "pet ztore",
				style: {
					txt: { value: "red" },
					bg: { value: "white" }
				},
				in: [
					{
						type: "generator",
						value: "doge",
						amount: {
							min: 1,
							max: 3
						}
					},
					{
						type: "embed",
						value: {
							name: "cage",
							in: [
								{
									type: "generator",
									value: "doge"
								}
							]
						}
					}
				]
			};

			builtpack.generators = {
				doge: new Generator(dogeData)._doc
			};

			BPMock.expects("findById") //findOrBuild
				.chain("exec")
				.resolves(builtpack);

			GenMock.expects("find")
				.chain("exec")
				.resolves([new Generator(petstoreData)]);

			return request
				.post("/api/packs/" + pack.id + "/generators")
				.send(petstoreData)
				.expect("Content-Type", /json/)
				.expect(({ body }) => {
					body.should.have.property("unbuilt");
					var gen = body.unbuilt;
					gen.should.have.property("isa", "pet ztore");
					gen.should.have.property("pack", pack.id);
					gen.should.have.property("in").with.lengthOf(2);
					gen.style.should.have.property("txt").with.property("value", "red");
					gen.style.should.have.property("bg").with.property("value", "white");
				})
				.expect(200);
		});
	});

	describe("/:id", () => {
		var generator;

		describe("GET", () => {
			beforeEach(() => {
				BPMock.expects("findById")
					.chain("exec")
					.resolves(undefined);
				PackMock.expects("findById")
					.chain("exec")
					.resolves(pack);
			});

			it("should get the gen", () => {
				generator = new Generator({
					isa: "test",
					pack: pack._id
				});

				GenMock.expects("findById")
					.chain("exec")
					.resolves(generator);
				GenMock.expects("find")
					.chain("exec")
					.resolves([generator]);

				return request
					.get("/api/packs/" + pack._id + "/generators/" + generator.isa)
					.expect(({ body }) => {
						body.should.have.property("unbuilt");
						body.unbuilt.should.have.property("isa", "test");
					})
					.expect("Content-Type", /json/)
					.expect(200);
			});

			it("should return 404", () => {
				generator = new Generator({
					isa: "test",
					pack: pack._id
				});

				GenMock.expects("find")
					.chain("exec")
					.resolves([]);

				return request
					.get("/api/packs/" + pack.id + "/generators/" + generator.id)
					.expect("Content-Type", /json/)
					.expect(404);
			});
		});

		describe("PUT", () => {
			it("should rename the gen", () => {
				generator = new Generator({
					isa: "test",
					pack: pack._id
				});
				var newData = Object.assign({}, generator._doc);
				newData.isa = "test2";

				GenMock.expects("findById")
					.chain("exec")
					.resolves(generator);
				BPMock.expects("findById")
					.chain("exec")
					.resolves(builtpack); //findOrBuild
				GenMock.expects("find")
					.chain("exec")
					.resolves([new Generator(newData)]);

				return request
					.put("/api/packs/" + pack.id + "/generators/" + generator._id)
					.send(newData)
					.expect(({ body }) => {
						body.unbuilt.should.have.property("isa", "test2");
					})
					.expect("Content-Type", /json/)
					.expect(200);
			});
		});
	});
});

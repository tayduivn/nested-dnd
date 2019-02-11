const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
chai.use(chaiAsPromised);

const BuiltPack = require("../app/models/builtpack");
const Pack = require("../app/models/pack");
const { Generator } = require("../app/models/generator");
const Nested = require("../app/routes/packs/nested");

describe("BuiltPack", () => {
	var builtpack, pack, universe, supercluster, gens;

	before(() => {
		sinon.stub(BuiltPack, "findById").callsFake(function() {
			var blank = {};
			blank.exec = () => null;
			return blank;
		});

		sinon.stub(Generator, "find").callsFake(() => gens);
	});

	beforeEach(() => {
		pack = new Pack({
			seed: "universe>",
			url: "test",
			name: "Test"
		});

		universe = new Generator({
			isa: "universe",
			pack_id: pack._id,
			style: {
				txt: { value: "blue" },
				img: { value: "test.png" },
				icon: { value: "fa fa-amazing" },
				bg: { value: "black" },
				pattern: { value: "purty-wood" }
			},
			in: [
				{
					type: "generator",
					value: "supercluster"
				}
			]
		});

		supercluster = new Generator({
			isa: "supercluster",
			pack_id: pack._id
		});

		builtpack = new BuiltPack({
			generators: {
				universe: universe._doc,
				supercluster: supercluster._doc
			}
		});

		gens = [universe, supercluster];

		gens.exec = () => gens;
	});

	after(() => {
		BuiltPack.findById.restore();
		Generator.find.restore();
	});

	describe("growFromSeed()", function() {
		it("should should return a node", function() {
			return builtpack.growFromSeed(pack).should.eventually.be.an.instanceOf(Nested);
		});
	});

	describe("findOrBuild()", () => {
		it("returns a builtpack", function() {
			return BuiltPack.findOrBuild(pack).should.eventually.be.instanceOf(BuiltPack);
		});
	});
});

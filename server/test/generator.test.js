const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
const sinon = require("sinon");
chai.use(chaiAsPromised);

const { Generator } = require("../app/generator/Generator");
const Pack = require("../app/pack/Pack");
const BuiltPack = require("../app/builtpack/BuiltPack");
const Nested = require("../app/pack/Nested");

describe("Generator", () => {
	var generator, gens, pack, builtpack, childGen;

	before(() => {
		sinon.stub(Generator, "find").callsFake(() => gens);

		sinon.stub(BuiltPack, "findOrBuild").callsFake(() => builtpack);

		sinon.stub(BuiltPack, "findById").callsFake(function(id) {
			builtpack._id = id;
			return builtpack;
		});
	});

	beforeEach(() => {
		pack = new Pack({
			seed: "universe>",
			url: "test",
			name: "Test"
		});

		generator = new Generator({
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
					name: "always",
					chance: 100
				},
				{
					name: "never",
					chance: 0,
					amount: {
						min: 5,
						max: 5
					}
				},
				{
					name: "never",
					chance: 0,
					amount: {
						min: 4
					}
				},
				{
					type: "generator",
					value: "supercluster"
				}
			]
		});

		childGen = new Generator({
			isa: "supercluster",
			pack_id: pack._id
		});

		builtpack = new BuiltPack({
			_id: pack._id,
			generators: {
				universe: generator._doc,
				supercluster: childGen._doc
			}
		});

		gens = [generator, childGen];

		gens.exec = () => gens;
	});

	after(() => {
		Generator.find.restore();
		BuiltPack.findOrBuild.restore();
		BuiltPack.findById.restore();
	});

	describe("makeAsRoot()", function() {
		it("should should return a node", function() {
			return Generator.makeAsRoot([generator], builtpack).should.eventually.be.an.instanceOf(
				Nested
			);
		});

		it("should return if there is an extended seed", () => {
			pack.seed = "universe>supercluster>";
			return Generator.makeAsRoot(
				[generator, childGen],
				builtpack
			).should.eventually.be.an.instanceOf(Nested);
		});
	});

	describe("makeAsNode()", function() {
		it("should return a node", () => {
			var node = {
				isa: "supercluster",
				name: "supercluster",
				in: true
			};
			return Generator.makeAsNode(
				node,
				{ array: [] },
				builtpack
			).should.eventually.be.an.instanceOf(Nested);
		});
	});

	describe("makeStyle()", function() {
		it("should return", () => {
			return generator
				.makeStyle("blue universe")
				.should.eventually.have.property("cls", "bg-blue-900 ptn-purty-wood");
		});
	});

	describe("rename()", function() {
		it("should return", () => {
			generator.isa = "uni";
			return generator.rename("universe", pack);
		});
	});

	describe("insertNew()", () => {
		it("should return generator", () => {
			return Generator.insertNew({ isa: "test" }, pack)
				.should.eventually.have.property("unbuilt")
				.that.is.instanceOf(Generator);
		});
	});

	describe("make()", () => {
		it("should return", () => {
			return Generator.make(generator, builtpack).should.eventually.be.instanceOf(Nested);
		});
	});

	describe("extend()", function() {
		var inherited = {
			style: {
				txt: { value: "blue" },
				bg: { value: "black" }
			}
		};
		var inheritor = {
			extends: "inherited",
			style: {
				txt: { value: "green" },
				icon: { value: "fi flaticon-castle" }
			}
		};
		var builtpack;

		before(() => {
			inherited = new Generator(inherited);
			inheritor = new Generator(inheritor);
			builtpack = new BuiltPack({
				generators: {
					inheritor: inheritor._doc,
					inherited: inherited._doc
				}
			});
		});

		it("should combine styles", () => {
			var newGen = inheritor.extend(builtpack);
			should.exist(newGen._doc);
			newGen._doc.should.have.property("style");
			var s = newGen._doc.style._doc;

			s.should.have
				.property("icon")
				.with.property("value")
				.that.equals("fi flaticon-castle");
			s.should.have
				.property("txt")
				.with.property("value")
				.that.equals("green");
			s.should.have
				.property("bg")
				.with.property("value")
				.that.equals("black");
		});

		it("should work with no style", () => {
			builtpack = new BuiltPack({
				generators: {
					inheritor: new Generator({ extends: "inherited" })._doc,
					inherited: new Generator()._doc
				}
			});
			var newGen = inheritor.extend(builtpack);
			should.exist(newGen._doc);
		});

		it("should work with only inherited with style", () => {
			inheritor = new Generator({ extends: "inherited" });
			delete inheritor.style;

			builtpack = new BuiltPack({
				generators: {
					inheritor: inheritor._doc,
					inherited: inherited._doc
				}
			});
			var newGen = inheritor.extend(builtpack);
			should.exist(newGen._doc);
		});
	});

	describe("childSchema", function() {
		describe(".isIncluded", function() {
			it("should return true if chance 100", () => {
				generator.in[0].isIncluded.should.equal(true);
			});

			it("should return false if chance 0", () => {
				generator.in[1].isIncluded.should.equal(false);
			});
		});

		describe(".makeAmount", function() {
			it("should return 1 if not defined", () => {
				generator.in[0].makeAmount.should.equal(1);
			});

			it("should return amount if defined", () => {
				generator.in[1].makeAmount.should.equal(5);
			});

			it("should return min if only defined", () => {
				generator.in[2].makeAmount.should.equal(4);
			});

			it("should return 0 if only min is 0", () => {
				generator.in[2].amount.min = 0;
				generator.in[2].makeAmount.should.equal(0);
			});
		});
	});
});

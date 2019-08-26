const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
chai.use(chaiAsPromised);

const Pack = require("../app/pack/Pack");

describe("Pack", () => {
	var pack;

	before(() => {
		sinon.stub(Pack, "find").callsFake(() => {
			var p = new Pack();
			p.exec = () => {
				return Promise.resolve(() => p);
			};
			return [p];
		});
	});

	beforeEach(() => {
		pack = new Pack({
			id: 123,
			name: "testing",
			url: "test",
			seed: "universe>"
		});
	});

	after(() => {
		Pack.find.restore();
	});

	describe("renameSeed()", () => {
		it("should rename the seed", () => {
			return pack.renameSeed("universe", "uni").then(() => {
				pack.seed.should.equal("uni>");
			});
		});
	});

	describe("getSeedFromTree()", () => {
		it("returns the seed", () => {
			var tree = {
				isa: "universe"
			};
			var node = pack.getSeedFromTree(tree);
			node.isa.should.equal("universe");
		});

		it("returns nested seed", () => {
			pack.seed = "foo>bar>";
			var tree = {
				isa: "foo",
				in: [
					{
						isa: "bar"
					}
				]
			};
			var node = pack.getSeedFromTree(tree);
			node.isa.should.equal("bar");
		});
	});
});

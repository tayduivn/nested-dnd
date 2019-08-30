const Nested = require("../app/pack/Nested");
const Universe = require("../app/universe/Universe");
const assert = require("assert");

var sampleNode = {
	name: "foofoo",
	isa: "foo",
	up: [],
	cls: "black",
	txt: "white",
	img: "fooimg",
	icon: "fa fa-foo",
	in: [
		{
			isa: "bar"
		},
		{
			name: "string"
		},
		{
			isa: "barbar",
			in: true
		}
	]
};

describe("Nested", function() {
	describe("_toInstance()", function() {
		var flat = Nested.copy({
			name: "foofoo",
			isa: "foo",
			index: 1,
			up: [
				{
					cls: "blue",
					txt: "pink",
					name: "fooparent",
					index: 0
				}
			],
			cls: "black",
			txt: "white",
			img: "fooimg",
			icon: "fa fa-foo",
			in: [
				{
					isa: "bar",
					index: 2
				},
				{
					name: "string",
					index: 3
				},
				{
					isa: "barbar",
					in: true,
					index: 4
				}
			]
		})._toInstance();

		it("should set .up to 0", function() {
			flat.up.should.be.a("number").and.equal(0);
		});

		it("should set .in to indexes", function() {
			flat.in.should.be
				.an("array")
				.with.lengthOf(3)
				.and.have.members([2, 3, 4]);
		});
	});

	describe("flatten()", function() {
		it("should return an array of flat instances", function() {});

		it("should return a tree with no input", function() {
			var tree = new Nested().flatten(new Universe());
			assert(tree instanceof Object, "returned tree is an Object");
		});

		it("should return a tree with good input", function() {
			var universe = new Universe();
			var tree = Nested.copy(sampleNode).flatten(universe);
			assert(tree instanceof Object, "returned tree is an Object");

			universe.array.should.have.lengthOf(4);
			universe.array[0].should.have
				.property("in")
				.that.is.an("array")
				.with.lengthOf(3)
				.and.have.members([1, 2, 3]);
		});
	});
});

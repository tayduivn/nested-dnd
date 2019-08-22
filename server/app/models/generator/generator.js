const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const childSchema = require("./childSchema");
const styleSchema = require("./styleSchema");
const sourceSchema = require("../source");

const Maintainer = require("./maintain");
const Maker = require("./make");
const Nested = require("../../routes/packs/nested");
const Universe = require("../universe");

const merge = require("../../util/merge");

const GENERATE_LEVELS = 1;

var schema = Schema({
	pack: {
		type: Schema.Types.ObjectId,
		ref: "Pack",
		required: true
	},
	isa: {
		// unique ID of the thing
		type: String,
		required: true,
		trim: true
	},
	extends: {
		// needs to exist in this pack or it's dependencies. todo: check
		type: String,
		validate: {
			validator: v => {
				if (this) return v !== this.isa;
				return true;
			},
			message: props => `${props.value} cannot extend itself`
		}
	},
	name: {
		type: styleSchema.mixedTypeSchema,
		set: styleSchema.validateMixedThing,
		default: void 0
	},
	desc: {
		type: [styleSchema.mixedTypeSchema],
		set: styleSchema.validateMixedThing,
		default: void 0
	},
	in: {
		type: [childSchema],
		set: styleSchema.validateMixedThing,
		default: void 0
	},
	data: Object,
	style: styleSchema,
	isUnique: Boolean,
	chooseRandom: {
		type: Boolean,
		default: false
	},
	source: sourceSchema
});

// clean up from when we had an img attribute
schema.pre("init", doc => {
	if (doc.style && doc.style.img) {
		doc.style.icon = {
			...doc.style.img,
			category: "img"
		};
		delete doc.style.img;
	}
});

schema.post("remove", Maintainer.cleanAfterRemove);

// ----------------------- VIRTUALS

schema.methods.makeStyle = async function(name) {
	if (!this.style) return {};

	var arr = await Promise.all([
		this.style.makeTextColor(),
		this.style.makeBackgroundColor(),
		this.style.noAutoColor ? false : this.style.strToColor(name),
		this.style.makeIcon(),
		this.style.makePattern()
	]);

	return mergeStyle(arr, ["txt", "bg", "autoBG", "icon", "pattern"]);
};

schema.methods.makeName = async function(data = {}) {
	return this.name ? Maker.makeMixedThing(this.name, this.model("Table"), data) : undefined;
};

// ----------------------- STATICS

/**
 * Validates and inserts a new generator, and updates the build pack
 * @param  {Object} data the data of the new generator
 * @param  {Pack} pack the pack to add it to
 * @return {Promise<Generator>}      the added generator
 * @async
 */
schema.statics.insertNew = async function(data, pack) {
	var builtpack = await this.model("BuiltPack").findOrBuild(pack);

	return Maintainer.insertNew(data, pack, builtpack);
};

/**
 * Generates a random version as the root node of a tree, with 3 levels.
 * @param  {Object[]} seedArray An array of built version of generators that are the seeds.
 * @param  {BuiltPack} builtpack
 * @return {Promise<Nested>}           the root node of the tree
 */
schema.statics.makeAsRoot = async function(seedArray, builtpack, data = {}) {
	var seed = seedArray.shift();
	const ancestorData = Object.assign({}, data, seed.data);

	if (seedArray.length === 0) {
		let nestedSeed = await Maker.make(seed, GENERATE_LEVELS, builtpack, undefined, ancestorData);
		nestedSeed.isNestedSeed = true; // this will be our starting point when we generate the world
		return nestedSeed;
	}

	// generate the next seed in the array and push to in
	var node = await Maker.make(seed, GENERATE_LEVELS, builtpack);
	var generatedChild = await this.makeAsRoot(seedArray, builtpack, ancestorData);

	if (!node.in) node.in = [];

	// if node has a similar child, replace it
	for (var i = 0; i < node.in.length; i++) {
		if (node.in[i].isa === generatedChild.isa) {
			node.in[i] = generatedChild;
			break;
		}
	}

	if (i === node.in.length) node.in.push(generatedChild);

	return node;
};

/**
 * Generates random children of a node that already exists in the universe
 * @param  {Object} tree      the node you want to generate descendents for, as a nested tree
 * @param  {Object[]} universe  a flattened version of the tree
 * @param  {BuiltPack} builtpack
 * @return {Promise<Nested>}           the root node of the tree
 */
schema.statics.makeAsNode = async function(tree, universe, builtpack) {
	// has no children to generate, return
	if (typeof tree !== "object") return tree;

	if (!(tree instanceof Nested)) tree = Nested.copy(tree);
	if (!universe.model)
		// make into object
		universe = new Universe(universe);

	// has children, but they are not generated yet.
	// TODO: check if deeply nested embeds are being generated correctly
	if (builtpack && tree.in === true) {
		var generator = builtpack.getGen(tree.isa);
		if (generator) {
			tree = await Maker.make(
				generator,
				GENERATE_LEVELS,
				builtpack,
				tree,
				universe.getAncestorData(tree.index)
			);
		}
	}

	// up is index, not obj
	if (tree.up !== undefined && !isNaN(tree.up)) {
		tree.up = tree.expandUp(universe.array);
	}

	return tree;
};

/**
 * Generates a random thing from an isa name
 * @param  {Object} generator a built generator
 * @param  {BuiltPack} builtpack
 * @return {Promise<Nested>}           the random thing
 */
schema.statics.make = function(generator, builtpack) {
	return Maker.make(generator, GENERATE_LEVELS, builtpack);
};

// ----------------------- METHODS

/**
 * Handles the renaming cleanup after a generator changes isa
 * @param  {string} isaOld the old isa
 * @param  {Pack} pack    the pack that this is in
 * @return {Promise}
 */
schema.methods.rename = function(isaOld, pack, builtpack) {
	return Maintainer.rename(this, pack, isaOld, builtpack);
};

/**
 * Extends this generator with another one
 * Even if the thing it extends has chooseRandom, the extend will work
 * SHOULD NOT EXTEND ON THE FLY. Only when save. Dependent packs will update when the
 *    builtpack expires
 * @param  {BuiltPack} builtpack the builtpack to get the extendgen out of
 * @param {[String]} extended prevents looping infinitely
 * @return {Generator}              the new Generator
 */
schema.methods.extend = function(builtpack, extended = []) {
	if (!this.extends || extended.includes(this.isa)) return this;

	const Generator = this.model("Generator");
	var extendsGen = new Generator(builtpack.getGen(this.extends));
	const thisMinusStyle = Object.assign({}, this.toJSON());
	delete thisMinusStyle.style;
	extended.push(this.isa);

	extendsGen = extendsGen.extend(builtpack, extended); // recurse
	extendsGen.set(thisMinusStyle); // this overwrites the extends. style is done below

	//style
	var extendsStyle = new Generator({ style: extendsGen.style }).style;
	if (this.style) {
		// if this has a style, override
		extendsStyle
			? extendsStyle.set(merge(extendsStyle.toJSON(), this.style.toJSON()))
			: (extendsStyle = this.style);
		extendsGen.set({ style: extendsStyle });
	}

	return extendsGen;
};

/**
 * Takes an array of attributes and their labels and merges them into a single style object
 * @param  {string[]} arr    The values
 * @param  {string[]} labels The attribute names
 * @return {Object}        The unified style object
 */
function mergeStyle(arr, labels) {
	var style = {
		cssClass: []
	};
	var bg, autoBG;
	arr.forEach((val, i) => {
		if (labels[i] === "cssClass") style.cssClass.push(val);
		else if (labels[i] === "bg") bg = val ? "bg-" + val : undefined;
		else if (labels[i] === "autoBG") autoBG = val ? "bg-" + val : undefined;
		else if (labels[i] === "pattern") {
			if (val && !bg && !autoBG) style.cssClass.push("bg-grey-50"); // default bg if none supplied
			if (val) style.cssClass.push("ptn-" + val);
		} else style[labels[i]] = val;
	});
	if (autoBG) {
		style.cssClass.unshift(autoBG);
		style.txt = undefined;
	} else if (bg) {
		style.cssClass.unshift(bg);
	}
	style.cssClass = style.cssClass.join(" ").trim();
	if (!style.cssClass.length) style.cssClass = undefined;
	return style;
}

module.exports = mongoose.model("Generator", schema);

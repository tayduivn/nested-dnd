const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const childSchema = require('./generator/childSchema');
const styleSchema = require('./generator/styleSchema');
const Maintainer = require('./generator/maintain')
const Maker = require('./generator/make');

const SEED_DELIM = ">";

function validateType(input){
	if(input.type === 'table' && typeof input.value === 'string')
		input.type = 'string'
	if(input.type === 'string' && typeof input.value !== 'string'){
		if(input.value.rows) input.type = 'table'
		else throw Error("cannot set name to value "+input.value)
	}
	return input;
}

var generatorSchema = Schema({
	pack_id: {
		type: Schema.Types.ObjectId,
		ref: 'Pack',
		required: true
	},
	isa: { // unique ID of the thing
		type: String,
		required: true, 
		trim: true
	},
	extends: { // needs to exist in this pack or it's dependencies. todo: check
		type: String
	},
	name: {
		type: Schema.Types.Mixed, // todo: handle tables and such
		set: validateType
	},
	desc: {
	 type: [String],
	 default: void 0
	},
	in: {
	 type: [childSchema],
	 set: validateType,
	 default: void 0	
	},
	data: Object,
	style: styleSchema
});

generatorSchema.post('remove', Maintainer.cleanAfterRemove);

// ----------------------- VIRTUALS

generatorSchema.methods.makeStyle = async function(name){
	var style = {
		cssClass: []
	};


	if(!this.style) return style;

	var arr = await Promise.all([
		this.style.makeTextColor(),
		this.style.makeBackgroundColor(),
		this.style.makeImage(),
		this.style.makeIcon(),
		this.style.makePattern()
	]);

	if(arr[0]) style.txt = arr[0];
	if(arr[1]) style.cssClass.push(arr[1]);
	if(arr[2]) style.img = arr[2];
	if(arr[3]) style.icon = arr[3];
	if(arr[4]) style.cssClass.push(arr[4]);

	if(!this.style.noAutoColor){
		var autoColor = this.style.strToColor(name);
		if(autoColor) style.txt = undefined;
		style.cssClass.push(autoColor);
	}

	style.cssClass = style.cssClass.join(" ");

	return style;
}

generatorSchema.virtual('makeName').get(function(){
	return (this.name) ? Maker.makeMixedThing(this.name, this.model('Table')) : undefined;
})

// ----------------------- STATICS

/**
 * Validates and inserts a new generator, and updates the build pack
 * @param  {Object} data the data of the new generator
 * @param  {Pack} pack the pack to add it to
 * @return {Promise<Generator>}      the added generator
 * @async
 */
generatorSchema.statics.insertNew = async function(data, pack){
	var builtpack = await this.model('BuiltPack').findOrBuild(pack)

	return Maintainer.insertNew(data, pack, builtpack);
}

/**
 * Generates a random version as the root node of a tree, with 3 levels.
 * @param  {Object[]} seedArray An array of built version of generators that are the seeds. 
 * @param  {BuiltPack} builtpack 
 * @return {Nested}           the root node of the tree
 */
generatorSchema.statics.makeAsRoot = async function(seedArray, builtpack){
	var seed = seedArray.shift();

	if(seedArray.length === 0){
		return await Maker.make(seed, 1, builtpack);
	}
	else{
		var node = await Maker.make(seed, 1, builtpack);

		//generate the next seed in the array and push to in
		//TODO: replace child
		var generatedChild = await this.makeAsRoot(seedArray, builtpack);

		// no children, append and continue
		if(!node.in) {
			node.in = [generatedChild];
			return node;
		}

		// if node has a similar child, replace it
		var found = false;
		for(var i = 0; i < node.in.length; i++){
			if(node.in[i].isa === generatedChild.isa){
				node.in[i] = generatedChild;
				found = true;
				break;
			}
		}
		if(!found){ // push to end if not found.
			node.in.push(generatedChild);
		}

		return node;
	}
};


/**
 * Generates random children of a node that already exists in the universe
 * @param  {Object} tree      the node you want to generate descendents for, as a nested tree
 * @param  {Object[]} universe  a flattened version of the tree
 * @param  {BuiltPack} builtpack 
 * @return {Object}           the root node of the tree
 */
generatorSchema.statics.makeAsNode = async function(tree, universe, builtpack){
	// has no children to generate, return
	if(!tree || !tree.in) 
		return tree;

	// has children, but they are not generated yet.
	// TODO: check if deeply nested embeds are being generated correctly
	if(builtpack && tree.in === true){
		var generator = builtpack.getGen(tree.isa);
		if(generator){
			tree = await Maker.make(generator, 1, builtpack, tree);
		}
	}

	// up is index, not obj
	if(tree.up !== undefined && !isNaN(tree.up)){
		tree.up = tree.expandUp(universe.array)
	}

	return tree;
}

/**
 * Generates a random thing from an isa name
 * @param  {Object} generator a built generator
 * @param  {BuiltPack} builtpack
 * @return {Promise<Object>}           the random thing
 */
generatorSchema.statics.make = function(generator, builtpack){
	return Maker.make(generator, 1, builtpack);
};

// ----------------------- METHODS

/**
 * Handles the renaming cleanup after a generator changes isa
 * @param  {string} isaOld the old isa
 * @param  {Pack} pack    the pack that this is in
 * @return {Promise}        
 */
generatorSchema.methods.rename = function(isaOld, pack){
	return Maintainer.rename(this, pack, isaOld, this.model('Generator'))
}

/**
 * Extends this generator with another one
 * @param  {BuiltPack} builtpack the builtpack to get the extendgen out of
 * @return {Generator}              the new Generator
 */
generatorSchema.methods.extend = function(builtpack){
	if(!this.extends) return this;
	const Generator = this.model('Generator');

	var extendsGen = new Generator(builtpack.getGen(this.extends));
	var extendsStyle = (new Generator({style: extendsGen.style})).style;
	extendsGen.set(this); // this overwrites the extends
	if(extendsStyle && this.style) { // if they both have style, combine them
		extendsStyle.set(this.style);
		extendsGen.set({style: extendsStyle}); 
	}
	return extendsGen;
}


module.exports = mongoose.model('Generator', generatorSchema);

module.exports.generatorSchema = generatorSchema;
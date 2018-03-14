const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const childSchema = require('./generator/childSchema');
const styleSchema = require('./generator/styleSchema');
const Maintainer = require('./generator/maintain')
const Maker = require('./generator/make');

const SEED_DELIM = ">";

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
		type: String // todo: handle tables and such
	},
	desc: {
	 type: [String],
	 default: void 0
	},
	in: {
	 type: [childSchema],
	 default: void 0	
	},
	data: Object,
	style: styleSchema
});

generatorSchema.post('remove', Maintainer.cleanAfterRemove);

// ----------------------- VIRTUALS

generatorSchema.virtual('makeTextColor').get(function(){
	return (this.style) ? this.style.makeTextColor : null;
});

generatorSchema.virtual('makeCssClass').get(function(){
	return (this.style) ? this.style.makeBackgroundColor : null; //TODO
});
generatorSchema.virtual('makeIcon').get(function(){
	return (this.style) ? this.style.makeIcon : null;
});

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
 * @return {Object}           the root node of the tree
 */
generatorSchema.statics.makeAsRoot = function(seedArray, builtpack){
	var seed = seedArray.shift();

	if(seedArray.length === 0){
		return Maker.make(seed, 2, builtpack);
	}
	else{
		var node = Maker.make(seed, 1, builtpack);

		//generate the next seed in the array and push to in
		//TODO: replace child
		var generatedChild = seedArray.shift().makeAsRoot(seedArray, builtpack);
		if(!node.in) node.in = [];
		node.in.push(generatedChild);

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
generatorSchema.statics.makeAsNode = function(tree, universe, builtpack){
	// has no children to generate, return
	if(!node.in) return node;

	// has children, but they are not generated yet.
	// TODO: check if deeply nested embeds are being generated correctly
	var generator = builtpack.generators[node.isa];
	if(node.in === true && generator){
		node = Maker.make(generator, 1, builtpack, node);
	}

	// has children and they are generated, so loop through
	else if(node.in && node.in.length){
		node.in = node.in.map((index)=>{
			if(c.in !== true || !c.isa || !builtpack.generators[c.isa]) 
				return c;

			return Maker.make(builtpack.generators[c.isa], 0, builtpack)
		})
	}
	return node;
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


module.exports = mongoose.model('Generator', generatorSchema);

module.exports.generatorSchema = generatorSchema;
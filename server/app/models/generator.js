const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const childSchema = require('./generator/childSchema');
const styleSchema = require('./generator/styleSchema');
const Maintainer = require('./generator/maintain')
const Maker = require('./generator/make');

const SEED_DELIM = ">";

var generatorSchema = Schema({
	_pack: {
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
	displayName: {
		type: String // todo: handle tables and such
	},
	description: {
	 type: [String],
	 default: void 0
	},
	children: {
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
	var cssClass = (this.style) ? this.style.makeBackgroundColor : "";
	if(!this.children || !this.children.length)
		cssClass += "empty";
	return cssClass; // TODO
});
generatorSchema.virtual('makeIcon').get(function(){
	return (this.style) ? this.style.makeIcon : null;
});

// ----------------------- STATICS

generatorSchema.statics.insertNew = function(data, pack, callback){
	var Generator = this.model('Generator');
	this.model('BuiltPack').findOrBuild(pack).then(builtpack=>{
		Maintainer.insertNew(data, pack, builtpack, Generator, callback);
	})
}

generatorSchema.post()

/**
 * @param seedArray Array of Generator _ids representing the seed
 */
generatorSchema.statics.generateAsSeed = function(seedArray, pack){
	var seed = seedArray.shift();

	if(seedArray.length === 0){
		return Maker.make(seed, 2, pack);
	}
	else{
		var node = Maker.make(seed, 1, pack);

		//generate the next seed in the array and push to children
		//TODO: replace child
		var generatedChild = seedArray.shift().generateAsSeed(seedArray, pack);
		if(!node.children) node.children = [];
		node.children.push(generatedChild);

		return node;
	}
};

generatorSchema.statics.generateFromNode = function(node, universe, builtpack){
	if(node.children === false || !node.children)
		return node;

	if(node.children === true && builtpack.generators[node.isa]){
		var madeNode = Maker.make(builtpack.generators[node.isa], 2, builtpack)
		return Object.assign({}, node, { children: madeNode.children });
	}

	if(node.children.forEach){

		node.children = node.children.map((c)=>{
			if(c.children !== true || !c.isa || !builtpack.generators[c.isa]) 
				return c;

			var madeNode = Maker.make(builtpack.generators[c.isa], 1, builtpack)
			return Object.assign({}, c, { children: madeNode.children });
		})
		return node;
	}

	return node;
}

generatorSchema.statics.generate = function(pack){
	return Maker.make(seed, 1, pack);
};

// ----------------------- METHODS
/**
 * This runs ansychronously. There is no callback, it just runs.
*/
generatorSchema.methods.rename = function(oldname, pack){
	return Maintainer.rename(this, pack, oldname, this.model('Generator'))
}

module.exports = mongoose.model('Generator', generatorSchema);

module.exports.generatorSchema = generatorSchema;
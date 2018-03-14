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

		//generate the next seed in the array and push to in
		//TODO: replace child
		var generatedChild = seedArray.shift().generateAsSeed(seedArray, pack);
		if(!node.in) node.in = [];
		node.in.push(generatedChild);

		return node;
	}
};

generatorSchema.statics.generateFromNode = function(node, universe, builtpack){
	if(!node.in)
		return node;

	if(node.in === true && builtpack.generators[node.isa]){
		var madeNode = Maker.make(builtpack.generators[node.isa], 2, builtpack)
		return Object.assign({}, node, { in: madeNode.in });
	}

	if(node.in.forEach){

		node.in = node.in.map((c)=>{
			if(c.in !== true || !c.isa || !builtpack.generators[c.isa]) 
				return c;

			var madeNode = Maker.make(builtpack.generators[c.isa], 1, builtpack)
			return Object.assign({}, c, { in: madeNode.in });
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
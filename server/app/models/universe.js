const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const generatorSchema = require('./generator').generatorSchema;

const Nested = require('../routes/packs/nested');
const { flatInstanceSchema } = require('./instance');

var universeSchema = Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	session_id: String,
	pack_id: Schema.Types.ObjectId, 

	expires: Date,

	lastSaw: {
		type: Number,
		default: 0
	},

	// where we store all the custom stuff. Depenedecies of this pack are the packs added to this universe, etc.
	// This starts as the pack we init the universe from, but once we make changes, a dummy pack will be created that will store all our custom universe stuff
	
	array: {
		type: [flatInstanceSchema],
		default: []
	}
	
});

universeSchema.methods.getNested = async function(index, pack){
	var rootIndex = (index && this.array[index]) ? parseInt(index, 10) 
		: (typeof this.lastSaw !== undefined) ? this.lastSaw : 0;

	var flatInstance = this.array[rootIndex];
	var nested = flatInstance.expand(1);
	nested.index = rootIndex;

	if(flatInstance.todo !== true){
		return nested;
	}

	const builtpack = await this.model('BuiltPack').findOrBuild(pack);

	var generated = await this.model('Generator').makeAsNode(nested, this, builtpack);
	var tree = generated.setIndex(rootIndex).flatten(this);

	this.array[rootIndex].todo = undefined;
	return tree;
};

universeSchema.statics.build = async function(pack){
	const Universe = this;
	const builtpack = await this.model('BuiltPack').findOrBuild(pack);
	var generated = await builtpack.growFromSeed(pack);
	generated.index = 0;

	var universe = new Universe({
		pack_id: pack._id
	});

	// save to universe
	// TODO get from DB if logged in
	var nested = generated.flatten(universe);

	return { universe, nested };
}

universeSchema.statics.getTemp = async function(session_id, pack, index){
	const query = { 
		expires: { $exists: true }, 
		session_id: session_id 
	};
	var universes = await this.find(query);
	var universe;

	for(var i = 0, u; u = universes[i]; i++){
		var found = u.pack_id.toString() === pack.id;
		if(found){
			universe = u;
			universes.splice(i, 1);
			break; 
		}
	}
	universes.forEach(u=>u.remove());

	// pack exists
	if(universe && universe.pack_id.toString() === pack.id){
		const nested = await universe.getNested(index, pack);
		universe.expires = Date.now();
		universe.lastSaw = index;
		universe.save();
		return nested;
	}

	// pack doesn't exist, build it and return the root
	else{
		var { universe, nested } = await this.build(pack);
		var nestedSeed = pack.getSeedFromTree(nested);

		universe.session_id = session_id;
		universe.expires = Date.now();
		universe.lastSaw = nestedSeed.index;
		universe.save();
		
		return nestedSeed;
	}
}


module.exports = mongoose.model('Universe', universeSchema);
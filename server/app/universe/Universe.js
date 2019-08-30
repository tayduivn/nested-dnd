const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Nested = require("../pack/Nested");

var universeSchema = Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	pack: {
		type: Schema.Types.ObjectId,
		ref: "Pack"
	},
	title: String,
	last: {
		type: Schema.Types.ObjectId,
		ref: "Instance"
	},
	seed: {
		type: Schema.Types.ObjectId,
		ref: "Instance"
	},
	count: {
		type: Schema.Types.Number,
		default: 0
	}
});

universeSchema.methods.getNested = async function(index, pack) {
	this.lastSaw = index;
	var flatInstance = this.array && this.array[this.lastSaw];

	// doesn't exist, generate seed node
	if (!flatInstance) {
		flatInstance = new Nested({ name: this.title, index: 0 });
	}

	var nested = flatInstance.expand ? flatInstance.expand(1) : flatInstance;
	nested.index = this.lastSaw;
	nested.savedCssClass = flatInstance.cls;
	nested.savedTxt = flatInstance.txt;
	nested.isFavorite = this.favorites.includes(this.lastSaw);

	if (flatInstance.todo !== true) {
		return nested;
	}

	// get pack
	if (!pack) {
		pack = await this.model("Pack").findById(this.pack);
	}

	const builtpack = await this.model("BuiltPack").findOrBuild(pack);

	var generated = await this.model("Generator").makeAsNode(nested, this, builtpack);
	generated.index = this.lastSaw;
	var tree = generated.flatten(this);

	this.array[this.lastSaw].todo = undefined;

	return tree;
};

universeSchema.statics.build = async function(pack) {
	const Universe = this;
	const builtpack = await this.model("BuiltPack").findOrBuild(pack);
	var generated = await builtpack.growFromSeed(pack);
	generated.index = 0;

	var universe = new Universe({
		pack: pack._id
	});

	// save to universe
	// TODO get from DB if logged in
	generated.flatten(universe);
	pack.save(); // save new style of seed
	await universe.save();
	//universe.lastSaw = nestedSeed.index;
	return { universe, nested: universe.getNested(undefined, pack) };
};

universeSchema.statics.getTemp = async function(session_id, pack, index) {
	const query = {
		expires: { $exists: true },
		session_id: session_id
	};
	var universes = await this.find(query);
	let universe;

	// universes stored in this session, find the one for this pack
	for (var i = 0, u; (u = universes[i]); i++) {
		let found = u.pack && u.pack.toString() === pack.id;
		if (found) {
			universe = u;
			universes.splice(i, 1);
			break;
		}
	}
	// delete all universes in this session?
	// universes.forEach(u => u.remove());

	// pack exists
	if (universe && universe.pack.toString() === pack.id) {
		await universe.getNested(index, pack);
	} else {
		// pack doesn't exist, build it and return the root
		var { universe: newUni } = await this.build(pack);
		universe = newUni;
	}

	universe.session_id = session_id;
	universe.expires = Date.now();
	return universe;
};

module.exports = mongoose.model("Universe", universeSchema);

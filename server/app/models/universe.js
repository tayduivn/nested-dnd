const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const generatorSchema = require("./generator").generatorSchema;

const Nested = require("../routes/packs/nested");
const { flatInstanceSchema } = require("./instance");

var universeSchema = Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	pack: {
		type: Schema.Types.ObjectId,
		ref: "Pack"
	},
	title: String,
	session_id: String,
	expires: Date,
	lastSaw: {
		type: Number,
		default: 0,
		get: function(value) {
			return this.array && this.array[value] ? value : 0;
		}
	},
	emptyIndexes: [Number],
	favorites: [Number],
	// where we store all the custom stuff. Depenedecies of this pack are the packs added to this universe, etc.
	// This starts as the pack we init the universe from, but once we make changes, a dummy pack will be created that will store all our custom universe stuff

	array: [flatInstanceSchema]
});

universeSchema.methods.getAncestorData = function(index, ancestorData = {}) {
	let current = this.array[index] || this.array[0] || {};
	var data = Object.assign({}, ancestorData, current.data || {});
	if (!isNaN(current.up)) return this.getAncestorData(current.up, data);
	return data; // termination, no up
};

universeSchema.methods.setFavorite = function(index, isFavorite) {
	var favs = this.favorites;
	var included = favs.includes(index);
	if (isFavorite && !included) favs.push(index);
	else if (!isFavorite && included) {
		favs.splice(favs.indexOf(index), 1);
	}
};

universeSchema.methods.moveInstance = function(index, newUp) {
	var instance = this.array[index];
	var oldParent = this.array[instance.up];
	var newParent = this.array[newUp];
	const oldUp = instance.up;

	var oldPosition = oldParent.in.indexOf(index);
	if (oldPosition !== -1) oldParent.in.splice(oldPosition, 1);

	if (!newParent.in) newParent.in = [];
	newParent.in.push(index);
	instance.up = newUp;

	this.array.set(oldUp, oldParent);
	this.array.set(newUp, newParent);
	this.array.set(index, instance);
};

universeSchema.methods.deleteInstance = function(index, willDeleteParent) {
	index = parseInt(index, 10);
	if (isNaN(index)) {
		console.log(index + " is not a number");
		return;
	}

	if (index === 0) {
		//delete everyhing
		this.array = [{ name: this.title }];
		this.lastSaw = 0;
		console.log("index is 0");
		return;
	}
	var instance = this.array[index];

	if (!instance) {
		console.log(index + ": " + this.array[index] + " is false");
		return;
	}

	// has children, recurse
	if (instance.in) {
		console.log("----------");
		console.log(index + " in: [" + instance.in.join(", ") + "]");
		instance.in.forEach(j => {
			this.deleteInstance(j, true);
		});
		console.log("----------");
	}

	// fix lastSaw
	if (this.lastSaw === index) {
		this.lastSaw = instance.up;
	}

	// remove from parent
	if (!willDeleteParent && typeof instance.up === "number") {
		var inArr = this.array[instance.up].in;
		inArr.splice(inArr.indexOf(index), 1);
	}

	//delete
	if (index === this.array.length - 1) this.array.splice(index, 1);
	else {
		if (!this.emptyIndexes) this.emptyIndexes = [];

		var empties = this.emptyIndexes;
		if (!empties.includes(index)) empties.push(index);

		// validate empty indexes if out of order
		if (index < empties[empties.length - 2]) {
			empties.sort((a, b) => a - b);
			for (var i = empties.length - 1; i >= 0; i--) {
				if (empties[i] >= this.array.length) empties.splice(i, 1);
				else break;
			}
		}
		this.emptyIndexes = empties;

		this.array.set(index, null);
	}

	console.log("deleted " + index);
};

universeSchema.methods.getNested = async function(index, pack) {
	var rootIndex =
		index !== undefined && this.array[index]
			? parseInt(index, 10)
			: typeof this.lastSaw !== undefined
				? this.lastSaw
				: 0;
	this.lastSaw = parseInt(rootIndex, 10);

	var flatInstance = this.array && this.array[rootIndex];
	if (!flatInstance) return new Nested(this.title).toJSON();

	// -------- restore missing children -----------
	// TODO: TEMP
	/*
	var changed = 0;

	for(var i = 1; i < this.array.length; i++){
		inst = this.array[i];
		if(!inst) continue;
		var parent = this.array[inst.up];

		if(!parent){ //parent is null
			inst.up = 0;
			parent = this.array[0];
		}
		if(!parent.in) 
			parent.in = [];

		if(!parent.in.includes(i)){
			parent.in.push(i);
			changed++;
		}
	}
	if(changed){
		console.log("NEEDED TO RESTORE "+changed);
		this.save();
	}
	*/
	// -------- restore missing children -----------

	var nested = flatInstance.expand ? flatInstance.expand(1) : flatInstance;
	nested.index = rootIndex;
	nested.savedCssClass = flatInstance.cssClass;
	nested.savedTxt = flatInstance.txt;
	nested.isFavorite = this.favorites.includes(rootIndex);

	if (flatInstance.todo !== true) {
		return nested;
	}

	// get pack
	if (!pack) {
		pack = await this.model("Pack").findById(this.pack);
	}

	const builtpack = await this.model("BuiltPack").findOrBuild(pack);

	var generated = await this.model("Generator").makeAsNode(
		nested,
		this,
		builtpack
	);
	generated.index = rootIndex;
	var tree = generated.flatten(this);

	this.array[rootIndex].todo = undefined;

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
	var nested = generated.flatten(universe);
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
	var universe;

	for (var i = 0, u; (u = universes[i]); i++) {
		var found = u.pack && u.pack.toString() === pack.id;
		if (found) {
			universe = u;
			universes.splice(i, 1);
			break;
		}
	}
	universes.forEach(u => u.remove());

	// pack exists
	if (universe && universe.pack.toString() === pack.id) {
		const nested = await universe.getNested(index, pack);
		universe.expires = Date.now();
		universe.save();

		return nested;
	}

	// pack doesn't exist, build it and return the root
	var { universe, nested } = await this.build(pack);

	universe.session_id = session_id;
	universe.expires = Date.now();

	universe.save();

	return nested;
};

module.exports = mongoose.model("Universe", universeSchema);

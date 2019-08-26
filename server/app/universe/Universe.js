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
	}
});

universeSchema.methods.setLastSaw = function(index = 0) {
	const i = parseInt(index, 10);
	var rootIndex = this.array[i] ? i : typeof this.lastSaw !== undefined ? this.lastSaw : 0;
	this.lastSaw = parseInt(rootIndex, 10);
	return this.lastSaw;
};

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

function deleteEverything() {
	//delete everyhing
	const oldLength = this.array.length;
	this.array = [{ name: this.title }];
	this.lastSaw = 0;
	const empties = {};
	const emptyIndexes = [];
	for (var i = 1; i < oldLength; i++) {
		empties[i] = null;
		emptyIndexes.push(i);
	}
	return {
		emptyIndexes,
		length: 0
	};
}

function addToEmpties(index, empties, length) {
	if (!empties.includes(index)) empties.push(index);

	// validate empty indexes if out of order
	if (index < empties[empties.length - 2]) {
		empties.sort((a, b) => a - b);
		for (var i = empties.length - 1; i >= 0; i--) {
			if (empties[i] >= length) empties.splice(i, 1);
			else break;
		}
	}
	return empties;
}

universeSchema.methods.doDelete = function(index) {
	if (index === this.array.length - 1) this.array.splice(index, 1);
	else {
		this.array.set(index, null);
		this.emptyIndexes = addToEmpties(index, this.emptyIndexes, this.array.length);
	}
};

// TODO
// eslint-disable-next-line
universeSchema.methods.deleteInstance = function(index, willDeleteParent) {
	index = parseInt(index, 10);
	let instance = this.array[index];

	if (isNaN(index))
		return {
			emptyIndexes: this.emptyIndexes,
			length: this.array.length
		};
	if (index === 0) return deleteEverything.call(this);
	if (!instance)
		return {
			emptyIndexes: this.emptyIndexes,
			length: this.array.length
		};

	if (!this.emptyIndexes) this.emptyIndexes = [];

	// has children, recurse
	if (instance.in) {
		instance.in.forEach(j => {
			this.deleteInstance(j, true);
		});
	}

	// remove from parent
	if (!willDeleteParent && typeof instance.up === "number") {
		var inArr = this.array[instance.up].in || [];
		inArr.splice(inArr.indexOf(index), 1);
	}

	// delete this index
	this.doDelete(index);

	// fix lastSaw
	if (this.lastSaw === index) {
		this.lastSaw = instance.up;
	}
	return {
		emptyIndexes: this.emptyIndexes,
		length: this.array.length
	};
};

universeSchema.methods.getNested = async function(index, pack) {
	this.lastSaw = index;
	var flatInstance = this.array && this.array[this.lastSaw];

	// doesn't exist, generate seed node
	if (!flatInstance) {
		flatInstance = new Nested({ name: this.title, index: 0 });
	}

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
		this.save();
	}
	*/
	// -------- restore missing children -----------

	var nested = flatInstance.expand ? flatInstance.expand(1) : flatInstance;
	nested.index = this.lastSaw;
	nested.savedCssClass = flatInstance.cssClass;
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

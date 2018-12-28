class Ancestor {
	constructor(node) {
		this.index = node.index;
		this.name = node.name ? node.name : node.isa;
	}
}

class Parent extends Ancestor {
	constructor(node) {
		super(node);

		if (node.txt) this.txt = node.txt;
		if (node.cssClass) this.cssClass = node.cssClass;
	}
}

// TODO validate that undefined aren't added to flat array or returned to user
class Nested {
	constructor(name, gen, style, desc, data) {
		this.name = name;
		this.desc = desc;
		this.data = data;

		if (gen) {
			this.isa = gen.isa;
			this.in = gen.in && gen.in.length ? true : undefined;
		}

		if (style) {
			this.txt = style.txt;
			this.cssClass = style.cssClass;
			this.img = style.img;
			this.icon = style.icon;
		}

		this.up = []; // placeholder for later
	}

	static copy(inst) {
		var _t = new Nested();
		_t.name = inst.name;
		_t.isa = inst.isa;
		_t.txt = inst.txt;
		_t.cssClass = inst.cssClass;
		_t.img = inst.img;
		_t.icon = inst.icon;
		_t.up = inst.up;
		_t.in = inst.todo
			? true
			: inst.in && !inst.in.length && inst.in !== true
				? undefined
				: inst.in;
		_t.desc = inst.desc;
		_t.data = inst.data;

		// not added in constructor, added by .expand;
		_t.index = inst.index;
		return _t;
	}

	static getAncestor(ref, isParent) {
		return isParent ? new Parent(ref) : new Ancestor(ref);
	}

	setIndex(universe) {
		const emptyIndexes = universe.emptyIndexes || [];
		const length = universe.array ? universe.array.length : 0;

		if (emptyIndexes.length) {
			this.index = !universe.array[emptyIndexes[0]]
				? emptyIndexes.shift()
				: length;
		} else {
			this.index = length;
		}

		return this;
	}

	setUp(up) {
		this.up = up;

		// copy parent's style
		/*
		if(!this.cssClass && up && up instanceof Array && up[0]){
			this.cssClass = up[0].cssClass;
			if(!this.txt)
				this.txt = up[0].txt;
		}*/

		return this;
	}

	/**
	 * Converts a tree that was generated to a flat array universe
	 * @param  {Object} node        the tree that was generated
	 * @param  {number} startIndex  the index of the node
	 * @param  {Universe} universe  the universe we are flattening into
	 * @return {Object}             { tree, array } tree is what is returned to user
	 */
	flatten(universe, generations) {
		if (typeof this.index === "undefined" || isNaN(this.index)) this.index = 0;

		// no in, termination condition
		if (!this.in || !(this.in instanceof Array)) {
			universe.array[this.index] = this._toInstance();
			return this;
		}

		universe.array[this.index] = {}; //placeholder

		if (typeof generations === undefined) generations = 1;

		// make object to store up
		var up = this.makeAncestorArray();

		this.in.forEach((n, i) => {
			var ch = Nested.copy(n)
				.setUp(up)
				.setIndex(universe);

			// mark the first loaded node in a new universe
			if (n.isNestedSeed) universe.lastSaw = ch.index;

			// recurse
			var nestedChild = ch.flatten(universe, generations - 1);
			this.in[i] = nestedChild;
		});

		// flatten to indexes in array, need to loop first so populate indexes
		universe.array[this.index] = this._toInstance();

		return this;
	}

	/**
	 * 'PRIVATE' Returns a new Nested that points to the indexes of their parent and children
	 * Expects that nested children of this Nested have an .index property
	 * @return {Nested}              has numeric up and numeric .in
	 */
	_toInstance() {
		var inst = Object.assign({}, this);
		delete inst.index;

		// store boolean if haven't built in yet
		if (inst.in === true) {
			inst.todo = true;
			delete inst.in;
		}

		// in just indexes
		if (inst.in instanceof Array) {
			inst.in = this.in.map(c => c.index);
		}

		// already flat
		if (!(inst.up instanceof Array)) return inst;

		inst.up = inst.up.slice(0); // copy the array so don't accidentally modify this

		if (!inst.up.length) {
			// empty array
			delete inst.up;
			return inst;
		}

		inst.up = inst.up[0].index;
		return inst;
	}

	/**
	 * Takes a node and makes their child's ancestor array
	 * @param  {Object} node the parent node
	 * @return {[Object]}      an array of Ancestors
	 */
	makeAncestorArray() {
		// make obejct to store up
		var up = [].concat(this.up);

		var parent = new Parent(this);

		// put a new ancestor at the front of the array
		up.unshift(parent);

		// remove render data from the grandparent
		if (up[1]) {
			up[1] = new Ancestor(up[1]);
		}

		return up;
	}
}

module.exports = Nested;

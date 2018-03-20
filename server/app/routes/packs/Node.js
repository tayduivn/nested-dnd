
class Ancestor {
	constructor(node){
		this.index = node.index;
		this.name = node.name ? node.name : node.isa;
	}
}

class Parent extends Ancestor {
	constructor(node){
		super(node);

		if(node.txt)
			this.txt = node.txt;
		if(node.cssClass) 
			this.cssClass = node.cssClass;
	}
}


// TODO validate that undefined aren't added to flat array or returned to user
class Node {

	constructor(name, gen, style){
		this.name = name;

		if(gen){
			this.isa = gen.isa;
			this.in = (gen.in && gen.in.length) ? true : undefined;
		}

		if(style){
			this.txt = style.txt;
			this.cssClass = style.cssClass;
			this.img = style.img;
			this.icon = style.icon;
		}

		this.up = []; // placeholder for later
		
	}

	static copy(node){
		var _t = new Node();
		_t.name = node.name;
		_t.isa = node.isa;
		_t.txt = node.txt;
		_t.cssClass = node.cssClass;
		_t.img = node.img;
		_t.icon = node.icon;
		_t.up =  node.up;
		_t.in = node.in;

		// not added in constructor, added by .expand;
		_t.index = node.index;
		return _t;
	}

	setIndex(index){
		this.index = index ? index : 0;
		return this;
	}

	setUp(up){
		this.up = up;

		// copy parent's style
		if(!this.cssClass && up && up instanceof Array && up[0]){
			this.cssClass = up[0].cssClass;
			if(!this.txt)
				this.txt = up[0].txt;
		}

		return this;
	}

	/**
	 * Converts a tree that was generated to a flat array universe
	 * @param  {Object} node        the tree that was generated
	 * @param  {number} startIndex  the index of the node
	 * @param  {number} arrayLength the latest index we can use for new items in the universe
	 * @return {Object}             { tree, array } tree is what is returned to user
	 */
	flatten(arrayLength, generations){
		var node = Node.copy(this);
		var array = [node];

		// no in, termination condition
		if(!node.in || !(node.in instanceof Array)){
			return { tree: node._toIndexes(), array };
		}

		if(typeof generations === undefined) generations = 1;
		if(!node.index || isNaN(node.index)) node.index = 0;
		if(!arrayLength) arrayLength = node.index+1;

		// make object to store up
		var up = node.makeAncestorArray();

		node.in.forEach((n,i)=>{
			
			n = Node.copy(n).setUp(up).setIndex(arrayLength++);

			// recurse
			var toArray = n.flatten(arrayLength, generations-1);
			node.in[i] = toArray.tree;
			array = array.concat(toArray.array);
		});

		array[0] = node._toIndexes();

		return { tree: node, array };
	}

	/**
	 * 'PRIVATE' Returns a new Node that points to the indexes of their parent and children
	 * Expects that nested children of this Node have an .index property
	 * @return {Node}              has numeric up and numeric .in
	 */
	_toIndexes(){
		var _new = Node.copy(this);

		if(_new.in instanceof Array){
			_new.in = _new.in.map((c)=>c.index);
		}

		// already flat
		if(!(_new.up instanceof Array))
			return _new;

		_new.up = _new.up.slice(0); // copy the array so don't accidentally modify this

		if(!_new.up.length){ // empty array
			delete _new.up;
			return _new;
		}
		
		_new.up = _new.up[0].index;
		return _new;
	}

	expand(arr, generations){
		var inArr = this.in;
		this.in = [];

		if(!generations || generations < 1){
			this.in = (inArr && inArr.length);
			return this;
		}

		inArr.forEach((c,i)=>{
			c = parseInt(c,10);

			var cTree = Node.copy(arr[c]);
			cTree.index = c;
			cTree.expandUp(arr);

			// child has no children, just put child
			if(!cTree.in || !cTree.in.forEach) {
				this.in[i] = cTree;
				return;
			}

			cTree.expand(arr, --generations);
			this.in[i] = cTree;
		})
		return this;
	}

	/**
	 * Populate up with ancestor array from just a parent index
	 * @param {Object} node the node to add up to
	 */
	expandUp(arr){
		if(!arr)
			throw new Error("paramater arr is required");

		//don't have ancestors
		if(typeof this.up === undefined || this.up === null) 
			this.up = [];
		if(this.up instanceof Array) return;
		
		var upIndex = this.up;
		var isParent = true
		this.up = [];

		while(typeof upIndex !== "undefined"){
			if(isNaN(upIndex)){
				throw new Error()
			}

			var ref = arr[upIndex];
			if(!ref){
				throw new Error();
			}

			var ancestor = (isParent) ? new Parent(ref) : new Ancestor(ref);
			ancestor.index = upIndex;
			isParent = false;
			upIndex = ref.up;

			this.up.push(ancestor);
		}
	}

	/**
	 * Takes a node and makes their child's ancestor array
	 * @param  {Object} node the parent node
	 * @return {[Object]}      an array of Ancestors
	 */
	makeAncestorArray(){
		// make obejct to store up
		var up = [].concat(this.up);

		var parent = new Parent(this);

		// put a new ancestor at the front of the array
		up.unshift(parent);

		// remove render data from the grandparent
		if(up[1]){ 
			up[1] = new Ancestor(up[1]);
		}

		return up;
	}
}

module.exports = Node;
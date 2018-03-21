const Schema = require("mongoose").Schema;

const Nested = require('../routes/packs/nested');

const flatInstanceSchema = Schema({
	name: String,
	isa: String,
	txt: String,
	cssClass: String,
	img: String,
	icon: String,
	up: Number,
	todo: Boolean,
	in: {
		type: [Number],
	 	default: void 0
	}
}, { _id: false });

/**
 * Should return a Nested
 * @param  {[type]} generations [description]
 * @return {[type]}             [description]
 */
flatInstanceSchema.methods.expand = function(generations){
	var inArr = this.in || [];
	var arr = this.parent().array;

	var node = Nested.copy(this);
	node.up = expandUp.call(this);
	
	if(!generations || generations < 1){
		node.in = !!(inArr && inArr.length) || this.todo;
		return node;
	}

	node.in = [];
	inArr.forEach((c,i)=>{
		c = parseInt(c,10);

		var cInst = arr[c];
		
		cTree = cInst.expand(--generations);
		cTree.index = c;
		cTree.up = expandUp.call(cInst);
		
		node.in[i] = cTree;
	});

	if(!node.in.length){
		node.in = undefined;
	}
	if(this.todo){
		node.in = true;
	}

	return node;
}

/**
 * Populate up with ancestor array from just a parent index
 * @param {Object} node the node to add up to
 */
function expandUp(){

	//don't have ancestors
	if(typeof this.up === 'undefined' || this.up === null) 
		return undefined;
	if(this.up instanceof Array){
		if(!this.up.length){ //don't have ancestors
			this.up = undefined;
			return undefined;
		}
		var nestedUp = [].concat(this.up);
		this.up = this.up[0].index;
		return nestedUp;
	}

	const arr = this.parent().array;
	var upIndex = this.up;
	var isParent = true
	var up = [];

	while(typeof upIndex !== "undefined"){
		if(isNaN(upIndex)){
			throw new Error()
		}

		var ref = arr[upIndex];
		if(!ref){
			throw new Error();
		}

		var ancestor = Nested.getAncestor(ref, isParent);
		ancestor.index = upIndex;
		isParent = false;
		upIndex = ref.up;

		up.push(ancestor);
	}

	return up;
}


module.exports = { flatInstanceSchema };
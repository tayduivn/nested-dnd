
function treeToArray(node, startIndex, arrayLength){
	if(!node) return {};

	var array = [node];
	node.index = (startIndex) ? startIndex : 0;
	currentIndex = (arrayLength) ? arrayLength : node.index+1;

	// no in, termination condition
	if(!node.in || !(node.in instanceof Array)){
		cleanUp(node);
		return {
			tree: node,
			array: array
		};
	}

	// make obejct to store up
	var up = [].concat(node.up);
	var parent = { 
		index: node.index,
		name: node.name ? node.name : node.isa
	}
	//optional fields
	if(node.txt) parent.txt = node.txt;
	if(node.cssClass) parent.cssClass = node.cssClass;
	// put a new ancestor at the front of the array
	up.unshift(parent);

	if(up[1]){ // remove render data from the grandparent
		up[1] = Object.assign({}, up[1]);
		delete up[1].txt;
		delete up[1].cssClass
	}

	var flatNode = Object.assign({}, node, {in: []});

	node.in.forEach((n,i)=>{
		n.up = up;

		// recurse.
		var toArray = this.treeToArray(n, currentIndex);
		flatNode.in[i] = toArray.tree.index;
		node.in[i] = toArray.tree;
		array = array.concat(toArray.array);
	});

	cleanUp(flatNode);

	return {
		tree: node,
		array: array
	};

	// for storage in the flat array 
	function cleanUp(cleanMe){
		var copy = Object.assign({}, cleanMe);

		if(copy.up){
			copy.up = cleanMe.up.slice(0);
			if(!copy.up.length){
				delete copy.up;
			}
			else{
				copy.up = copy.up[0].index;
			}
		}
		
		array[0] = copy;
	}
}


function arrayToTree(arr, startIndex){
	var rootIndex = (startIndex && arr[startIndex]) ? parseInt(startIndex,10) : 0;

	var node = arr[rootIndex];
	var treeNode = Object.assign({}, node);
	treeNode.index = rootIndex;

	if(!node || !node.in || !node.in.forEach) {
		return treeNode;
	}

	treeNode.in = [];

	node.in.forEach((c,i)=>{
		c = parseInt(c,10);

		var child = arr[c];
		var cTree = Object.assign({}, child);
		cTree.index = c;
		cTree.up = populateUp(cTree, arr);

		// child has no children, just put child
		if(!child || !child.in || !child.in.forEach) {
			treeNode.in[i] = cTree;
			return;
		}

		// loop children
		cTree.in = [];
		if(child.in && child.in.forEach){
			child.in.forEach((g,j)=>{
				g = parseInt(g,10);
				gChild = cTree.in[j] = Object.assign({}, arr[g])
				gChild.up = populateUp(cTree.in[j], arr)
				gChild.index = g;
				if(gChild.in) gChild.in = true; // stop at third level
			})
			treeNode.in[i] = cTree;
		}
		
	})

	return treeNode;
}

/**
 * Populate up with ancestor array from just a parent index
 * @param {Object} node the node to add up to
 */
function populateUp(node, arr){
	//don't have ancestors
	if(typeof node.up === undefined || node.up === null) 
		return [];
	if(node.up instanceof Array)
		return node;
	if(!arr)
		throw new Error("paramater arr is required");

	var upArr = [];
	var upIndex = node.up;
	var isParent = true
	while(typeof upIndex !== "undefined"){
		if(isNaN(upIndex)){
			throw new Error()
		}

		var ref = arr[upIndex];
		if(!ref){
			throw new Error()
		}

		var ancestor = {
			index: upIndex,
			name: ref.name ? ref.name : ref.isa
		}
		if(isParent){ // parent
			if(ref.txt) ancestor.txt = ref.txt;
			if(ref.cssClass)  ancestor.cssClass = ref.cssClass;
			isParent = false;
		}
		upArr.push(ancestor);
		upIndex = ref.up;
	}

	return upArr;
}

module.exports = { treeToArray, arrayToTree, populateUp };
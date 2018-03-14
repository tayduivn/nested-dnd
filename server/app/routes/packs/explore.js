
function treeToArray(node, startIndex){
	var array = [node];
	node.index = (startIndex) ? startIndex : 0;
	currentIndex = node.index+1;

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
		name: node.name
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

		// don't need to store index or ancestry in array, just parent index. Will rebuild on get
		delete copy.index;
		if(copy.up){
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
	var rootIndex = (startIndex) ? parseInt(startIndex) : 0;

	var node = arr[rootIndex];

	if(!node || !node.in || !node.in.forEach) 
		return node;

	var treeNode = Object.assign({}, node, {in: []});

	node.in.forEach((c,i)=>{

		var child = arr[parseInt(c)];
		if(!child || !child.in || !child.in.forEach) {
			return;
		}

		if(child.in && child.in.forEach){

			var cTree = Object.assign({}, child, {in: []});
			child.in.forEach((g,j)=>{
				cTree.in[j] = arr[parseInt(g)]
			})
			treeNode.in[i] = cTree;
		}
		
	})

	return treeNode;
}

module.exports = { treeToArray, arrayToTree };

function treeToArray(node, startIndex){
	var array = [node];
	node.index = (startIndex) ? startIndex : 0;
	currentIndex = node.index+1;

	// no children, termination condition
	if(!node.children || !(node.children instanceof Array)){
		return {
			tree: node,
			array: array
		};
	}

	// make obejct to store ancestors
	var ancestors = [].concat(node.ancestors);
	ancestors.unshift({ // put a new ancestor at the front of the array
		index: node.index,
		name: node.name,
		textColor: node.textColor,
		cssClass: node.cssClass
	});
	if(ancestors[1]){ // remove render data from the grandparent
		ancestors[1] = Object.assign({}, ancestors[1]);
		delete ancestors[1].textColor;
		delete ancestors[1].cssClass
	}

	var flatNode = Object.assign({}, node, {children: []});

	node.children.forEach((n,i)=>{
		n.ancestors = ancestors;

		// recurse.
		var toArray = this.treeToArray(n, currentIndex);
		flatNode.children[i] = toArray.tree.index;
		node.children[i] = toArray.tree;
		array = array.concat(toArray.array);
	});

	array[0] = flatNode;

	return {
		tree: node,
		array: array
	};
}


function arrayToTree(arr, startIndex){
	var rootIndex = (startIndex) ? parseInt(startIndex) : 0;

	var node = arr[rootIndex];

	if(!node || !node.children || !node.children.forEach) 
		return node;

	var treeNode = Object.assign({}, node, {children: []});

	node.children.forEach((c,i)=>{

		var child = arr[parseInt(c)];
		if(!child || !child.children || !child.children.forEach) {
			return;
		}

		if(child.children && child.children.forEach){

			var cTree = Object.assign({}, child, {children: []});
			child.children.forEach((g,j)=>{
				cTree.children[j] = arr[parseInt(g)]
			})
			treeNode.children[i] = cTree;
		}
		
	})

	return treeNode;
}

module.exports = { treeToArray, arrayToTree };
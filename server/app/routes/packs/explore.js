
const Node = require('./Node');


function arrayToTree(arr, startIndex){
	var rootIndex = (startIndex && arr[startIndex]) ? parseInt(startIndex,10) : 0;

	var treeNode = Node.copy(arr[rootIndex]);
	treeNode.index = rootIndex;

	if(!treeNode.in || !treeNode.in.forEach) {
		return treeNode;
	}

	return treeNode.expand(arr, 1);
}


module.exports = { arrayToTree };
export default function processInSort(inObjects = [], value) {
	if (!inObjects) return inObjects;

	// change from objects to indexes and remove new
	var inArr = inObjects
		.filter(c => c)
		.map(c => c && c.index)
		.filter((v = [], i, self) => {
			return self.indexOf(v) === i && !(v.includes && v.includes("NEW"));
		});
	var child = inArr[value.from];

	// do the move
	inArr.splice(value.from, 1);
	inArr.splice(value.to, 0, child);
	return inArr;
}

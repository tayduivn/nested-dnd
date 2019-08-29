export default function selectAncestorsAndStyle(id, instances) {
	let current = instances[id];
	if (!current) return { up: [] };

	const upArr = [];
	let style = { cls: current.cls, txt: current.txt };
	// prevent infinite loops
	let alreadySeen = [];

	while (current.up) {
		if (alreadySeen.includes(current.up)) break;
		alreadySeen.push(current.up);
		current = instances[current.up];
		if (!current) break;
		upArr.push(current);
		if (!style.cls) {
			style = { cls: current.cls, txt: current.txt };
		}
	}

	return {
		cls: style.cls,
		txt: style.txt,
		up: upArr
	};
}

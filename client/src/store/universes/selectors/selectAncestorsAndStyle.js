export default function selectAncestorsAndStyle(id, instances) {
	let current = instances[id];
	const upArr = [];
	let style = { ...current };

	while (current.up) {
		current = instances[current.up];
		upArr.push(current);
		style = { ...current, ...style };
	}

	return {
		cls: style.cls,
		txt: style.txt,
		up: upArr
	};
}

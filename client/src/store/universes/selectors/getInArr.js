export default function getInArr(parent, instances) {
	if (!Array.isArray(parent.in)) return [];
	return parent.in.map(id => {
		const child = { ...instances[id] };
		if (!child.cls) {
			child.cls = parent.cls;
			child.txt = parent.txt;
		}
		return child;
	});
}

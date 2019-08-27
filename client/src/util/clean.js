export default function clean(obj) {
	Object.assign({}, obj);
	for (var propName in obj) {
		if (obj[propName] === undefined) {
			delete obj[propName];
		}
	}
	return obj;
}

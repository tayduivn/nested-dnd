export default function getFavorites({ favorites = [], array = [] } = {}) {
	return favorites
		.filter(index => array[index])
		.map(index => ({ index, name: array[index].name || array[index].isa }));
}

// normalize an array of packs, always partial
module.exports = function normalizePacks(packs) {
	const byId = {};
	const byUrl = {};
	const idArray = [];

	for (var i = 0; i < packs.length; i++) {
		let pack = packs[i];

		pack.partial = true;

		if (pack._id) {
			const id = pack._id.toString();
			idArray.push(id);
			byId[id] = pack;
			byUrl[pack.url] = id;
			packs[i] = id;
		}
	}
	return {
		byId,
		byUrl,
		idArray
	};
};

/**
 * Given an array of ancestors, sort them from root to most recent
 * @param {[Instance]} ancestors an array of Instance ancestors
 * @param {ObjectId} instance_id the current id - the child of all ancestors
 */
module.exports = function sortAncestors(instance_id, ancestors = []) {
	const unsorted = [...ancestors];
	const sorted = [];
	let current = unsorted.find(anc => anc._id.equals(instance_id));
	if (!current) return sorted;

	sorted.push(current);

	while (current.up) {
		const nextIndex = unsorted.findIndex(anc => anc._id.equals(current.up));
		if (nextIndex === -1) {
			sorted.reverse();
			return sorted;
		}
		const next = unsorted[nextIndex];
		sorted.push(next);
		current = next;
		// prevent an infinite loop by removing ones we've found from the array
		unsorted.splice(nextIndex, 1);
	}
	sorted.reverse();
	return sorted;
};

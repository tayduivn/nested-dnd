/**
 * Determine if we have everything we need from the server to
 * display this instance.
 * @param {string} id the id of the instance to check
 * @param {objcet} instances from store.universes
 */
export default function isInstanceLoaded(id, instances = {}) {
	const current = instances[id];
	if (!current || (current.todo && !current.in)) return false;

	if (current.in) {
		for (let index = 0; index < current.in.length; index++) {
			const childId = current.in[index];
			if (!instances[childId]) return false;
		}
	}

	return true;
}

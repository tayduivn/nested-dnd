import { getExploreUrlParams } from "store/location";
import isInstanceLoaded from "../util/isInstanceLoaded";

const getUniverse = state => {
	const {
		match: {
			params: { type, id: identifier }
		},
		index
	} = getExploreUrlParams(state);
	const isUniverse = type === "universe";
	const validIndex = Number.isInteger(index);

	// lookup universe and pack by id
	let universe, pack, universe_id, pack_id;
	if (isUniverse) {
		universe_id = identifier;
		universe = state.universes.byId[universe_id];
		if (universe) {
			pack_id = universe.pack;
			pack = state.packs.byId[pack_id];
		}
	} else {
		pack = state.packs.byUrl[identifier];
		if (pack) {
			universe_id = pack.universe_id;
			universe = state.universes.byId[universe_id];
		}
	}

	// lookup the current instance
	let instance_id;
	if (universe) instance_id = universe.array[index];

	let isLoaded =
		universe && pack && validIndex && isInstanceLoaded(instance_id, state.universes.instances);

	return {
		universe,
		universe_id,
		pack,
		pack_id,
		index: validIndex ? index : false,
		isUniverse,
		isLoaded,
		type,
		instance_id,
		identifier
	};
};

export default getUniverse;

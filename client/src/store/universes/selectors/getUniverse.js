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
	let universe, pack, universeId, packId;
	if (isUniverse) {
		universeId = identifier;
		universe = state.universes.byId[universeId];
		if (universe) {
			packId = universe.pack;
			pack = state.packs.byId[packId];
		}
	} else {
		pack = state.packs.byUrl[identifier];
		if (pack) {
			universeId = pack.universe_id;
			universe = state.universes.byId[universeId];
		}
	}

	// lookup the current instance
	let instanceId;
	if (universe) instanceId = universe.array[index];

	let isLoaded =
		universe && pack && validIndex && isInstanceLoaded(instanceId, state.universes.instances);

	return {
		universe,
		universeId,
		pack,
		packId,
		index: validIndex ? index : false,
		isUniverse,
		isLoaded,
		type,
		identifier
	};
};

export default getUniverse;

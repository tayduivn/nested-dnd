import { getExploreUrlParams } from "store/location";

const LOADING = "";

// eslint-disable-next-line
const getUniverse = state => {
	let { index, match } = getExploreUrlParams(state);
	let universe, pack;
	const isUniverse = match.params.type === "universe";

	if (!match) return {};

	if (isUniverse) {
		universe = state.universes.byId[match.params.id] || {
			loaded: false,
			_id: match.params.id
		};
		pack = state.packs.byId[universe.pack];
	} else {
		const packid = match && state.packs.byUrl[match.params.id];
		pack = state.packs.byId[packid] || (match && { url: match.params.id });
		universe = (pack && state.universes.byId[pack.tempUniverse]) || { pack: pack._id };
	}

	const last = state.universes.instances[universe.last];
	if (index === LOADING && last) {
		index = last.n;
	}

	return { pack, universe, index, isUniverse };
};

export default getUniverse;

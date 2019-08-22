import { getUrlInfo } from "../Explore/selectors";

const LOADING = "";

export const selectMyUniverses = ({ universes, packs }) => ({
	...universes.myUniverses,
	array: universes.myUniverses.array.map(_id => {
		const u = universes.byId[_id];
		if (!u) return { _id };
		const lastSaw = (u.array && u.array[u.lastSaw]) || u.array[0] || {};
		const pack = packs.byId[u.pack] || {};
		return {
			...u,
			cssClass: lastSaw.cssClass,
			txt: lastSaw.txt,
			font: pack.font,
			lastSaw: lastSaw.name || lastSaw.isa
		};
	})
});

export function getFavorites({ favorites = [], array = [] } = {}) {
	return favorites
		.filter(index => array[index])
		.map(index => ({ index, name: array[index].name || array[index].isa }));
}

export const getUniverse = state => {
	let { index, match, isUniverse } = getUrlInfo(state);
	let universe, pack;

	if (!match) return {};

	if (isUniverse) {
		universe = state.universes.byId[match.params.universe] || {
			loaded: false,
			_id: match.params.universe
		};
		pack = state.packs.byId[universe.pack];
	} else {
		const packid = match && state.packs.byUrl[match.params.pack];
		pack = state.packs.byId[packid] || (match && { url: match.params.pack });
		universe = (pack && state.universes.byId[pack.tempUniverse]) || { pack: pack._id };
	}

	if (index === LOADING) index = universe.lastSaw;

	return { pack, universe, index, isUniverse };
};

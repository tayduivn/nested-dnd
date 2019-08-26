import { getExploreUrlParams } from "../Explore/selectors";

const LOADING = "";

export function selectAncestorsAndStyle(id, instances) {
	let current = instances[id];
	const upArr = [];
	let style = { ...current };

	while (current.up) {
		current = instances[current.up];
		upArr.push(current);
		style = { ...current, ...style };
	}

	return {
		cls: style.cls,
		txt: style.txt,
		up: upArr
	};
}

export const selectMyUniverses = ({ universes, packs, user }) => ({
	loaded: universes.myUniverses.loaded,
	array: universes.myUniverses.array.map(id => {
		const univ = { ...universes.byId[id] };
		univ.lastSaw = universes.instances[univ.last].name;
		const { cls, txt } = selectAncestorsAndStyle(univ.last, universes.instances);
		const pack = packs.byId[univ.pack];
		univ._id = id;
		univ.font = pack.font;
		univ.cssClass = cls;
		univ.txt = txt;
		return univ;
	})
});

export function getFavorites({ favorites = [], array = [] } = {}) {
	return favorites
		.filter(index => array[index])
		.map(index => ({ index, name: array[index].name || array[index].isa }));
}

export const getUniverse = state => {
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

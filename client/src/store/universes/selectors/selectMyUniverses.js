import selectAncestorsAndStyle from "./selectAncestorsAndStyle";

const selectMyUniverses = ({ universes, packs }) => ({
	isLoaded: universes.myUniverses.isLoaded,
	array: universes.myUniverses.array.map(id => {
		const univ = { ...universes.byId[id] };
		const last = universes.instances[univ.last];
		univ.lastSaw = last ? last.name : "";
		const { cls, txt } = selectAncestorsAndStyle(univ.last, universes.instances);
		const pack = packs.byId[univ.pack];
		univ._id = id;
		univ.font = pack.font;
		univ.cssClass = cls;
		univ.txt = txt;
		return univ;
	})
});

export default selectMyUniverses;

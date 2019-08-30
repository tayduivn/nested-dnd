import selectAncestorsAndStyle from "./selectAncestorsAndStyle";

const selectMyUniverses = ({ universes, packs, user }) => ({
	loaded: universes.myUniverses.loaded,
	array: universes.myUniverses.array.map(id => {
		const univ = { ...universes.byId[id] };
		univ.lastSaw = universes.instances[univ.last].name;
		const { cls, txt } = selectAncestorsAndStyle(univ.last, universes.instances);
		const pack = packs.byId[univ.pack];
		univ._id = id;
		univ.font = pack.font;
		univ.cls = cls;
		univ.txt = txt;
		return univ;
	})
});

export default selectMyUniverses;

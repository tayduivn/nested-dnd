import { connect } from "react-redux";

import Explore from "./Explore";
import Splash from "./Splash";
import PlayersPreview from "./PlayersPreview";

import { loadFonts } from "../App/actions";
import { loadCurrent, changeInstance, setFavorite, deleteInstance, setLastSaw } from "./actions";
import { getGeneratorTables, getCurrent } from "./selectors";
import { getFavorites, getUniverse } from "../Universes/selectors";

// TODO: use reselect so we don't calculate current every time
const mapStateToProps = state => {
	const { pack, universe = {}, index, isUniverse } = getUniverse(state);
	const favorites = getFavorites(universe);
	return {
		universe,
		favorites,
		isFavorite: favorites.find(f => f.index === index),
		pack,
		index,
		current: getCurrent(state.universes.instances, universe, index, isUniverse),
		isUniverse,
		tables: getGeneratorTables(state, pack && pack.builtpack)
	};
};

const Container = connect(mapStateToProps)(Explore);

export default Container;
export { Splash, PlayersPreview };

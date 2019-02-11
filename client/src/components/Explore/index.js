import { connect } from "react-redux";

import Explore from "./Explore";
import Splash from "./Splash";
import PlayersPreview from "./PlayersPreview";

import { loadFonts } from "../App/store";
import { loadCurrent, changeInstance, setFavorite, deleteInstance } from "./actions";
import { getCurrent, getUniverse } from "./reducers";
import { universeSet } from "../Universes/actions";
import { getFavorites } from "../Universes/reducers";

// TODO: use reselect so we don't calculate current every time
const mapStateToProps = state => {
	const { pack, universe, index, isUniverse } = getUniverse(state);
	const favorites = getFavorites(universe);
	return {
		universe,
		favorites,
		isFavorite: favorites.find(f => f.index === index),
		pack,
		index,
		current: getCurrent(universe, index, isUniverse),
		isUniverse
	};
};
const mapDispatchToProps = (dispatch, { match }) => ({
	loadCurrent: (universe, index, isUniverse, isLite) =>
		dispatch(loadCurrent(dispatch, universe, index, isUniverse, match.params.pack, isLite)),
	loadFonts: font => font && dispatch(loadFonts([font])),
	universeSet: (index, universe) => dispatch(universeSet(universe._id, { lastSaw: index })),
	handleChange: (i, p, v, universe) => dispatch(changeInstance(i, p, v, universe._id, dispatch)),
	setFavorite: (i, isFavorite, universe) => dispatch(setFavorite(i, isFavorite, universe)),
	dispatch
});
const mergeProps = (stateProps, dispatchProps, ownProps) => {
	const dispatch = dispatchProps.dispatch;
	const universeId = stateProps.universe._id;
	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		loadCurrent: isLite =>
			dispatchProps.loadCurrent(
				stateProps.universe,
				stateProps.index,
				stateProps.isUniverse,
				isLite
			),
		loadIndex: index =>
			dispatchProps.loadCurrent(stateProps.universe, index, stateProps.isUniverse, true),
		loadFonts: () => stateProps.pack && dispatchProps.loadFonts(stateProps.pack.font),
		setLastSaw: () => dispatchProps.universeSet(stateProps.index, stateProps.universe),
		handleChange: (i, p, v) => dispatchProps.handleChange(i, p, v, stateProps.universe),
		toggleFavorite: () =>
			dispatchProps.setFavorite(
				stateProps.index,
				!stateProps.current.isFavorite,
				stateProps.universe
			),
		handleDelete: (i = stateProps.index) => dispatch(deleteInstance(i, universeId, dispatch))
	};
};

const Container = connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(Explore);

export default Container;
export { Splash, PlayersPreview };

import Universes from "../components/Universes";
import { connect } from "react-redux";

import { fetch as fetchPacks } from "store/packs";
import { fetch, selectMyUniverses } from "store/universes";

const mapStateToProps = state => ({
	packs: {
		myPacks: state.packs.myPacks.map(id => state.packs.byId[id]),
		publicPacks: state.packs.publicPacks.map(id => state.packs.byId[id])
	},
	universes: selectMyUniverses(state),
	isLoaded: state.universes.myUniverses.isLoaded,
	loggedIn: state.user.loggedIn
});
const mapDispatchToProps = dispatch => ({
	loadUniverses: ({ packs, universes, isLoaded }) => {
		dispatch(fetchPacks(packs.isLoaded));
		dispatch(fetch(isLoaded));
	},
	dispatch
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Universes);

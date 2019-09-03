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
	loaded: state.universes.myUniverses.loaded,
	loggedIn: state.user.loggedIn
});
const mapDispatchToProps = dispatch => ({
	loadUniverses: ({ packs, universes, loaded }) => {
		dispatch(fetchPacks(packs.loaded));
		dispatch(fetch(loaded));
	},
	dispatch
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Universes);

import { connect } from "react-redux";

import CreateUniverse from "./components/CreateUniverse";
import EditUniverse from "./containers/EditUniverse";
import Universes from "./components/Universes";

import { fetch as fetchPacks } from "store/packs";
import { fetch, selectMyUniverses } from "store/universes";

const routes = [
	{
		path: "/create",
		isCreate: true,
		private: true,
		component: CreateUniverse
	},
	{
		path: "/:universe",
		component: EditUniverse,
		private: true
	}
];

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
const Container = connect(
	mapStateToProps,
	mapDispatchToProps
)(Universes);

export default Container;

export { CreateUniverse, EditUniverse, routes };

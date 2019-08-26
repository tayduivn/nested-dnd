import { connect } from "react-redux";

import CreateUniverse from "./CreateUniverse";
import EditUniverse from "./EditUniverse";
import Universes from "./Universes";
import Explore from "../Explore";

import { actions as packActions } from "../Packs";
import { fetch } from "./actions";
import { selectMyUniverses } from "./selectors";

const routes = [
	{
		path: "/create",
		isCreate: true,
		private: true,
		component: CreateUniverse
	},
	{
		path: "/:universe",
		component: Explore,
		routes: [
			{
				path: "/edit",
				private: true,
				component: EditUniverse
			}
		]
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
		dispatch(packActions.fetch(packs.loaded));
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

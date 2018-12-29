import { connect } from "react-redux";

import CreateUniverse from "./CreateUniverse";
import EditUniverse from "./EditUniverse";
import Universes from "./Universes";
import Explore from "../Explore";

import { actions as packActions } from "../Packs";
import { actions as userActions } from "../User";
import actions from "./actions";

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
				path: "/explore",
				private: true,
				component: Explore
			},
			{
				path: "/edit",
				private: true,
				component: EditUniverse
			}
		]
	}
];

const mapStateToProps = state => ({
	packs: state.packs,
	universes: state.universes,
	loggedIn: state.user.loggedIn
});
const mapDispatchToProps = dispatch => ({
	loadUniverses: ({ packs, universes }) => {
		dispatch(packActions.fetch(dispatch, packs.loaded));
		dispatch(actions.fetch(dispatch, universes.loaded));
	},
	checkLoggedIn: () => dispatch(userActions.checkLoggedIn(dispatch))
});
const Container = connect(
	mapStateToProps,
	mapDispatchToProps
)(Universes);

export default Container;

export { CreateUniverse, EditUniverse, routes };

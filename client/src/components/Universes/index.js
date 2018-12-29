import { connect } from "react-redux";

import CreateUniverse from "./CreateUniverse";
import EditUniverse from "./EditUniverse";
import Universes from "./Universes";
import Explore from "../Explore";

import { actions as packActions } from "../Packs";
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
	universes: state.universes
});
const mapDispatchToProps = dispatch => ({
	onInitialLoad: ({ packs, universes }) => {
		dispatch(packActions.fetch(dispatch, packs.loaded));
		dispatch(actions.fetch(dispatch, universes.loaded));
	}
});
const Container = connect(
	mapStateToProps,
	mapDispatchToProps
)(Universes);

export default Container;

export { CreateUniverse, EditUniverse, routes };

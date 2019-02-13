import Packs, { PackUL, PacksList } from "./Packs.js";
import Pack from "./Pack";
import EditPack from "./EditPack";
import Explore from "../Explore";
import Generators, { routes as generators } from "../Generators";
import Tables, { routes as tables } from "../Tables";
import { connect } from "react-redux";

import actions from "./actions";

const routes = [
	{
		path: "/:pack",
		isCreate: false,
		exact: false,
		component: Pack,
		routes: [
			{
				path: "/edit",
				private: true,
				component: EditPack
			},
			{
				path: "/explore",
				component: Explore
			},
			{
				path: "/generators",
				component: Generators,
				routes: generators
			},
			{
				path: "/tables",
				component: Tables,
				routes: tables
			}
		]
	},
	{
		path: "/create",
		exact: true,
		isCreate: true,
		private: true,
		component: EditPack
	}
];

const mapStateToProps = (state, ownProps) => {
	return {
		...ownProps,
		myPacks: state.myPacks.map(id => state.packs.byId[id]),
		publicPacks: state.publicPacks.map(id => state.packs.byId[id]),
		loggedIn: state.user.loggedIn,
		// needs to be a function because this is Packs not Pack
		getPack: packid => {
			return (state.packs.byId && state.packs.byId[packid]) || {};
		}
	};
};
const mapDispatchToProps = dispatch => ({
	onAddPack: data => dispatch(actions.add(data)),
	fetchPack: id => dispatch(actions.fetchPack(dispatch, id)),
	fetchRebuild: id => dispatch(actions.fetchRebuild(dispatch, id))
});
const PacksContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Packs);

export default PacksContainer;
export { Pack, EditPack, routes, PackUL, PacksList, actions };

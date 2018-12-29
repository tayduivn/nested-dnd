import { connect } from "react-redux";

import Packs, { PackUL, PacksList } from "./Packs";
import Pack from "./Pack";
import EditPack from "./EditPack";
import Explore from "../Explore";
import Generators, { routes as generators } from "../Generators";
import Tables, { routes as tables } from "../Tables";

import actions from "./actions";

const routes = [
	{
		path: "/create",
		exact: true,
		isCreate: true,
		private: true,
		component: EditPack
	},
	{
		path: "/:pack",
		isCreate: false,
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
	}
];

const mapStateToProps = (state, ownProps) => {
	return {
		...ownProps,
		...state.packs,
		loggedIn: state.user.loggedIn,
		getPack: packid => (state.packs.map && state.packs.map[packid]) || {}
	};
};
const mapDispatchToProps = dispatch => {
	return {
		onAddPack: data => dispatch(actions.add(data)),
		fetchPack: id => dispatch(actions.fetchPack(dispatch, id))
	};
};

const Container = connect(
	mapStateToProps,
	mapDispatchToProps
)(Packs);

export default Container;
export { Pack, EditPack, routes, PackUL, PacksList, actions };

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
		isCreate: true,
		private: true,
		component: EditPack
	},
	{
		path: "/:pack",
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

const mapDispatchToProps = dispatch => ({
	onAddPack: data => dispatch(actions.add(data))
});
const mapStateToProps = state => state.packs;

const Container = connect(
	mapStateToProps,
	mapDispatchToProps
)(Packs);

export default Container;
export { Pack, EditPack, routes, PackUL, PacksList, actions };

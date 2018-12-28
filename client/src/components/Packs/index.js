import { connect } from "react-redux";

import Packs, { PackUL, PacksList } from "./Packs";
import Pack from "./Pack";
import EditPack from "./EditPack";
import Explore from "../Explore";
import Generators, { routes as generators } from "../Generators";
import Tables, { routes as tables } from "../Tables";

import { addPack } from "./actions";

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

const Container = connect({
	mapDispatchToProps: dispatch => ({
		onAddPack: data => dispatch(addPack(data))
	}),
	mapStateToProps: state => state.packs
})(Packs);

export default Container;
export { Pack, EditPack, routes, PackUL, PacksList };

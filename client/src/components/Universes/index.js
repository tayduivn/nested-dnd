import { connect } from "react-redux";

import CreateUniverse from "./CreateUniverse";
import EditUniverse from "./EditUniverse";
import Universes from "./Universes";
import Explore from "../Explore";

import { fetchPacks } from "../Packs/actions";

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

const Container = connect({
	mapStateToProps: state => ({
		packs: state.packs,
		universes: state.universes
	}),
	mapDispatchToProps: dispatch => ({
		onInitialLoad: () => {
			dispatch(fetchPacks());
		}
	})
})(Universes);

export default Container;

export { CreateUniverse, EditUniverse, routes };

import { connect } from "react-redux";

import Packs from "./components/Packs.js";
import Pack from "./containers/Pack";
import EditPack from "./containers/EditPack";
import Generators from "containers/Generators";
import Tables from "containers/Tables";

import { add, fetchPack, fetchRebuild } from "store/packs";

const routes = [
	{
		path: "/:pack/edit",
		isCreate: false,
		component: Pack
	},
	{
		path: "/:pack",
		isCreate: false,
		exact: false,
		component: Pack,
		routes: [
			{
				path: "/generators",
				component: Generators
			},
			{
				path: "/tables",
				component: Tables
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
		getPack: pack_id => {
			return (state.packs.byId && state.packs.byId[pack_id]) || {};
		}
	};
};
const mapDispatchToProps = dispatch => ({
	onAddPack: data => dispatch(add(data)),
	fetchPack: id => dispatch(fetchPack(dispatch, id)),
	fetchRebuild: id => dispatch(fetchRebuild(dispatch, id))
});
const PacksContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Packs);

export default PacksContainer;
export { Pack, routes };

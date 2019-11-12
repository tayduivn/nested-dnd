import { connect } from "react-redux";

import Packs from "../components/Packs.js";
import { add, fetchPack, fetchRebuild } from "store/packs";

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
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Packs);

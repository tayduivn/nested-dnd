import { connect } from "react-redux";

import { getUniverse, addChild } from "store/universes";
import Dropdown from "components/Form/Dropdown";
import { getIsaOptions } from "store/universes";
import "./IsASelect.scss";

// IN EXPLORE
const IsASelect = connect(
	function mapStateToProps(state) {
		const { pack = {}, universe = {}, index } = getUniverse(state);
		return {
			fixedOptions: getIsaOptions(state, pack.builtpack),
			universeId: universe._id,
			index,
			notFoundError: "Can't find generator",
			className: "isa",
			classTextArea: "isa__addChild",
			// because it is draggable, the mousedown event is blocked
			useOnClick: true
		};
	},
	function matchDispatchToProps(dispatch) {
		return {
			onChange: (universeId, index, value) => dispatch(addChild(universeId, index, value))
		};
	},
	function mergeProps(stateProps, dispatchProps, ownProps) {
		return {
			...ownProps,
			...stateProps,
			...dispatchProps,
			onChange: child => dispatchProps.onChange(stateProps.universeId, stateProps.index, child)
		};
	}
)(Dropdown);

export default IsASelect;

import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { getUniverse, getIsaOptions } from "store/universes";
import Dropdown from "components/Form/Dropdown";
import { CHILD_CLASSES } from "../components/Child";
import { fetchAddChildOptions } from "store/packs/actions";
import "../components/Child.scss";
import "./ChildAdd.scss";

const Placeholder = (
	<div className="isa__addChild-placeholder">
		<i className="fas fa-plus" />
	</div>
);

const ISA_SELECT_OPTIONS = {
	autoFocus: true,
	optionHeight: 30,
	clearOnSubmit: true,
	allowCustom: true,
	// because it is draggable, the mousedown event is blocked
	useOnClick: true,
	notFoundError: "Can't find generator",
	sibling: Placeholder,
	className: "isa",
	classTextarea: "isa__addChild"
};

// In Explore!
function ChildAdd({ handleAdd, universeId, index, i, packurl, fixedOptions }) {
	const [fadeIn, setfadeIn] = useState(false);
	const dispatch = useDispatch();

	// if the universe or current index changes, reanimate
	useEffect(() => {
		// set opacity 0, timeout to set back
		setfadeIn(false);
		requestAnimationFrame(() => {
			setfadeIn(true);
		});
	}, [universeId, index]);

	// do this only when universe changes
	useEffect(() => {
		dispatch(fetchAddChildOptions(packurl));
	}, [dispatch, packurl]);

	return (
		<div
			className={`${CHILD_CLASSES} ${fadeIn ? "fadeInChild" : ""}`}
			style={{ animationDelay: 50 * i + "ms" }}
		>
			<div className="isNew bg-grey-50">
				<Dropdown {...ISA_SELECT_OPTIONS} fixedOptions={fixedOptions} onChange={handleAdd} />
			</div>
		</div>
	);
}

export default connect(function mapStateToProps(state) {
	const { pack, universeId, index } = getUniverse(state);
	return {
		fixedOptions: getIsaOptions(state, pack),
		packurl: pack && pack.url,
		universeId,
		index
	};
})(ChildAdd);

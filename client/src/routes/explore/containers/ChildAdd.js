import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { getUniverse, getIsaOptions } from "store/universes";
import Dropdown from "components/Form/Dropdown";
import { CHILD_CLASSES } from "../components/Child";
import { fetchAddChildOptions } from "store/packs/actions";
import "../components/Child.scss";
import styles from "./ChildAdd.module.scss";

const placeholder = (
	<div className={styles.placeholder}>
		<i className="fas fa-plus" />
	</div>
);

const ISA_SELECT_OPTIONS = {
	autoFocus: true,
	optionHeight: 30,
	clearOnSubmit: true,
	allowCustom: true,
	// because it is draggable, the mousedown event is blocked
	// useOnClick: true,
	notFoundError: "Can't find generator",
	styles: styles
};

// In Explore!
function ChildAdd({ handleAdd, universe_id, index, i, packurl, fixedOptions }) {
	const [fadeIn, setfadeIn] = useState(false);
	const dispatch = useDispatch();

	// if the universe or current index changes, reanimate
	useEffect(() => {
		// set opacity 0, timeout to set back
		setfadeIn(false);
		requestAnimationFrame(() => {
			setfadeIn(true);
		});
	}, [universe_id, index]);

	// do this only when universe changes
	useEffect(() => {
		dispatch(fetchAddChildOptions(packurl));
	}, [dispatch, packurl]);

	return (
		<div
			className={`${CHILD_CLASSES} ${fadeIn ? "fadeInChild" : ""}`}
			style={{ animationDelay: 50 * i + "ms" }}
		>
			<div className={styles.isNew}>
				<Dropdown {...ISA_SELECT_OPTIONS} fixedOptions={fixedOptions} onChange={handleAdd}>
					{placeholder}
				</Dropdown>
			</div>
		</div>
	);
}

export default connect(function mapStateToProps(state) {
	const { pack_id, pack, universe_id, index } = getUniverse(state);
	return {
		fixedOptions: getIsaOptions(state, pack_id),
		packurl: pack && pack.url,
		universe_id,
		index
	};
})(ChildAdd);

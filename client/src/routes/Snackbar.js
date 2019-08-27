import React, { useState, useCallback, useEffect } from "react";
import { connect } from "react-redux";

import { popSnack } from "store/snackbar";

const Snack = ({ title = "Error", i, dispatch }) => {
	const [hide, setHide] = useState(false);

	const doHide = useCallback(() => {
		setHide(true);
		// wait for fade
		setTimeout(() => dispatch(popSnack(i)), 150);
	}, [dispatch, i]);

	function fadeOut() {
		if (hide) return;
		setTimeout(() => {
			setHide(true);
			// wait for fade
			setTimeout(() => dispatch(popSnack(i)), 150);
		}, 4000);
	}

	useEffect(fadeOut, []);

	return (
		<div className={`snack${hide ? " --hidden" : ""}`} key={i}>
			<div className="snack__label">{title}</div>
			<div className="snack__action"></div>
			<button className="snack__close" onClick={doHide}>
				<i className="fas fa-times"></i>
			</button>
		</div>
	);
};

const Snackbar = ({ snacks = [], dispatch }) => {
	return (
		<div className="snackbar">
			{" "}
			{snacks.map((snack, i) => (
				<Snack {...snack} key={i} i={i} dispatch={dispatch} />
			))}
		</div>
	);
};

export default connect(state => ({
	snacks: state.snackbar.snacks
}))(Snackbar);

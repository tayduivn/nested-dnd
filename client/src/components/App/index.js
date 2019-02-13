import React from "react";
import { connect, Provider } from "react-redux";

import App, { LOADING_GIF } from "./App.js";
import store, { loadFonts } from "./store";
import { doLogout } from "../User/actions";

const mapStateToProps = state => ({ loggedIn: state.user.loggedIn });
const mapDispatchToProps = dispatch => ({
	loadFonts: (fonts, source) => loadFonts(fonts, source),
	handleLogout: () => doLogout(dispatch)
});

const Container = connect(
	mapStateToProps,
	mapDispatchToProps
)(App);

const Wrapper = () => (
	<Provider store={store}>
		<Container />
	</Provider>
);
export default Wrapper;
export { store, LOADING_GIF };

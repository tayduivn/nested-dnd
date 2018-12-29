import React from "react";
import { connect, Provider } from "react-redux";

import App, { LOADING_GIF } from "./App.js";
import store, { loadFonts } from "./store";

const mapStateToProps = state => ({ loggedIn: state.user.loggedIn });
const mapDispatchToProps = dispatch => ({
	loadFonts: (fonts, source) => dispatch(loadFonts(fonts, source))
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

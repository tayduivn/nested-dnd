/* eslint import/first: "off" */

import "./polyfills";

import React from "react";

// monkey patch
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
	const whyDidYouRender = require("@welldone-software/why-did-you-render/dist/no-classes-transpile/umd/whyDidYouRender.min.js");
	whyDidYouRender(React);
}
import ReactDOM from "react-dom";
import serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import store, { history } from "./store";
import "animate.css";

import "./index.scss";
import App from "./App";

// Create an enhanced history that syncs navigation events with the store
const Wrapper = () => (
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<App />
		</ConnectedRouter>
	</Provider>
);

ReactDOM.render(<Wrapper />, document.getElementById("root"));
serviceWorker();

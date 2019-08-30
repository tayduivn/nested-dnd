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

import store, { history } from "./store";

import "./index.scss";
import StoreProvider from "containers/StoreProvider";
import App from "./App";

import "animate.css";

// Create an enhanced history that syncs navigation events with the store
const Wrapper = () => (
	<StoreProvider store={store} history={history}>
		<App />
	</StoreProvider>
);

ReactDOM.render(<Wrapper />, document.getElementById("root"));
serviceWorker();

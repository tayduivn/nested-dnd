import "./polyfills";

import React from "react";
import ReactDOM from "react-dom";
import serviceWorker from "./serviceWorker";

import "animate.css";

import "./index.scss";

import App from "./App";

import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import store, { history } from "./store";

// Create an enhanced history that syncs navigation events with the store
const Wrapper = () => (
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<App />
		</ConnectedRouter>
	</Provider>
);

// monkey patch
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
	const whyDidYouRender = require("@welldone-software/why-did-you-render/dist/no-classes-transpile/umd/whyDidYouRender.min.js");
	whyDidYouRender(React);
}

ReactDOM.render(<Wrapper />, document.getElementById("root"));
serviceWorker();

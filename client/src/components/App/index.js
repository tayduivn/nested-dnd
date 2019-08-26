import React from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

import App from "./App.js";
import store, { history } from "./store";

// Create an enhanced history that syncs navigation events with the store
const Wrapper = () => (
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<App />
		</ConnectedRouter>
	</Provider>
);
export default Wrapper;
export { store };

import React from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

const StoreProvider = ({ store, history, children }) => (
	<Provider store={store}>
		<ConnectedRouter history={history}>{children}</ConnectedRouter>
	</Provider>
);
export default StoreProvider;

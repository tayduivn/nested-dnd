import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";

import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

// We have to explicitly import the reducers. If we import a file
// that exports actions or selectors, shit goes haywire with nested dependencies
import packs from "./packs/reducers";
import universes from "./universes/reducers";
import user from "./user/reducers";
import generators from "./generators/reducers";
import tables from "./tables/reducers";
import snackbar from "./snackbar/reducers";
import fonts from "./fonts/reducers";

let history;
try {
	history = createBrowserHistory();
} catch {
	history = {};
}

const errorHandle = store => next => action => {
	try {
		next(action);
	} catch (e) {
		console.error(e);
	}
};

const middleWareArr = [thunk, routerMiddleware(history), errorHandle];

if (!["test", "production"].includes(process.env.NODE_ENV)) {
	middleWareArr.push(logger);
}

const middleware = applyMiddleware(...middleWareArr);

const app = combineReducers({
	packs,
	generators,
	universes,
	user,
	fonts,
	tables,
	snackbar,
	router: connectRouter(history)
});

// we want to export a function so we can explicitly make fresh instances of a store for use in Storybook, etc.
let openStore = () => createStore(app, {}, middleware);

export default openStore;
export { history };
export * from "./actions";

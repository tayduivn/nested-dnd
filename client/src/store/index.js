import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";

import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import packs from "./packs";
import universes from "./universes";
import user from "./user";
import generators from "./generators";
import tables from "./tables";
import snackbar from "./snackbar";
import fonts from "./fonts";

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

let store = createStore(app, {}, middleware);

export default store;
export { history };
export * from "./actions";

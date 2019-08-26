import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";

import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import packs from "../Packs/reducers";
import universes from "../Universes/reducers";
import user from "../User/reducers";
import generators from "../Generators/reducers";
import tables from "../Tables/redux/reducers";
import snackbar from "../Util/Snackbar/reducers";

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

const fonts = (state = {}, action = {}) => {
	switch (action.type) {
		case "LOAD_FONTS":
			return { ...state, ...action.fonts };
		default:
			return state;
	}
};

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

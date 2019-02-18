import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import WebFont from "webfontloader";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

import packs from "../Packs/reducers";
import universes from "../Universes/reducers";
import user from "../User/reducers";
import generators from "../Generators/reducers";

import { checkLoggedIn } from "../User/actions";

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

function loadFonts(fonts = [], source = "google") {
	if (!fonts) return;
	if (!(fonts instanceof Array)) fonts = [fonts];

	// remove fonts already loaded
	const loadedFonts = Object.keys(store.getState().fonts);
	const trimmedFonts = fonts.filter(d => !loadedFonts.includes(d));
	const newState = {};
	trimmedFonts.forEach(f => (newState[f] = "loading"));

	if (trimmedFonts.length) {
		WebFont.load({
			[source]: {
				families: fonts
			},
			active: function() {
				trimmedFonts.forEach(f => (newState[f] = "loaded"));
				store.dispatch({
					type: "LOAD_FONTS",
					fonts: newState
				});
			}
		});
		store.dispatch({
			type: "LOAD_FONTS",
			fonts: newState
		});
	}
}

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
	router: connectRouter(history)
});

let store = createStore(app, {}, middleware);
store.dispatch(dispatch => checkLoggedIn(dispatch));

export default store;
export { loadFonts, history };

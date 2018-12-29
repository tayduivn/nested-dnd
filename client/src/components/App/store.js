import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import WebFont from "webfontloader";

import packs from "../Packs/reducers";
import universes from "../Universes/reducers";
import user from "../User/reducers";

import { checkLoggedIn } from "../User/actions";

const errorHandle = store => next => action => {
	try {
		next(action);
	} catch (e) {
		console.error(e);
	}
};

const middleware = applyMiddleware(thunk, logger, errorHandle);

function loadFonts(fonts = [], source = "google") {
	if (!(fonts instanceof Array)) fonts = [fonts];

	return {
		type: "LOAD_FONTS",
		fonts: fonts,
		source
	};
}

const fonts = (state = [], action) => {
	switch (action.type) {
		case "LOAD_FONTS":
			// remove fonts already loaded
			const fonts = action.fonts.filter(f => !state.includes(f));

			if (fonts.length) {
				WebFont.load({
					[action.source]: {
						families: fonts
					}
				});
			}
			return [...state, action.fonts];
		default:
			return state;
	}
};

const app = combineReducers({
	packs,
	universes,
	user,
	fonts
});

const store = createStore(app, {}, middleware);

store.dispatch(dispatch => checkLoggedIn(dispatch));
export default store;
export { loadFonts };

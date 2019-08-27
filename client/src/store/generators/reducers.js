import { combineReducers } from "redux";
import { createMatchSelector } from "connected-react-router";

import { GENERATOR_SET, GENERATOR_RENAME, RECEIVE_GENERATORS } from "./actions";

export const genPathSelector = createMatchSelector({ path: "/packs/:pack/generators/:generator" });

function style(state = {}, action) {
	switch (action.type) {
		case GENERATOR_SET:
			return { ...state, ...action.data };
		default:
			return state;
	}
}

function generator(state = {}, action) {
	switch (action.type) {
		case GENERATOR_RENAME:
			return { ...state, isa: action.isa };
		case GENERATOR_SET:
			return {
				...state,
				...action.data,
				loading: action.loading,
				style: style(state.style, { ...action, data: action.data.style || {} })
			};
		default:
			return state;
	}
}

function byId(state = {}, action) {
	switch (action.type) {
		case RECEIVE_GENERATORS:
			return { ...state, ...action.data.byId };
		case GENERATOR_RENAME:
			return {
				...state,
				[action.id]: generator(state[action.id], action)
			};
		case GENERATOR_SET:
			return {
				...state,
				[action.id]: generator(state[action.id], { ...action, data: action.data.unbuilt || {} })
			};
		default:
			return state;
	}
}

export default combineReducers({
	byId
});

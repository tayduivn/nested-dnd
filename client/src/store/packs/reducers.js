import {
	ADD,
	FETCH_PACK,
	PACKS_SET,
	SET_PACK,
	REBUILD_PACK,
	RECEIVE_PACKS,
	ADD_CHILD_OPTIONS_FETCH,
	ADD_CHILD_OPTIONS_RECEIVE
} from "./actions";
import { GENERATOR_SET, GENERATOR_RENAME, CLEAR_GENERATOR_ERRORS } from "store/generators";
import { RECEIVE_EXPLORE, RECEIVE_MY_UNIVERSES } from "store/universes";

import { combineReducers } from "redux";

function generators(state = {}, action = {}) {
	let newGens = {};
	switch (action.type) {
		case CLEAR_GENERATOR_ERRORS:
			for (var isa in state) {
				if (state[isa]._id) {
					newGens[isa] = { ...state[isa] };
					delete newGens[isa].error;
				}
			}
			return newGens;
		case GENERATOR_RENAME:
			newGens = {
				...state,
				[action.isa]: { ...state[action.oldIsa] }
			};
			delete newGens[action.oldIsa];
			return newGens;
		default:
			return state;
	}
}

const pack = (state = { loaded: false, generators: false, tables: false }, action = {}) => {
	switch (action.type) {
		case ADD_CHILD_OPTIONS_RECEIVE:
			return {
				...state,
				generators: action.generators,
				tables: action.tables,
				isFetching: false
			};
		case ADD_CHILD_OPTIONS_FETCH:
			return {
				...state,
				generators: false,
				tables: false,
				isFetching: true
			};
		case REBUILD_PACK:
			return {
				...state,
				loaded: false
			};
		case SET_PACK:
			return { ...state, ...action.data, loaded: true, isFetching: false };
		case FETCH_PACK:
		default:
			const newGens = generators(state.generators, action);
			if (newGens !== state.generators) return { ...state, generators: newGens };
			else return state;
	}
};

// eslint-disable-next-line complexity
function byId(state = {}, action) {
	if (action.type === RECEIVE_MY_UNIVERSES || action.type === RECEIVE_EXPLORE) {
		action = { ...action, data: action.included.filter(item => item.type === "Pack") };
	}

	let data;
	switch (action.type) {
		case GENERATOR_RENAME:
			return { ...state, [action.pack_id]: pack(state[action.pack_id], action) };
		case GENERATOR_SET:
			if (action.data.pack) {
				data = { ...action.data.pack, generators: action.data.builtpack.generators };
				return {
					...state,
					[data._id]: pack(state[data._id], { type: SET_PACK, id: data._id, data })
				};
			}
			return state;
		// we're operating on a sole pack, so just pass on through
		case ADD_CHILD_OPTIONS_RECEIVE:
		case ADD_CHILD_OPTIONS_FETCH:
		case FETCH_PACK:
		case REBUILD_PACK:
		case SET_PACK:
			if (action.id) return { ...state, [action.id]: pack(state[action.id], action) };
			else return state;
		case PACKS_SET:
			data = action.data.byId;
			const obj = { ...state, ...data };
			for (var pack_id in obj) {
				if (!data[pack_id]) continue;
				obj[pack_id] = pack(state[pack_id], { type: SET_PACK, data: data[pack_id] });
			}
			return obj;
		case RECEIVE_EXPLORE:
		case RECEIVE_MY_UNIVERSES:
		case RECEIVE_PACKS:
			const newState = { ...state };
			action.data.forEach(item => (newState[item.id] = {...(state[item.id] || {}), ...item.attributes}));
			return newState;
		default:
			return state;
	}
}
// eslint-disable-next-line complexity
function byUrl(state = {}, action) {
	let newByUrl;

	switch (action.type) {
		case RECEIVE_EXPLORE:
			// find the pack in included items
			const pack = action.included.find(item => item.type === "Pack")
			return {...state, [pack.attributes.url]: pack.id};
		case GENERATOR_SET:
			if (action.data.pack) {
				return { ...state, [action.data.pack.url]: action.data.pack._id };
			}
			return state;
		case FETCH_PACK:
		case REBUILD_PACK:
		case PACKS_SET:
			if (action.data) return { ...state, ...action.data.byUrl };
			else return state;
		case SET_PACK:
			newByUrl = action.data && action.data.url ? { [action.data.url]: action.id } : {};
			return { ...state, ...newByUrl };
		case RECEIVE_PACKS:
			const oldUrls = Object.keys(state);
			const oldIds = Object.values(state);
			newByUrl = action.data.reduce((obj, item) => {
				obj[item.attributes.url] = item.id;
				// remove old by Url
				const findIndex = oldIds.indexOf(item.attributes.url);
				if (findIndex !== -1) {
					oldUrls.splice(findIndex, 1);
					oldIds.splice(findIndex, 1);
				}
				return obj;
			}, {});
			oldUrls.forEach((url, i) => (newByUrl[url] = oldIds[i]));
			return newByUrl;
		default:
			return state;
	}
}
function loaded(state = false, action) {
	return action.loaded || false;
}

function publicPacks(state = [], action) {
	switch (action.type) {
		case RECEIVE_PACKS:
			return action.data
				.filter(item => item.attributes.public && !item.attributes.owned)
				.map(item => item.id);
		case ADD:
			if (action.pack.public) {
				return [...state, action.pack.id];
			} else return state;
		case PACKS_SET:
			if (action.data && action.data.publicPacks) {
				return Array.from(new Set([...state, ...action.data.publicPacks]));
			} else return state;
		default:
			return state;
	}
}
function myPacks(state = [], action) {
	switch (action.type) {
		case RECEIVE_PACKS:
			return action.data
				.filter(item => item.attributes.owned && !item.attributes.universe_id)
				.map(item => item.id);
		case ADD:
			return [...state, action.pack.id];
		case PACKS_SET:
			if (action.data && action.data.myPacks) {
				return Array.from(new Set([...state, ...action.data.myPacks]));
			} else return state;
		default:
			return state;
	}
}
/**
 * An object mapping pack ids to an array of generator and table names
 */
function options(state = {}, action) {
	switch (action.type) {
		case ADD_CHILD_OPTIONS_RECEIVE:
			state[action.id] = { generators: action.generators, tables: action.tables };
			return state;
		default:
			return state;
	}
}

export default combineReducers({ loaded, byId, byUrl, publicPacks, myPacks, options });

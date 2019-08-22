import { ADD, FETCH_PACK, PACKS_SET, SET_PACK, REBUILD_PACK } from "./actions";
import { GENERATOR_SET, GENERATOR_RENAME, CLEAR_GENERATOR_ERRORS } from "../Generators/actions";

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

const pack = (state = { loaded: false, generators: {} }, action = {}) => {
	switch (action.type) {
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

function byId(state = {}, action) {
	let data;
	switch (action.type) {
		case GENERATOR_RENAME:
			return { ...state, [action.packid]: pack(state[action.packid], action) };
		case GENERATOR_SET:
			if (action.data.pack) {
				data = { ...action.data.pack, generators: action.data.builtpack.generators };
				return {
					...state,
					[data._id]: pack(state[data._id], { type: SET_PACK, id: data._id, data })
				};
			}
			return state;
		case FETCH_PACK:
		case REBUILD_PACK:
		case SET_PACK:
			return { ...state, [action.id]: pack(state[action.id], action) };
		case PACKS_SET:
			data = action.data.byId;
			const obj = { ...state, ...data };
			for (var packid in obj) {
				if (!data[packid]) continue;
				obj[packid] = pack(state[packid], { type: SET_PACK, data: data[packid] });
			}
			return obj;
		default:
			return state;
	}
}
function byUrl(state = {}, action) {
	switch (action.type) {
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
			const newByUrl = action.data && action.data.url ? { [action.data.url]: action.id } : {};
			return { ...state, ...newByUrl };
		default:
			return state;
	}
}
function loaded(state = false, action) {
	return action.loaded || false;
}

function publicPacks(state = [], action) {
	switch (action.type) {
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
export default combineReducers({ loaded, byId, byUrl, publicPacks, myPacks });

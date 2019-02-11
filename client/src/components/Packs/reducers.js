import { ADD, FETCH, FETCH_PACK, SET, SET_PACK, ERROR, REBUILD_PACK } from "./actions";

const initialPacks = {
	loaded: false,
	byId: {},
	byUrl: {},
	publicPacks: [],
	myPacks: []
};

const pack = (state = { loaded: false }, action) => {
	switch (action.type) {
		case REBUILD_PACK:
			return {
				...state,
				loaded: false,
				generators: { ...state.generators, loaded: false }
			};
		case SET_PACK:
			return { ...state, ...action.data, loaded: true };
		case FETCH_PACK:
		default:
			return state;
	}
};

function byUrl(state, action) {
	const newByUrl = action.data && action.data.url ? { [action.data.url]: action.id } : {};
	return { ...state, ...newByUrl };
}

export default (state = initialPacks, act) => {
	let action = act;

	switch (action.type) {
		case FETCH_PACK:
		case REBUILD_PACK:
		case SET_PACK:
			return {
				...state,
				byId: { ...state.byId, [action.id]: pack(state.byId[action.id], action) },
				byUrl: byUrl(state.byUrl, action)
			};
		case ADD:
			return { ...state, myPacks: state.myPacks.concat([action.pack]) };
		case SET:
			return { loaded: true, ...initialPacks, ...action.data };
		case ERROR:
			return { ...initialPacks, loaded: true, error: action.error };
		case FETCH:
		default:
			return state;
	}
};

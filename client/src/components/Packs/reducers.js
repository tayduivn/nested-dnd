import { ADD, FETCH, FETCH_PACK, SET, SET_PACK, ERROR } from "./actions";

const initialPacks = {
	loaded: false,
	map: {},
	publicPacks: [],
	myPacks: []
};

const pack = (state = { loaded: false }, action) => {
	switch (action.type) {
		case SET_PACK:
			return { ...action.data, loaded: true };
		case FETCH_PACK:
		default:
			return state;
	}
};

export default (state = initialPacks, action) => {
	switch (action.type) {
		case FETCH_PACK:
		case SET_PACK:
			return {
				...state,
				map: { ...state.map, [action.id]: pack(state.map[action.id], action) }
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

import { ADD, FETCH, FETCH_PACK, PACKS_SET, SET_PACK, ERROR, REBUILD_PACK } from "./actions";

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

function byId(state = {}, action) {
	switch (action.type) {
		case PACKS_SET:
			const obj = { ...state, ...action.data };
			for (var packid in obj) {
				if (!action.data[packid]) continue;
				obj[packid] = pack(state[packid], { type: SET_PACK, data: action.data[packid] });
			}
			return obj;
		default:
			return state;
	}
}

function byUrl(state = initialPacks, action) {
	const newByUrl = action.data && action.data.url ? { [action.data.url]: action.id } : {};
	return { ...state, ...newByUrl };
}

export default (state = initialPacks, action) => {
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
		case PACKS_SET:
			const packs = {
				...state,
				...action.data,
				byId: byId(state.byId, { ...action, data: action.data.byId })
			};
			return packs;
		case ERROR:
			return { ...initialPacks, loaded: true, error: action.error };
		case FETCH:
		default:
			return state;
	}
};

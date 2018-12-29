import { ADD, FETCH, SET, ERROR } from "./actions";

const initialPacks = {
	loaded: false,
	publicPacks: [],
	myPacks: []
};

export default (state = initialPacks, action) => {
	switch (action.type) {
		case ADD:
			return { ...state, myPacks: state.myPacks.concat([action.pack]) };
		case SET:
			return { loaded: true, ...action.packs };
		case ERROR:
			return { ...initialPacks, loaded: true, error: action.error };
		case FETCH:
		default:
			return state;
	}
};

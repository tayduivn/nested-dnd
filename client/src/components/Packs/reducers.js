import { ADD, FETCH, SET } from "./actions";

const initialPacks = {
	loading: true,
	publicPacks: [],
	myPacks: []
};

export default (state = initialPacks, action) => {
	switch (action.type) {
		case ADD:
			return { ...state, myPacks: state.myPacks.concat([action.pack]) };
		case SET:
			return action.packs;
		case FETCH:
		default:
			return state;
	}
};

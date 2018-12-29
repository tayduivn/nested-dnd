import { ADD, FETCH, SET, ERROR } from "./actions";

const initialData = {
	loaded: false,
	data: []
};

export default (state = initialData, action) => {
	switch (action.type) {
		case ADD:
			return { ...state, array: state.array.concat([action.created]) };
		case SET:
			return { loaded: true, array: action.data };
		case ERROR:
			return { ...initialData, loaded: true, error: action.error };
		case FETCH:
		default:
			return state;
	}
};

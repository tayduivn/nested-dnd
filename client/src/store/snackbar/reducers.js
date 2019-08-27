import { PUSH_SNACK, POP_SNACK, PUSH_SNACKS } from "./actions";

const INITIAL_STATE = {
	snacks: []
};

function snackbar(state = INITIAL_STATE, action) {
	let snacks;

	switch (action.type) {
		case PUSH_SNACK:
			return {
				snacks: [...state.snacks, action.snack]
			};
		case POP_SNACK:
			snacks = [...state.snacks];
			snacks.splice(action.index, 1);
			return { snacks };
		case PUSH_SNACKS:
			return {
				snacks: [...state.snacks, ...action.snacks]
			};
		default:
			return state;
	}
}

export default snackbar;

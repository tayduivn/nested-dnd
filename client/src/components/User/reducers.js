import { CHECK_IS_LOGGEDIN } from "./actions";

const initial = {
	error: false,
	loading: false,
	loggedIn: null
};

export default (state = initial, action) => {
	switch (action.type) {
		case CHECK_IS_LOGGEDIN:
			const r = { ...state, error: action.error, loading: action.loading };
			r.loggedIn = action.loggedIn;

			return r;
		default:
			return state;
	}
};

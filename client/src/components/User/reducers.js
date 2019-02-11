import { CHECK_IS_LOGGEDIN, SET_LOGGED_IN } from "./actions";

const initial = {
	error: false,
	loading: false,
	loggedIn: null,
	email: undefined,
	username: undefined
};

export default (state = initial, action) => {
	switch (action.type) {
		case CHECK_IS_LOGGEDIN:
			const r = { ...state, error: action.error, loading: action.loading };
			r.loggedIn = action.loggedIn;

			return r;
		case SET_LOGGED_IN:
			return { ...state, error: action.error, loggedIn: action.loggedIn, email: action.email };
		default:
			return state;
	}
};

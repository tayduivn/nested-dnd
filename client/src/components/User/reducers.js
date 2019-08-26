import cookie from "cookie";

import { CHECK_IS_LOGGEDIN, SET_LOGGED_IN } from "./actions";

export const checkLoggedIn = () => {
	const cookies = cookie.parse(document.cookie);
	return cookies["loggedin"] === "true";
};

const initial = {
	error: false,
	loading: false,
	loggedIn: checkLoggedIn(),
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
			return {
				...state,
				error: action.error,
				loggedIn: action.loggedIn,
				email: action.email
			};
		default:
			return state;
	}
};

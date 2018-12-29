import DB from "../../actions/CRUDAction";

export const ADD = "USER_ADD";
export const FETCH = "USER_FETCH";
export const SET = "USER_SET";
export const ERROR = "USER_ERROR";
export const CHECK_IS_LOGGEDIN = "USER_CHECK_IS_LOGGEDIN";

export const checkLoggedIn = (dispatch, loggedIn = null) => {
	const doLoad = loggedIn === null;

	if (doLoad) {
		DB.fetch("loggedIn").then(({ data, error }) => {
			if (error) setLoggedInError(error);
			else dispatch(setLoggedIn(!!data.loggedIn));
		});
	}
	return {
		type: CHECK_IS_LOGGEDIN,
		loading: doLoad,
		error: false
	};
};

const setLoggedInError = error => ({
	type: CHECK_IS_LOGGEDIN,
	error,
	loading: false
});

const setLoggedIn = loggedIn => ({
	type: CHECK_IS_LOGGEDIN,
	loading: false,
	error: false,
	loggedIn
});

export default {
	checkLoggedIn
};

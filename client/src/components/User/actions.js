import DB from "../../actions/CRUDAction";

export const ADD = "USER_ADD";
export const FETCH = "USER_FETCH";
export const SET = "USER_SET";
export const ERROR = "USER_ERROR";
export const CHECK_IS_LOGGEDIN = "USER_CHECK_IS_LOGGEDIN";
export const SET_LOGGED_IN = "SET_LOGGED_IN";

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

// TODO: error check
export const doLogin = (dispatch, url, { email, password, password2, isSignup }) => {
	// check passwords match
	if (isSignup && password !== password2) {
		return dispatch({
			type: SET_LOGGED_IN,
			error: {
				password2Error: "Passwords don't match",
				password2Valid: false
			},
			loggedIn: false
		});
	}

	return DB.create(url, { email, password }).then(({ data }) => {
		const loggedIn = data.loggedIn;
		const error = {
			passwordError: data.passwordError,
			emailError: data.emailError
		};
		dispatch({
			type: SET_LOGGED_IN,
			error: error,
			email: data.user && data.user.email,
			loggedIn
		});
	});
};

// TODO: error check
export const doLogout = dispatch => {
	return DB.fetch("logout", "POST").then(({ data, error }) => {
		const loggedIn = !!data.loggedIn;
		dispatch({
			type: SET_LOGGED_IN,
			error: error,
			loggedIn
		});
	});
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
	checkLoggedIn,
	doLogin
};

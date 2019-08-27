import DB from "util/DB";

import { pushSnack } from "store/snackbar/actions";

export const ADD = "USER_ADD";
export const FETCH = "USER_FETCH";
export const SET = "USER_SET";
export const ERROR = "USER_ERROR";
export const CHECK_IS_LOGGEDIN = "USER_CHECK_IS_LOGGEDIN";
export const SET_LOGGED_IN = "SET_LOGGED_IN";

// Note:
// do not import store because store imports this and it'll error

// TODO: error check
export const doLogin = (url, { email, password, password2, isSignup }) => {
	return dispatch => {
		// check passwords match
		if (isSignup && password !== password2) {
			dispatch({
				type: SET_LOGGED_IN,
				error: {
					password2Error: "Passwords don't match",
					password2Valid: false
				},
				loggedIn: false
			});
		}

		DB.create(`auth${url}`, { email, password }).then(json => {
			if (json.errors) {
				return dispatch({
					type: SET_LOGGED_IN,
					error: {
						apiError: json.errors[0]
					}
				});
			}

			const loggedIn = json.meta.loggedIn;
			// todo put in errors
			const err = {
				passwordError: json.data.passwordError,
				emailError: json.data.emailError
			};

			dispatch({
				type: SET_LOGGED_IN,
				error: err,
				email: json.data && json.data.attributes.email,
				id: json.data.id,
				loggedIn
			});
		});
	};
};

// TODO: error check
export const doLogout = () => {
	return dispatch => {
		DB.fetch("auth/logout", "POST").then(json => {
			if (json.errors) {
				dispatch(
					pushSnack({
						title: `There was an issue logging out: ${json.errors[0].title}`
					})
				);
			} else {
				dispatch({
					type: SET_LOGGED_IN,
					loggedIn: !!json.meta.loggedIn
				});
			}
		});
	};
};

export default {
	doLogin
};

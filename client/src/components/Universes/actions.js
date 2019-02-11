import DB from "../../actions/CRUDAction";

export const ADD = "UNIVERSES_ADD";
export const FETCH = "UNIVERSES_FETCH";
export const SET = "UNIVERSES_SET";
export const ERROR = "UNIVERSES_ERROR";

export const UNIVERSE_SET = "UNIVERSE_SET";

export const INSTANCE_SET = "INSTANCE_SET";
export const INSTANCE_DELETE = "INSTANCE_DELETE";
export const INSTANCE_ADD_CHILD = "INSTANCE_ADD_CHILD";

export const add = (dispatch, created) => {
	// todo set
	return { type: ADD, created };
};

export const fetch = (dispatch, loaded) => {
	if (!loaded) {
		DB.get("universes").then(({ error, data }) => {
			if (error) {
				dispatch(setError(error));
			} else {
				dispatch(set(data));
			}
		});
	}
	return { type: FETCH };
};

export const setError = error => ({ type: ERROR, error });

export const set = data => ({ type: SET, data });

export const universeSet = (id, data) => ({ type: UNIVERSE_SET, data: { _id: id, ...data } });

export default {
	fetch,
	setError,
	set
};

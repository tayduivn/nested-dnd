import DB from "../../actions/CRUDAction";

export const ADD = "UNIVERSES_ADD";
export const FETCH = "UNIVERSES_FETCH";
export const SET = "UNIVERSES_SET";
export const ERROR = "UNIVERSES_ERROR";

export const fetch = (dispatch, loaded) => {
	if (!loaded) {
		DB.get("universes").then(({ error, data }) => {
			if (error) dispatch(setError(error));
			else dispatch(set(data));
		});
	}
	return { type: FETCH };
};

export const setError = error => ({ type: ERROR, error });

export const set = data => ({ type: SET, data });

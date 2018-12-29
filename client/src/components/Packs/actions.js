import DB from "../../actions/CRUDAction";

export const ADD = "PACKS_ADD";
export const FETCH = "PACKS_FETCH";
export const FETCH_PACK = "PACKS_FETCH_PACK";
export const SET = "PACKS_SET";
export const SET_PACK = "PACKS_SET_PACK";
export const ERROR = "PACKS_ERROR";

export const add = pack => ({ type: ADD, pack });

export const fetch = (dispatch, loaded) => {
	if (!loaded) {
		DB.get("packs").then(({ error, data }) => {
			if (error) {
				dispatch(setError(error));
			} else {
				dispatch(set(data));
			}
		});
	}
	return { type: FETCH };
};

export const fetchPack = (dispatch, id, loaded) => {
	if (!loaded) {
		DB.get("packs", id).then(({ error, data }) => {
			if (error) {
				dispatch(setError(error));
			} else {
				dispatch(setPack(data));
			}
		});
	}
	return { type: FETCH_PACK, id };
};

const setError = error => ({ type: ERROR, error });

export const set = data => ({ type: SET, data });

export const setPack = pack => ({
	type: SET_PACK,
	pack,
	data: pack,
	id: pack._id
});

export default {
	add,
	fetch,
	fetchPack,
	set
};

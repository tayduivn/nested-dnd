import DB from "../../actions/CRUDAction";

export const ADD = "PACKS_ADD";
export const FETCH = "PACKS_FETCH";
export const FETCH_PACK = "PACKS_FETCH_PACK";
export const PACKS_SET = "PACKS_SET";
export const SET_PACK = "PACKS_SET_PACK";
export const ERROR = "PACKS_ERROR";
export const REBUILD_PACK = "PACK_REBUILD";

export const add = pack => ({ type: ADD, pack });

export const fetch = (dispatch, loaded) => {
	if (!loaded) {
		DB.get("packs").then(({ error, data }) => {
			if (error) {
				dispatch(setError(error));
			} else {
				dispatch(packsSet(data));
			}
		});
	}
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
	return {
		type: FETCH_PACK,
		id
	};
};

const setError = error => ({ type: ERROR, error });

export const packsSet = data => ({ type: PACKS_SET, data });

export const setPack = pack => ({
	type: SET_PACK,
	pack,
	data: pack,
	id: pack._id
});

export const fetchRebuild = (dispatch, id) => {
	DB.set("builtpacks", id + "/rebuild", {}).then(({ error, data }) => {
		if (error) dispatch(setError(error));
		else dispatch(setPack(data));
	});
	return {
		type: REBUILD_PACK,
		id: id
	};
};

export default {
	add,
	fetch,
	fetchPack,
	packsSet,
	fetchRebuild
};

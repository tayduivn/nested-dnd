import DB from "util/DB";
import { receiveTables } from "store/tables/actions";
import { receiveGenerators } from "store/generators/actions";
import { pushSnack } from "store/snackbar/actions";

// subfiles
export * from "./fetchAddChildOptions";

export const ADD = "PACKS_ADD";
export const FETCH = "PACKS_FETCH";

export const PACKS_SET = "PACKS_SET";
export const SET_PACK = "PACKS_SET_PACK";
export const ERROR = "PACKS_ERROR";
export const REBUILD_PACK = "PACK_REBUILD";

export const add = pack => ({ type: ADD, pack });

export const RECVD_PACKS = "RECVD_PACKS";
export const fetch = isLoaded => {
	return dispatch => {
		if (isLoaded) return Promise.resolve();
		DB.get("packs").then(json => {
			if (json.errors) {
				dispatch(setError(json.errors));
			} else {
				dispatch({ type: RECVD_PACKS, ...json });
			}
		});
	};
};

// Fetch just the pure pack info, no generators or tables
export const FETCH_PACK = "FETCH_PACK";
export const RECVD_PACK = "RECVD_PACK";
export const fetchPack = (dispatch, url, isLoaded) => {
	if (!isLoaded) {
		dispatch({
			type: FETCH_PACK,
			url: url
		});
		DB.get("packs", url).then(json => {
			if (json.errors) {
				dispatch(pushSnack(json.errors[0]));
			} else {
				dispatch({ type: RECVD_PACK, id: json.data.id, isLoaded: true, ...json });
			}
		});
	}
	return {
		type: FETCH_PACK,
		url
	};
};

export const fetchPackIfNeeded = id => {
	return (dispatch, getStore) => {
		if (!id) console.error("no id provided");
		const pack = getStore().packs.byId[id];

		if (!pack || (pack.partial && !pack.isFetching)) {
			fetchPack(dispatch, id, false);
		}
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
	DB.set(`builtpacks/${id}/rebuild`, "", {}).then(({ error, data }) => {
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

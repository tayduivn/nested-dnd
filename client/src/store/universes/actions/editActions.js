import DB from "util/DB";

import { packsSet, fetchPackIfNeeded } from "store/packs/actions";
import { receiveTables } from "store/tables/actions";
import { pushSnacks } from "store/snackbar/actions";

export const ADD = "UNIVERSES_ADD";
export const add = (dispatch, created) => {
	// todo set
	return { type: ADD, created };
};

export const RECEIVE_MY_UNIVERSES = "RECEIVE_MY_UNIVERSES";
export const fetch = isLoaded => {
	return dispatch => {
		if (isLoaded) return Promise.resolve();

		DB.get("universes").then(json => {
			if (json.errors) {
				dispatch(pushSnacks(json.errors));
			} else {
				dispatch({ type: RECEIVE_MY_UNIVERSES, ...json });
			}
		});
	};
};

// -------------------------------
export const FETCH_UNIVERSE_START = "FETCH_UNIVERSE_START";
export const FETCH_UNIVERSE_SUCCESS = "FETCH_UNIVERSE_SUCCESS";
export const FETCH_UNIVERSE_ERROR = "FETCH_UNIVERSE_ERROR";
function fetchComplete(dispatch, id, data, error) {
	if (error) dispatch({ type: FETCH_UNIVERSE_ERROR, error, lastUpdated: Date.now(), id });
	else {
		dispatch({
			type: FETCH_UNIVERSE_SUCCESS,
			data: data.universe,
			lastUpdated: Date.now(),
			id
		});
		if (data.packs) dispatch(packsSet(data.packs));
		// TODO: Check if this is necessary or works
		// if (data.generators) dispatch(receiveGenerators(data.generators));
		if (data.tables) dispatch(receiveTables(data.tables));
	}
}
export const fetchUniverse = id => {
	return (dispatch, getState) => {
		const universe = getState().universes.byId[id];
		if (universe) {
			dispatch(fetchPackIfNeeded(universe.pack));
			return Promise.resolve();
		}
		dispatch({ type: FETCH_UNIVERSE_START, id });

		DB.get("universes", id).then(({ data, error }) => {
			fetchComplete(dispatch, id, data, error);
		});
	};
};

// -------------------------------
export const ERROR = "UNIVERSES_ERROR";
export const setError = error => ({ type: ERROR, error });

// -------------------------------
export const UNIVERSES_SET = "UNIVERSES_SET";
export const universesSet = data => ({ type: UNIVERSES_SET, data });

// -------------------------------
export const UNIVERSE_SET = "UNIVERSE_SET";
export const universeSet = (id, data) => ({ type: UNIVERSE_SET, data: { _id: id, ...data } });

export const CREATE_UNIVERSE_PACK = "CREATE_UNIVERSE_PACK";
export const createUniversePack = id => {
	return dispatch => {
		dispatch({ type: FETCH_UNIVERSE_START, id });

		DB.fetch(`universes/${id}/pack`, "POST").then(({ data, error }) => {
			fetchComplete(dispatch, id, data, error);
		});
	};
};

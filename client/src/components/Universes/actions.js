import DB from "../../actions/CRUDAction";

import { packsSet, fetchPackIfNeeded } from "../Packs/actions";
import { receiveGenerators } from "../Generators/actions";
import { receiveTables } from "../Tables/redux/actions";

export const INSTANCE_SET = "INSTANCE_SET";
export const INSTANCE_DELETE = "INSTANCE_DELETE";
export const INSTANCE_ADD_CHILD = "INSTANCE_ADD_CHILD";

export const ADD = "UNIVERSES_ADD";
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
				dispatch(universesSet(data.universes));
				dispatch(packsSet(data.packs));
			}
		});
	}
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
		if (data.generators) dispatch(receiveGenerators(data.generators));
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

		DB.fetch(`universes/${id}/pack/create`, "POST").then(({ data, error }) => {
			fetchComplete(dispatch, id, data, error);
		});
	};
};

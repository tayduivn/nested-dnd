import { combineReducers } from "redux";
import { spread } from "../../util";

import {
	ADD,
	FETCH_UNIVERSE_START,
	FETCH_UNIVERSE_ERROR,
	FETCH_UNIVERSE_SUCCESS,
	UNIVERSES_SET,
	ERROR,
	UNIVERSE_SET,
	INSTANCE_SET,
	INSTANCE_ADD_CHILD,
	INSTANCE_DELETE
} from "./actions";

const myUniversesInitial = {
	loaded: false,
	array: []
};

function instance(state = {}, action) {
	switch (action.type) {
		case INSTANCE_ADD_CHILD:
			return { ...state, in: [...(state.in || []), "LOADING"] };
		case INSTANCE_SET:
			// deleted
			if (!action.data) return null;
			return spread(state, action.data);
		default:
			return state;
	}
}

const DEFAULT_UNIVERSE = {
	isFetching: false,
	lastUpdated: undefined,
	apiError: false
};

// todo handle update other
function universe(state = DEFAULT_UNIVERSE, action) {
	const array = state.array instanceof Array ? [...state.array] : [];

	switch (action.type) {
		case FETCH_UNIVERSE_START:
			return { isFetching: true };
		case FETCH_UNIVERSE_SUCCESS:
			return {
				isFetching: false,
				apiError: false,
				lastUpdated: action.lastUpdated,
				...action.data
			};
		case FETCH_UNIVERSE_ERROR:
			return {
				...state,
				isFetching: false,
				lastUpdated: action.lastUpdated,
				apiError: action.error
			};
		case INSTANCE_DELETE:
			const toDelete = array[action.index];

			if (toDelete.up !== undefined) {
				const inArr = [...array[toDelete.up].in];
				inArr.splice(inArr.indexOf(action.index), 1);
				array[toDelete.up].in = inArr;
			}
			delete array[action.index];
			return spread(state, { array });
		case INSTANCE_ADD_CHILD:
			array[action.index] = instance(array[action.index], action);
			return spread(state, { array });
		case INSTANCE_SET:
			let index;
			for (index in action.data) {
				array[index] = instance(array[index], { ...action, data: action.data[index] });
			}
			return spread(state, { array });
		case UNIVERSE_SET:
			return spread(state, action.data);
		default:
			return state;
	}
}

function normalize(state = {}, action) {
	const u = action.data || { array: [] };

	switch (action.type) {
		case UNIVERSES_SET:
			return spread(state, u);
		default:
			return state;
	}
}

function byId(state = {}, action) {
	const copy = { ...state };

	switch (action.type) {
		case FETCH_UNIVERSE_ERROR:
		case FETCH_UNIVERSE_START:
		case FETCH_UNIVERSE_SUCCESS:
			return { ...state, [action.id]: universe(state[action.id], action) };
		case INSTANCE_DELETE:
		case INSTANCE_ADD_CHILD:
		case INSTANCE_SET:
			return spread(state, { [action.universeId]: universe(copy[action.universeId], action) });
		case UNIVERSE_SET:
			return spread(state, { [action.data._id]: universe(copy[action.data._id], action) });
		case UNIVERSES_SET:
			let id;
			for (id in action.data) {
				const u = action.data[id];
				copy[u._id] = normalize(copy[u._id], { ...action, data: u });
			}
			return copy;
		default:
			return state;
	}
}

function myUniverses(state = myUniversesInitial, action) {
	switch (action.type) {
		case ADD:
			return spread(state, { array: state.array.concat([action.created]) });
		case UNIVERSES_SET:
			return { loaded: true, array: Object.values(action.data).map(u => u._id) };
		case ERROR:
			return spread(myUniversesInitial, { loaded: true, error: action.error });
		default:
			return state;
	}
}

export default combineReducers({
	byId,
	myUniverses
});

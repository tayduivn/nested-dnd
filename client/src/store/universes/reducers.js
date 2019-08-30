/* eslint-disable complexity */
import { combineReducers } from "redux";
import spread from "util/spread";
import merge, { mergeConcat } from "util/merge";

import { RECEIVE_EXPLORE, LOAD_EXPLORE } from "store/universes";
import {
	FETCH_UNIVERSE_START,
	FETCH_UNIVERSE_ERROR,
	FETCH_UNIVERSE_SUCCESS,
	UNIVERSES_SET,
	UNIVERSE_SET,
	INSTANCE_SAVE_REQUEST,
	INSTANCE_CHANGE_RECEIVE,
	INSTANCE_MOVE_RECEIVE,
	INSTANCE_ADD_CHILD_REQUEST,
	INSTANCE_DELETE,
	RECEIVE_MY_UNIVERSES,
	INSTANCE_ADD_CHILD_RECEIVE,
	INSTANCE_DELETE_ERROR
} from "./actions";

const DEFAULT_UNIVERSE = {
	isFetching: false,
	lastUpdated: undefined,
	apiError: false,
	array: {}
};

// todo handle update other
// eslint-disable-next-line
function universe(state = DEFAULT_UNIVERSE, action) {
	const array = state.array ? { ...state.array } : {};

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
		case INSTANCE_ADD_CHILD_RECEIVE:
			if (action.data) {
				array[action.data.attributes.n] = action.data.id;
				return { ...state, array };
			} else return state;
		case INSTANCE_DELETE_ERROR:
			// add back into the universe
			array[action.data.n] = action.instance_id;
			return { ...state, array };
		case INSTANCE_DELETE:
			// remove from the array in the universe
			const ids = Object.values(state.array);
			action.data.forEach(id => {
				const foundIndex = ids.indexOf(id);
				if (foundIndex !== -1) {
					delete array[Object.keys(array)[foundIndex]];
				}
			});
			return { ...state, array };
		case UNIVERSE_SET:
			return spread(state, action.data);
		default:
			return state;
	}
}

function normalize(state = {}, action) {
	const u = action.data || { array: {} };

	switch (action.type) {
		case UNIVERSES_SET:
			return spread(state, u);
		default:
			return state;
	}
}

// eslint-disable-next-line
function byId(state = {}, action) {
	const copy = { ...state };
	let newState;

	switch (action.type) {
		case LOAD_EXPLORE:
			if (action.params.type === "universe") {
				if (!copy[action.params.identifier]) {
					copy[action.params.identifier] = { ...DEFAULT_UNIVERSE, isFetching: true };
				} else {
					copy[action.params.identifier].isFetching = true;
				}
			}
			return state;
		case RECEIVE_EXPLORE:
		case RECEIVE_MY_UNIVERSES:
			newState = copy;

			// data
			if (action.data instanceof Array) {
				action.data.forEach(item => {
					if (item.type === "Universe")
						newState[item.id] = { ...DEFAULT_UNIVERSE, ...item.attributes };
				});
			} else {
				if (action.data.type === "Universe")
					newState[action.data.id] = { ...DEFAULT_UNIVERSE, ...action.data.attributes };
				if (action.data.type === "Instance") {
					const universe_id = action.data.attributes.univ;
					if (!newState[universe_id]) newState[universe_id] = DEFAULT_UNIVERSE;
					newState[universe_id].array[action.data.attributes.n] = action.data.id;
				}
			}

			// included
			action.included.forEach(item => {
				if (item.type === "Instance") {
					const inst = item.attributes;
					newState[inst.univ].array[inst.n] = item.id;
				} else if (item.type === "Universe") {
					newState[item.id] = { ...DEFAULT_UNIVERSE, ...item.attributes };
				}
			});
			return newState;
		case INSTANCE_DELETE_ERROR:
		case INSTANCE_DELETE:
		case INSTANCE_ADD_CHILD_RECEIVE:
			if (action.data)
				return { ...state, [action.universe_id]: universe(state[action.universe_id], action) };
			else return state;
		case FETCH_UNIVERSE_ERROR:
		case FETCH_UNIVERSE_START:
		case FETCH_UNIVERSE_SUCCESS:
			return { ...state, [action.id]: universe(state[action.id], action) };
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

const DEFAULT_MY_UNIVERSES = {
	loaded: false,
	array: []
};

function myUniverses(state = DEFAULT_MY_UNIVERSES, action) {
	switch (action.type) {
		case RECEIVE_MY_UNIVERSES:
			return {
				loaded: true,
				array: action.data.map(item => item.id)
			};
		default:
			return state;
	}
}

function instance(state = {}, action) {
	switch (action.type) {
		case LOAD_EXPLORE:
			return { ...state, isFetching: true };
		case INSTANCE_MOVE_RECEIVE:
			// the data is filtered by the instances() method
			return { ...state, ...action.data, saving: false };
		case INSTANCE_CHANGE_RECEIVE:
			return { ...state, saving: false };
		case INSTANCE_SAVE_REQUEST:
			// deleted
			if (!action.data) return null;
			// merge deeply together the changes
			return merge(state, action.data, { saving: true });
		default:
			return state;
	}
}

// not stored .byId, just in the root state.
function instances(state = {}, action) {
	let newState;
	switch (action.type) {
		case INSTANCE_DELETE_ERROR:
			newState = { ...state };
			// add back
			newState[action.instance_id] = action.data;
			// add back to parent
			const parent = newState[action.data.up];
			newState[action.data.up] = {
				...parent,
				in: [...parent.in, action.instance_id]
			};
			return newState;
		case INSTANCE_DELETE:
			newState = { ...state };
			action.data.forEach(id => {
				// delete me
				const oldInst = newState[id];
				if (!oldInst) return; // already deleted

				// delete from parent
				const oldParent = newState[oldInst.up];
				if (!oldParent) return;
				newState[oldInst.up] = {
					...oldParent,
					in: oldParent.in.filter(child => child !== id)
				};

				// delete me - must be after parent
				delete newState[id];
			});
			return newState;
		// we've just added a new instance
		case INSTANCE_ADD_CHILD_RECEIVE:
			// didn't get added, chance nothing
			if (!action.data) return state;
			newState = { ...state };
			newState[action.data.id] = action.data.attributes;
			const up_id = action.data.attributes.up;
			action.included.forEach(item => {
				if (item.type !== "Instance") return;

				// save the parent's .in attribute, but that's it.
				// only do this if we have the parent already
				if (item.id === up_id && newState[item.id]) {
					newState[item.id].in = item.attributes.in;
				} else newState[item.id] = item.attributes;
			});
			return newState;
		// pass on through
		case LOAD_EXPLORE:
		case INSTANCE_CHANGE_RECEIVE:
		case INSTANCE_SAVE_REQUEST:
			if (!action.instance_id) return state;
			else return { ...state, [action.instance_id]: instance(state[action.instance_id], action) };
		case INSTANCE_MOVE_RECEIVE:
			newState = { ...state };
			// set parent and oldParent in
			action.included.forEach(item => {
				newState[item.id] = instance(state[item.id], {
					type: INSTANCE_MOVE_RECEIVE,
					data: { in: item.attributes.in }
				});
			});
			// set new up
			newState[action.instance_id] = instance(state[action.instance_id], {
				type: INSTANCE_MOVE_RECEIVE,
				data: { up: action.data.up }
			});
			return newState;
		case RECEIVE_EXPLORE:
		case RECEIVE_MY_UNIVERSES:
			newState = { ...state };
			if (action.data.type === "Instance") {
				// we don't care about overridin local changes becaues this is the thing we just
				// navigated to
				newState[action.data.id] = { ...action.data.attributes, isFetching: false };
			}
			action.included.forEach(inst => {
				if (inst.type === "Instance") {
					const oldState = newState[inst.id];
					// only add it if it's new, so we don't override local changes
					if (!oldState || oldState.isFetching || oldState.todo) {
						newState[inst.id] = inst.attributes;
					}
				}
			});
			return newState;
		default:
			return state;
	}
}

const tempChildrenInitial = {};
function tempChildren(state = tempChildrenInitial, { type, data, universe_id, instance_id }) {
	console.log(type);

	switch (type) {
		case INSTANCE_ADD_CHILD_RECEIVE:
			// remove one! we got em boys
			const arr = [...state[universe_id][instance_id]];
			arr.shift();
			return {
				...state,
				[universe_id]: {
					...state[universe_id],
					[instance_id]: arr
				}
			};
		case INSTANCE_ADD_CHILD_REQUEST:
			const newData = { [universe_id]: { [instance_id]: [data] } };
			const newState = mergeConcat(state, newData);
			return newState;
		default:
			return state;
	}
}

export default combineReducers({
	byId,
	myUniverses,
	instances,
	tempChildren
});

import { combineReducers } from "redux";

import {
	ADD,
	FETCH,
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
			return { ...state, in: [...state.in, "LOADING"] };
		case INSTANCE_SET:
			return { ...state, ...action.data };
		default:
			return state;
	}
}

// todo handle update other
function universe(state = {}, action) {
	const array = state.array ? [...state.array] : [];

	switch (action.type) {
		case INSTANCE_DELETE:
			const toDelete = array[action.index];

			if (toDelete.up) {
				const inArr = [...array[toDelete.up].in];
				inArr.splice(inArr.indexOf(action.index), 1);
				array[toDelete.up].in = inArr;
			}
			delete array[action.index];
			return { ...state, array };
		case INSTANCE_ADD_CHILD:
			array[action.index] = instance(array[action.index], action);
			return { ...state, array };
		case INSTANCE_SET:
			for (let index in action.data) {
				array[index] = instance(array[index], { ...action, data: action.data[index] });
			}
			return { ...state, array };
		case UNIVERSE_SET:
			return { ...state, ...action.data };
		default:
			return state;
	}
}

function normalize(state = {}, action) {
	const u = action.data || { array: [] };
	const lastSaw = u.lastSaw;
	const array = (state.array && [...state.array]) || [];
	switch (action.type) {
		case UNIVERSES_SET:
			if (lastSaw.up && lastSaw.up.length) {
				lastSaw.up.forEach(i => (array[i.index] = i));
				lastSaw.up = lastSaw.up[0].index;
			}
			if (lastSaw.in && lastSaw.in.length) {
				// filter out null children
				lastSaw.in = lastSaw.in.filter(child => child);
				lastSaw.in.forEach(i => (array[i.index] = { ...i, up: lastSaw.index }));
				lastSaw.in = lastSaw.in.map(c => c.index);
			}
			array[lastSaw.index] = lastSaw;
			return { ...state, ...u, array: array, lastSaw: lastSaw.index };
		default:
			return state;
	}
}

function byId(state = {}, action) {
	const copy = { ...state };

	switch (action.type) {
		case INSTANCE_DELETE:
		case INSTANCE_ADD_CHILD:
		case INSTANCE_SET:
			copy[action.universeId] = universe(copy[action.universeId], action);
			return copy;
		case UNIVERSE_SET:
			copy[action.data._id] = universe(copy[action.data._id], action);
			return copy;
		case UNIVERSES_SET:
			for (let id in action.data) {
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
			return { ...state, array: state.array.concat([action.created]) };
		case UNIVERSES_SET:
			return { loaded: true, array: Object.values(action.data).map(u => u._id) };
		case ERROR:
			return { ...myUniversesInitial, loaded: true, error: action.error };
		case FETCH:
		default:
			return state;
	}
}

export default combineReducers({
	byId: byId,
	myUniverses: myUniverses
});

const selectMyUniverses = ({ universes, packs }) => ({
	...universes.myUniverses,
	array: universes.myUniverses.array.map(_id => {
		const u = universes.byId[_id];
		if (!u) return { _id };
		const lastSaw = (u.array && u.array[u.lastSaw]) || u.array[0];
		const pack = packs.byId[u.pack] || {};
		return { ...u, font: pack.font, lastSaw: lastSaw.name || lastSaw.isa };
	})
});

export function getFavorites({ favorites = [], array = [] } = {}) {
	return favorites
		.filter(index => array[index])
		.map(index => ({ index, name: array[index].name || array[index].isa }));
}

export { selectMyUniverses };

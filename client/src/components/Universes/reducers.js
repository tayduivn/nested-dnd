import { combineReducers } from "redux";
import { produce } from "immer";

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

const spread = produce(Object.assign);

const myUniversesInitial = {
	loaded: false,
	array: []
};

function instance(state = {}, action) {
	switch (action.type) {
		case "REMOVE CHILD":
			return;
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

function deleteInstance(array, index) {
	const toDelete = array[index];
	const parent = array[toDelete.up];

	if (toDelete.up !== undefined) {
		const inArr = parent.in;
		inArr.splice(inArr.indexOf(index), 1);
		array[toDelete.up].in = inArr;
	}
	array[index] = undefined;
}

const array = produce((array, action) => {
	switch (action.type) {
		case INSTANCE_DELETE:
			return deleteInstance(array, action.index);
	}
}, []);

// todo handle update other
const universe = produce(
	(d, action) => {
		switch (action.type) {
			case INSTANCE_DELETE:
				return deleteInstance(d.array, action.index);
			case INSTANCE_ADD_CHILD:
				return (d.array[action.index] = instance(d.array[action.index], action));
			case INSTANCE_SET:
				for (let index in action.data) {
					d.array[index] = instance(d.array[index], {
						...action,
						data: action.data[index]
					});
				}
				break;
			case UNIVERSE_SET:
				const origArray = d.array || [];
				if (action.data.array) {
					d.array = action.data.array.map((data, i) => {
						const result = instance(origArray[i], { type: INSTANCE_SET, data });
						return result;
					});
				}
				console.log(d);
				break;
			default:
		}
	},
	{ array: [] }
);

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

const byId = produce((copy, action) => {
	switch (action.type) {
		case INSTANCE_DELETE:
		case INSTANCE_ADD_CHILD:
		case INSTANCE_SET:
			copy[action.universeId] = universe(copy[action.universeId], action);
			return;
		case UNIVERSE_SET:
			copy[action.data._id] = universe(copy[action.data._id], action);
			return;
		case UNIVERSES_SET:
			for (let id in action.data) {
				const u = action.data[id];
				copy[u._id] = normalize(copy[u._id], { ...action, data: u });
			}
			return;
		default:
	}
}, {});

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
	byId,
	myUniverses
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

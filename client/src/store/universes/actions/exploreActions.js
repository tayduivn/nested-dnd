import { push } from "connected-react-router";

import DB from "util/DB";
import {
	getUniverse,
	universeSet,
	UNIVERSE_SET,
	INSTANCE_SET,
	INSTANCE_ADD_CHILD,
	INSTANCE_DELETE
} from "store/universes";
import { pushSnack } from "store/snackbar";
import queue from "../util/saver";
import handleChangeClean from "../util/handleChangeClean";

export const setLastSaw = (index, universeId) => {
	queue(index, "lastSaw", universeId, { lastSaw: index });
	return universeSet(universeId, { lastSaw: index });
};

function dispatchChanges(results, universeId, dispatch, state) {
	results.forEach(({ array = {} } = {}) => {
		// save any affected instances other than the one I'm on.
		// I don't want to save the one I'm on because it may mess with my current changes.
		const current = parseInt(state.router.location.hash.substr(1));
		const changed = { ...array };
		delete changed[current];

		if (Object.keys(changed).length) {
			dispatch({ type: INSTANCE_SET, data: changed, universeId });
		}
	});
}

export const setFavorite = (i, isFavorite, universe) => {
	return (dispatch, getState) => {
		const favorites = [...universe.favorites];
		const position = favorites.indexOf(i);
		if (isFavorite) {
			if (position === -1) favorites.push(i);
		} else {
			if (position !== -1) favorites.splice(position, 1);
		}

		// save to DB
		changeInstance(i, "isFavorite", isFavorite, universe._id, dispatch);

		dispatch({
			type: UNIVERSE_SET,
			data: {
				_id: universe._id,
				favorites
			}
		});
	};
};

const changeUp = (instanceId, newUp, state) => {
	const changes = {};
	const instance = state.universes.instances[instanceId];

	// remove from old parent
	const oldUp = instance.up;
	const oldParent = state.universes.instances[oldUp];
	changes[oldUp] = { in: oldParent.in.filter(id => id !== instanceId) };

	// add to new parent
	const newParent = state.universes.instance[newUp] || {};
	changes[newUp] = { in: [...(newParent.in || []), instanceId] };

	return changes;
};

export const changeInstance = (universeId, instanceId, p, v) => {
	return (dispatch, getState) => {
		const { property, value } = handleChangeClean(p, v);

		let data = {
			[instanceId]: { [property]: value }
		};

		if (property === "up") {
			let state = getState();
			data = { ...data, ...changeUp(instanceId, value, state) };
		}

		if (property === "cls") {
			// reset to parent value if reset
			data[instanceId].txt = null;
		}

		// show the changes locally first
		dispatch({
			type: INSTANCE_SET,
			data
		});

		queue.push({ universeId, data }, (results = []) => console.log(results));
	};
};

const checkAlreadyInArr = (oldIn, index) => {
	if (oldIn.includes(index)) {
		oldIn.splice(oldIn.indexOf(index), 1);
		// check it again in case there are duplicates
		checkAlreadyInArr(oldIn, index);
	}
};

const addLink = (universe, index, child, dispatch) => {
	const oldIn = [...(universe.array[index].in || [])];

	// move to the end if it's already in the array
	checkAlreadyInArr(oldIn, child.index);

	return changeInstance(index, "in", [...oldIn, child.index], universe._id, dispatch);
};

export const addChild = (universeId, index, child) => {
	return dispatch => {
		const universe = getUniverse(universeId);

		// add link
		if (child.index !== undefined) {
			child.index = parseInt(child.index);
			if (child.index !== index && universe.array[child.index])
				return addLink(universe, index, child);

			// doesn't exist, set it as the name
			child.name = "" + child.index;
			delete child.index;
		}

		DB.create(`/universes/${universeId}/explore/${index}`, child).then(({ error, data = {} }) => {
			if (error) return;
			dispatch({ type: INSTANCE_SET, data: data.instances, universeId });
		});
		return { type: INSTANCE_ADD_CHILD, index, data: child, universeId };
	};
};

// ------------------------------------
export const LOAD_EXPLORE = "LOAD_EXPLORE";
export const RECEIVE_EXPLORE = "RECEIVE_EXPLORE";
const loadCurrent = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { isLoaded, index, type, identifier } = getUniverse(state);

		if (!isLoaded) {
			// we're going to load, inform the world
			dispatch({
				type: LOAD_EXPLORE,
				params: { type, identifier }
			});

			let url = `/explore/${type}/${identifier}`;

			// don't send me back the whole universe, just the current instance
			if (index !== false) url += `/${index}`;

			const json = await DB.fetch(url);
			if (json.errors) {
				json.errors.forEach(err =>
					dispatch(pushSnack(`There was a problem retrieving this universe: ` + err))
				);
			} else {
				dispatch({
					type: RECEIVE_EXPLORE,
					...json
				});
				let newIndex = json.data.attributes.n;

				// then, dispatch an action to change the url if needed
				if (index === false || index !== json.data.attributes.n) {
					dispatch(push(`/explore/${type}/${identifier}#${newIndex}`));
				}
			}
		}
	};
};

export const deleteInstance = (index, universeId, dispatch) => {
	queue(
		index,
		"delete",
		universeId,
		{
			index,
			universe: universeId,
			property: "delete",
			value: true
		},
		(results = []) => dispatchChanges(results, universeId)
	);
	return {
		type: INSTANCE_DELETE,
		index,
		universeId
	};
};

export { loadCurrent };

import { push } from "connected-react-router";

import DB from "util/DB";
import { getUniverse, universeSet } from "store/universes";
import { pushSnack } from "store/snackbar";
import queue from "../util/saver";
import { selectAncestorsAndStyle } from "../selectors";

export const setLastSaw = (index, universe_id) => {
	queue.push(index, "lastSaw", universe_id, { lastSaw: index });
	return universeSet(universe_id, { lastSaw: index });
};

// ------------------------------------
export const INSTANCE_SAVE_REQUEST = "INSTANCE_SAVE_REQUEST";
export const changeInstance = (universe_id, instance_id, changes) => {
	return (dispatch, getState) => {
		let state = getState();
		let oldInstance = state.universes.instances[instance_id];

		// special cases that involve changing multiple properties or instances
		// should have changes reflected on frontend before the result gets back
		if (changes.cls) {
			// reset to parent value if reset
			changes.txt = null;
		}
		// if we set txt, it has to have a class
		if (changes.txt && !oldInstance.cls) {
			const { cls } = selectAncestorsAndStyle(instance_id, state.universes.instances);
			// reset to parent value if reset
			changes.cls = cls;
		}

		// the data we will push to the redux state
		const data = { ...changes };
		if (data.up) {
			// attempt to set up if we have that id stored, otherwise clear
			const universe = state.universes[universe_id];
			data.up = (universe && universe.array[data.up]) || null;
		}

		// show the changes locally first
		dispatch({
			type: INSTANCE_SAVE_REQUEST,
			data: changes,
			universe_id,
			instance_id
		});

		queue.push({ universe_id, instance_id, changes });
	};
};

// ------------------------------------
// Triggered by queue after a changeInstance
export const INSTANCE_MOVE_RECEIVE = "INSTANCE_MOVE_RECEIVE";
export const INSTANCE_CHANGE_RECEIVE = "INSTANCE_CHANGE_RECEIVE";
export const changeInstanceReceived = (universe_id, originalTask, json) => {
	return dispatch => {
		if (json.errors) {
			json.errors.forEach(err => dispatch(pushSnack(err)));
			console.error("Error completing task. Original, Result: ", originalTask, json);
			return;
		}

		if (!json.data || json.data.type !== "Instance" || !json.data.id) {
			//this task didn't result in anything, or did something unexpected, so do nothing
			return;
		}

		if (json.meta.action === "CHANGE") {
			dispatch({
				type: INSTANCE_CHANGE_RECEIVE,
				universe_id,
				instance_id: json.data.id,
				data: json.data.attributes
			});
			return;
		}

		if (json.meta.action === "MOVE") {
			dispatch({
				type: INSTANCE_MOVE_RECEIVE,
				universe_id,
				instance_id: json.data.id,
				included: json.included,
				data: json.data.attributes
			});
			return;
		}
	};
};

// const checkAlreadyInArr = (oldIn, index) => {
// 	if (oldIn.includes(index)) {
// 		oldIn.splice(oldIn.indexOf(index), 1);
// 		// check it again in case there are duplicates
// 		checkAlreadyInArr(oldIn, index);
// 	}
// };

// const addLink = (universe, universe_id, instance_id, index, child, dispatch) => {
// 	const oldIn = [...(universe.array[index].in || [])];

// 	// move to the end if it's already in the array
// 	checkAlreadyInArr(oldIn, child.index);

// 	return dispatch(changeInstance(universe_id, instance_id, [...oldIn, child.index]));
// };

// ------------------------------------
export const LOAD_EXPLORE = "LOAD_EXPLORE";
export const RECEIVE_EXPLORE = "RECEIVE_EXPLORE";
const loadCurrent = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { isLoaded, index, type, identifier, instance_id } = getUniverse(state);

		if (!isLoaded) {
			// we're going to load, inform the world
			dispatch({
				type: LOAD_EXPLORE,
				params: { type, identifier },
				instance_id
			});

			let url = `/explore/${type}/${identifier}`;

			// don't send me back the whole universe, just the current instance
			if (index !== false) url += `/${index}`;

			const json = await DB.fetch(url);
			if (json.errors) {
				json.errors.forEach(err =>
					dispatch(pushSnack(`There was a problem retrieving this universe: ` + err.title))
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

// ------------------------------------
export const INSTANCE_ADD_CHILD_REQUEST = "INSTANCE_ADD_CHILD_REQUEST";
export const INSTANCE_ADD_CHILD_RECEIVE = "INSTANCE_ADD_CHILD_RECEIVE";
export const addChild = (universe_id, instance_id, child) => {
	return dispatch => {
		dispatch({
			type: INSTANCE_ADD_CHILD_REQUEST,
			universe_id,
			instance_id,
			data: child
		});

		DB.create(`/universes/${universe_id}/instances/${instance_id}`, child).then(json => {
			if (json.errors) {
				json.errors.forEach(err =>
					dispatch(pushSnack(`There was a problem retrieving this universe: ` + err.title))
				);
			}
			if (json.data) {
				dispatch({
					type: INSTANCE_ADD_CHILD_RECEIVE,
					data: json.data,
					included: json.included,
					universe_id,
					instance_id
				});
			} else {
				if (!json.errors) {
					dispatch(pushSnack(`There was a problem retrieving this universe: ${universe_id}`));
				}
				// we need to dispatch this so we can stop showing the spinner
				dispatch({
					type: INSTANCE_ADD_CHILD_RECEIVE,
					universe_id,
					instance_id
				});
			}
		});
	};
};

// ------------------------------------
export const INSTANCE_DELETE = "INSTANCE_DELETE";
export const INSTANCE_DELETE_ERROR = "INSTANCE_DELETE_ERROR";
export const deleteInstance = (universe_id, instance_id) => {
	return async (dispatch, getState) => {
		const state = getState();

		// make a copy in case it couldn't delete
		const oldInstance = { ...state.universes.instances[instance_id] };
		const oldParent = state.universes.instances[oldInstance.up];

		DB.delete(`/universes/${universe_id}/instances`, instance_id).then(json => {
			if (json.meta) {
				dispatch({
					type: INSTANCE_DELETE,
					universe_id,
					data: json.meta.ids
				});
			} else {
				dispatch(pushSnack(`There was a problem deleting instance ${instance_id}`));
				dispatch({
					type: INSTANCE_DELETE_ERROR,
					instance_id,
					universe_id,
					data: oldInstance
				});
			}
		});

		// must dispatch AFTER we send!
		dispatch(push(`/explore/universe/${universe_id}#${oldParent.n}`));
		dispatch({
			type: INSTANCE_DELETE,
			universe_id,
			data: [instance_id]
		});
	};
};

export { loadCurrent };

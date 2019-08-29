import DB from "util/DB";

import { pushSnacks } from "store/snackbar";

export const ADD_CHILD_OPTIONS_FETCH = "ADD_CHILD_OPTIONS_FETCH";
export const ADD_CHILD_OPTIONS_RECEIVE = "ADD_CHILD_OPTIONS_RECEIVE";

/**
 * @param {string} url the pack url
 */
export function fetchAddChildOptions(url) {
	return async (dispatch, getState) => {
		// TODO check if need, dispatch if starting

		const state = getState();
		const packId = state.packs.byUrl[url];
		const pack = state.packs.byId[packId];

		// exit if we're good
		if (pack && pack.generators && pack.tables) return;

		dispatch({
			type: ADD_CHILD_OPTIONS_FETCH,
			url,
			id: packId
		});

		const json = await DB.fetch(`packs/${url}/options`);
		if (json.errors) {
			pushSnacks(json.errors);
		} else {
			dispatch({
				type: ADD_CHILD_OPTIONS_RECEIVE,
				id: json.data.id,
				data: json.data.attributes,
				generators: json.related.generators,
				tables: json.related.tables,
				included: json.included
			});
		}
	};
}

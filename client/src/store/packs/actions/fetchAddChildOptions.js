import DB from "util/DB";

import { pushSnacks } from "store/snackbar";

export const FETCH_CHILD_OPTIONS = "FETCH_CHILD_OPTIONS";
export const RECEIVE_CHILD_OPTIONS = "RECEIVE_CHILD_OPTIONS";

/**
 * @param {string} url the pack url
 */
export function fetchAddChildOptions(url) {
	return async (dispatch, getState) => {
		// TODO check if need, dispatch if starting

		const state = getState();
		const pack_id = state.packs.byUrl[url];
		const pack = state.packs.byId[pack_id];

		// exit if we're good
		if (pack && pack.generators && pack.tables) return;

		dispatch({
			type: FETCH_CHILD_OPTIONS,
			url,
			id: pack_id
		});

		const json = await DB.fetch(`packs/${url}/options`);
		if (json.errors) {
			pushSnacks(json.errors);
		} else if (json.data) {
			dispatch({
				type: RECEIVE_CHILD_OPTIONS,
				id: json.data.id,
				data: json.data.attributes,
				generators: json.related.generators,
				tables: json.related.tables,
				included: json.included
			});
		}
	};
}

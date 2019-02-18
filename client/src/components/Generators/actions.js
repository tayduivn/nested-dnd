import store from "../App/store";

import { SET_PACK } from "../Packs/actions";
import DB from "../../actions/CRUDAction";

export const GENERATOR_SET = "GENERATOR_SET";
export const GENERATOR_RENAME = "GENERATOR_RENAME";
export const GENERATOR_DELETE = "GENERATOR_DELETE ";
export const GENERATOR_ADD = "GENERATOR_ADD";
export const GENERATOR_FETCH = "GENERATOR_FETCH";
export const CLEAR_GENERATOR_ERRORS = "CLEAR_GENERATOR_ERRORS";

function handleError(packurl, isa, { data = {}, message, display }) {
	if (data.pack) {
		store.dispatch({
			type: SET_PACK,
			id: data.pack._id,
			data: {
				...data.pack,
				generators: {
					...data.builtpack.generators,
					[isa]: { error: { message, display }, loaded: true }
				}
			}
		});
	}
}

function handleChangeError(error, id, isa, packurl) {
	store.dispatch({
		type: GENERATOR_SET,
		id,
		isa,
		packurl,
		data: {
			unbuilt: { isa, _id: id, error }
		},
		loading: false
	});
}

export function createGenerator(packurl, isa) {
	DB.create(`packs/${packurl}/generators`, { isa }).then(({ error, data }) => {
		if (error) {
			return handleError(packurl, isa, error);
		}

		// change url
		window.history.replaceState({}, isa, `/packs/${packurl}/generators/${encodeURI(isa)}/edit`);

		store.dispatch({
			type: GENERATOR_SET,
			packurl,
			id: data.unbuilt && data.unbuilt._id,
			isa,
			data: data,
			loading: false
		});
	});

	store.dispatch({
		type: GENERATOR_SET,
		packurl,
		isa,
		data: { isa },
		loading: true
	});
}

export function fetchGenerator(dispatch, packurl, isa) {
	//create page
	if (!isa) return;
	DB.get(`packs/${packurl}/generators`, isa).then(({ error, data }) => {
		if (error) {
			return handleError(packurl, isa, error);
		}
		dispatch({
			type: GENERATOR_SET,
			packurl,
			id: data.unbuilt && data.unbuilt._id,
			isa,
			data: data,
			loading: false
		});
	});

	dispatch({
		type: GENERATOR_SET,
		packurl,
		isa,
		data: { isa },
		loading: true
	});
}

function changeIsa(packid, packurl, id, isa, change) {
	// change url
	window.history.replaceState(
		{},
		change.isa,
		`/packs/${packurl}/generators/${encodeURI(change.isa)}/edit`
	);

	store.dispatch({
		type: GENERATOR_RENAME,
		packid,
		id,
		oldIsa: isa,
		isa: change.isa
	});
}

// only send things if there were side effects of the change that need to be updated on the client
// if the server is slow this can lead to weird jumps
function hasNewIds(prop, oldUnbuilt, newUnbuilt) {
	const oldIds =
		oldUnbuilt[prop] &&
		oldUnbuilt[prop]
			.map(line => line._id)
			.sort()
			.join(",");
	const newIds =
		newUnbuilt[prop] &&
		newUnbuilt[prop]
			.map(line => line._id)
			.sort()
			.join(",");
	return oldIds !== newIds;
}
function trimmedUpdate(newUnbuilt) {
	const send = {};
	const oldUnbuilt = store.getState().generators.byId[newUnbuilt._id];

	// a new desc _id was added
	if (hasNewIds("desc", oldUnbuilt, newUnbuilt)) {
		send.desc = newUnbuilt.desc;
	}
	if (hasNewIds("in", oldUnbuilt, newUnbuilt)) {
		send.desc = newUnbuilt.desc;
	}

	return send;
}

function doChange(packurl, id, isa, change) {
	DB.set(`packs/${packurl}/generators`, id, change).then(({ error, data }) => {
		if (error) {
			return handleChangeError(error, id, isa, packurl);
		} else {
			// don't update unbuilt -- could interfere with what I'm doing
			store.dispatch({
				type: GENERATOR_SET,
				packurl,
				id: data.unbuilt && data.unbuilt._id,
				isa: (data.built && data.built.isa) || (data.unbuilt && data.unbuilt.isa),
				data: { built: data.built, unbuilt: trimmedUpdate(data.unbuilt) },
				loaded: true
			});
		}
	});
}

export function changeGenerator(packurl, packid, id, isa, change = {}) {
	if (change.isa) {
		changeIsa(packid, packurl, id, isa, change);
	} else {
		store.dispatch({
			type: GENERATOR_SET,
			packurl,
			id: id,
			isa,
			data: { built: change, unbuilt: change }
		});
	}
	doChange(packurl, id, isa, change);
}

import { SET_PACK } from "store/packs";
import DB from "util/DB";
import { pushSnacks } from "store/snackbar";

export const GENERATOR_SET = "GENERATOR_SET";
export const GENERATOR_RENAME = "GENERATOR_RENAME";
export const GENERATOR_DELETE = "GENERATOR_DELETE ";
export const GENERATOR_ADD = "GENERATOR_ADD";
export const CLEAR_GENERATOR_ERRORS = "CLEAR_GENERATOR_ERRORS";

function handleError(dispatch, packUrl, isa, { data = {}, message, display }) {
	if (data.pack) {
		dispatch({
			type: SET_PACK,
			id: data.pack._id,
			data: {
				...data.pack,
				generators: {
					...data.builtpack.generators,
					[isa]: { error: { message, display }, isLoaded: true }
				}
			}
		});
	}
}

function handleChangeError(dispatch, error, id, isa, packUrl) {
	dispatch({
		type: GENERATOR_SET,
		id,
		isa,
		packUrl,
		data: {
			unbuilt: { isa, _id: id, error }
		},
		loading: false
	});
}

export function createGenerator(packUrl, isa) {
	return dispatch => {
		DB.create(`packs/${packUrl}/generators`, { isa }).then(({ error, data }) => {
			if (error) {
				return handleError(dispatch, packUrl, isa, error);
			}

			// change url
			window.history.replaceState({}, isa, `/packs/${packUrl}/generators/${encodeURI(isa)}/edit`);

			dispatch({
				type: GENERATOR_SET,
				packUrl,
				id: data.unbuilt && data.unbuilt._id,
				isa,
				data: data,
				loading: false
			});
		});

		dispatch({
			type: GENERATOR_SET,
			packUrl,
			isa,
			data: { isa },
			loading: true
		});
	};
}

export function fetchGenerator(params) {
	return dispatch => {
		const packUrl = params.pack;
		const isa = params.generator ? decodeURIComponent(params.generator) : undefined;

		//create page
		if (!isa || isa === "create") return;
		DB.get(`packs/${packUrl}/generators`, isa).then(({ error, data = {} }) => {
			if (error) {
				return handleError(dispatch, packUrl, isa, error);
			}
			dispatch({
				type: GENERATOR_SET,
				packUrl,
				id: data.unbuilt && data.unbuilt._id,
				isa,
				data: data,
				loading: false
			});
		});

		dispatch({
			type: GENERATOR_SET,
			packUrl,
			isa,
			data: { isa },
			loading: true
		});
	};
}

function changeIsa(dispatch, pack_id, packUrl, id, isa, change) {
	// change url
	window.history.replaceState(
		{},
		change.isa,
		`/packs/${packUrl}/generators/${encodeURI(change.isa)}/edit`
	);

	dispatch({
		type: GENERATOR_RENAME,
		pack_id,
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

function trimmedUpdate(state, newUnbuilt) {
	const send = {};
	const oldUnbuilt = state.generators.byId[newUnbuilt._id];

	// a new desc _id was added
	if (hasNewIds("desc", oldUnbuilt, newUnbuilt)) {
		send.desc = newUnbuilt.desc;
	}
	if (hasNewIds("in", oldUnbuilt, newUnbuilt)) {
		send.desc = newUnbuilt.desc;
	}

	return send;
}

function doChange(dispatch, state, packUrl, id, isa, change) {
	DB.set(`packs/${packUrl}/generators`, id, change).then(({ error, data }) => {
		if (error) {
			return handleChangeError(dispatch, error, id, isa, packUrl);
		} else {
			// don't update unbuilt -- could interfere with what I'm doing
			dispatch({
				type: GENERATOR_SET,
				packUrl,
				id: data.unbuilt && data.unbuilt._id,
				isa: (data.built && data.built.isa) || (data.unbuilt && data.unbuilt.isa),
				data: { built: data.built, unbuilt: trimmedUpdate(state, data.unbuilt) },
				isLoaded: true
			});
		}
	});
}

export function changeGenerator(packUrl, pack_id, id, isa, change = {}) {
	return (dispatch, getState) => {
		if (change.isa) {
			changeIsa(dispatch, pack_id, packUrl, id, isa, change);
		} else {
			dispatch({
				type: GENERATOR_SET,
				packUrl,
				id: id,
				isa,
				data: { built: change, unbuilt: change }
			});
		}
		doChange(dispatch, getState(), packUrl, id, isa, change);
	};
}

// Fetch an list of abbreviated generators (not full data)
export const FETCH_PACK_GENERATORS = "FETCH_PACK_GENERATORS";
export const RECVD_GENERATORS = "RECVD_GENERATORS";
export function fetchPackGenerators(packUrl) {
	return async (dispatch, getStore) => {
		const store = getStore();
		const packId = getStore().packs.byUrl[packUrl];
		const pack = packId && store.packs.byId[packId];
		if (!pack || !pack.isGeneratorsLoaded) {
			const json = await DB.fetch(`/packs/${packUrl}/generators`);
			if (json.errors) {
				pushSnacks(json.errors);
			} else if (json.data) {
				dispatch({
					type: RECVD_GENERATORS,
					id: json.data.id,
					...json
				});
			}
		}
	};
}

import async from "async";

import DB from "../../../actions/CRUDAction.js";
import { merge } from "../../../util";

const EXPIRATON = 1000 * 60 * 30; // 30 minutes

export const DELETE_TABLE = "DELETE_TABLE";
export const FETCH_TABLES = "FETCH_TABLES";

// -----------------------------------------
export const FETCH_TABLE = "FETCH_TABLE";
function shouldFetchTable(state, id) {
	const table = state.tables.byId[id];
	if (!table) return true;
	if (table.isFetching) return false;
	const expired = table.lastUpdated + EXPIRATON < Date.now();
	if (expired) return true;
	return false;
}
function fetchTable(id) {
	return dispatch => {
		dispatch({
			type: FETCH_TABLE,
			id
		});
		return DB.get("tables", id).then(({ data, error }) => {
			if (error) dispatch(fetchTableError(id, error));
			dispatch(receiveTable(id, data));
		});
	};
}
export function fetchTableIfNeeded(id) {
	return (dispatch, getState) => {
		if (shouldFetchTable(getState(), id)) {
			return dispatch(fetchTable(id));
		} else {
			return Promise.resolve();
		}
	};
}

// -----------------------------------------
export const RECEIVE_TABLE = "RECIEVE_TABLE";
export const receiveTable = (id, data) => ({
	type: RECEIVE_TABLE,
	id,
	data,
	receivedAt: Date.now()
});

// -----------------------------------------
export const RECEIVE_TABLES = "RECEIVE_TABLES";
export const receiveTables = (byId = {}) => ({
	type: RECEIVE_TABLES,
	byId
});

// -----------------------------------------
export const FETCH_TABLE_ERROR = "FETCH_TABLE_ERROR";
export const fetchTableError = (id, error) => ({
	type: FETCH_TABLE_ERROR,
	id,
	error,
	receivedAt: Date.now()
});

// -----------------------------------------
export const SET_TABLE = "SET_TABLE";
const updateQueue = async.cargo((tasks, callback) => {
	// batch the tasks together
	const tables = {};
	const dispatch = tasks[0].dispatch;

	tasks.forEach(task => {
		if (!task.id) return;

		if (!tables[task.id]) tables[task.id] = {};

		// push the property into the table
		tables[task.id] = merge(tables[task.id], task.data);
	});

	// send one request for each table
	const requests = [];
	// TODO: eslint bug
	// eslint-disable-next-line
	for (let id in tables) {
		dispatch(saveTableStart(id));
		const req = DB.set("tables", id, tables[id]).then(({ error, data }) => {
			// we only dispatch an action if there is an error
			if (error) dispatch(saveTableError(id, error));
			else dispatch(saveTableSuccess(id, data));
		});
		requests.push(req);
	}

	// let the queue know it's done and can process the next task
	Promise.all(requests).then(callback);
});
export function setTable(id, data) {
	return dispatch => {
		// send the initial changes
		dispatch({
			type: SET_TABLE,
			id,
			data
		});

		updateQueue.push({
			id,
			data,
			// send dispatch so the saver can send the result when finished
			dispatch
		});
	};
}

// -----------------------------------------
export const SAVE_TABLE_START = "SAVE_TABLE_START";
export const saveTableStart = id => ({ type: SAVE_TABLE_START, id });

// -----------------------------------------
export const SAVE_TABLE_SUCCESS = "SAVE_TABLE_SUCCESS";
export const saveTableSuccess = (id, data) => ({ type: SAVE_TABLE_SUCCESS, id, data });

// -----------------------------------------
export const SAVE_TABLE_ERROR = "SET_TABLE_ERROR";
export const saveTableError = (id, error) => ({
	type: SAVE_TABLE_ERROR,
	id,
	error,
	receivedAt: Date.now()
});

// -----------------------------------------
export const CREATE_TABLE = "CREATE_TABLE";
export const createTable = (packurl, title) => {
	return dispatch => {
		DB.fetch(`tables/create/${packurl}`, "POST", { body: { title } }).then(({ error, data }) => {
			// TODO: error

			// change url
			window.history.replaceState(
				{},
				data.title,
				`/packs/${packurl}/tables/${encodeURI(data._id)}/edit`
			);

			dispatch(receiveTable(data._id, data));
		});
	};
};

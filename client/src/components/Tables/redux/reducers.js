import { reduceObjToArray } from "../../../util";

import {
	FETCH_TABLE,
	RECEIVE_TABLE,
	RECEIVE_TABLES,
	FETCH_TABLE_ERROR,
	SET_TABLE,
	SAVE_TABLE_START,
	SAVE_TABLE_SUCCESS,
	SAVE_TABLE_ERROR
} from "./actions";

const DEFAULT_TABLES = {
	byId: {}
};

const DEFAULT_TABLE = {
	isFetching: false,
	isSaving: false,
	lastUpdated: null
};

const rows = (state = [], action) => {
	switch (action.type) {
		case SET_TABLE:
			return reduceObjToArray(state, action.data);
		default:
			return state;
	}
};

const table = (state = DEFAULT_TABLE, action) => {
	switch (action.type) {
		case FETCH_TABLE:
			return {
				isFetching: true
			};
		case RECEIVE_TABLES:
		case RECEIVE_TABLE:
			return {
				...state,
				...action.data,
				isFetching: false,
				lastUpdated: action.receivedAt,
				apiError: null
			};
		case FETCH_TABLE_ERROR:
			return {
				...state,
				apiError: {
					action: FETCH_TABLE_ERROR,
					...action.error
				},
				isFetching: false,
				lastUpdated: null
			};
		case SET_TABLE:
			return {
				...state,
				...action.data,
				rows: rows(state.rows, { ...action, data: action.data.rows })
			};

		case SAVE_TABLE_START:
			return { ...state, isSaving: true };
		case SAVE_TABLE_SUCCESS:
			return { ...state, isSaving: false };
		case SAVE_TABLE_ERROR:
			return {
				...state,
				apiError: {
					action: SAVE_TABLE_ERROR,
					...action.error
				},
				isSaving: false
			};
		default:
			return state;
	}
};

const tables = (state = DEFAULT_TABLES, action) => {
	switch (action.type) {
		// a specific table, pass through to table()
		case FETCH_TABLE:
		case RECEIVE_TABLE:
		case FETCH_TABLE_ERROR:
		case SAVE_TABLE_START:
		case SAVE_TABLE_SUCCESS:
		case SAVE_TABLE_ERROR:
		case SET_TABLE:
			return {
				...state,
				byId: {
					...state.byId,
					[action.id]: table(state.byId[action.id], action)
				}
			};
		case RECEIVE_TABLES:
			let newById = {};
			// TODO
			// eslint-disable-next-line
			for (let id in action.byId) {
				newById[id] = table(state.byId[id], { ...action, data: action.byId[id] });
			}
			return { ...state, byId: { ...state.byId, ...newById } };
		default:
			return state;
	}
};

export default tables;

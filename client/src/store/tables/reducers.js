import {
	FETCH_TABLE_ERROR,
	FETCH_TABLE,
	RECVD_PACK_TABLES,
	RECVD_TABLE,
	RECVD_TABLES,
	SAVE_TABLE_ERROR,
	SAVE_TABLE_START,
	SAVE_TABLE_SUCCESS,
	SET_TABLE
} from "./actions";
import reduceObjToArray from "util/reduceObjToArray";
import { RECVD_CHILD_OPTIONS } from "store/packs/actions";

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
		case RECVD_TABLES:
		case RECVD_TABLE:
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

const DEFAULT_TABLES = {
	byId: {}
};
// eslint-disable-next-line complexity
const tables = (state = DEFAULT_TABLES, action) => {
	let newById;
	switch (action.type) {
		// a specific table, pass through to table()
		case FETCH_TABLE:
		case RECVD_TABLE:
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
		// included, partial data
		case RECVD_PACK_TABLES:
		case RECVD_CHILD_OPTIONS:
			newById = { ...state.nyId };
			action.included.forEach(item => {
				if (item.type === "Table") {
					if (!newById[item.id]) newById[item.id] = {};
					newById[item.id] = { ...newById[item.id], ...item.attributes };
				}
			});
			return { ...state, byId: newById };
		case RECVD_TABLES:
			newById = {};
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

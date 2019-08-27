import { createMatchSelector } from "connected-react-router";

import { locationSelector } from "store/location";

// because we are fucking with the url, we need to make our own match based on real url
const selector = createMatchSelector({ path: "/packs/:pack/tables/:table" });
export const tablePathSelector = state =>
	selector({
		router: { ...state.router, location: locationSelector(state) }
	}) || { params: {} };

export const tablesSelect = (state, pack) => {
	if (pack && pack.tables) {
		return pack.tables.map(t => {
			return state.tables.byId[t] || {};
		});
	}
	return [];
};
export default tablePathSelector;

import { createMatchSelector } from "connected-react-router";

const locationSelector = state => ({ ...state.router.location, ...window.location });

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

export const embeddedContentSelector = (state, table) => {
	const location = locationSelector(state);
	const path = location.pathname.substr(location.pathname.indexOf("edit"));
	const split = path.split("/");

	const embedded = {};
	let current = embedded;
	let up = location.pathname.substring(0, location.pathname.indexOf("edit") + 4);

	for (var i = 2; i < split.length; i += 2) {
		const index = parseInt(split[i], 0);
		current.embed = { ...table.rows[split[i]], index, up };
		current = current.embed;
		up += `value/${index}`;
	}

	return embedded.embed;
};

import { locationSelector } from "store/location";

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

export default embeddedContentSelector;

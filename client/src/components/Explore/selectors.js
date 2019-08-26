import colors from "../../colors";
import { createMatchSelector } from "connected-react-router";

const universePath = createMatchSelector({ path: "/universes/:universe/explore" });
const packPath = createMatchSelector({ path: "/packs/:pack/explore" });
const explorePath = createMatchSelector({ path: "/explore/:type/:id" });

const NEW_ITEM = {
	isNew: true,
	cssClass: "addNew",
	icon: "fas fa-plus",
	in: []
};

const LOADING_CHILD = {
	icon: "fas fa-spinner fa-spin",
	name: "",
	in: [],
	cssClass: ""
};

function getHighlightClass(cssClass) {
	var { name, variant } = getParts(cssClass);
	return "bg-" + name + "-" + variant;
}

function getHighlightColor(cssClass) {
	var { name, variant } = getParts(cssClass);

	return colors[name] ? colors[name][variant] : cssClass;
}

function getColor(cssClass) {
	var { name, variant } = getParts(cssClass, true);
	return colors[name] ? colors[name][variant] : cssClass;
}

function getParts(cssClass, dontShift) {
	var bg = cssClass.split(" ").find(c => c.startsWith("bg-"));
	if (!bg) return { name: "", variant: "" };
	var parts = bg.split("-");
	parts.splice(0, 1); // remove bg-
	var variant = parts[parts.length - 1];
	parts.splice(parts.length - 1, 1);

	if (!variant) return { parts: [cssClass] };

	if (!dontShift) variant = shiftColor(variant);

	return { name: parts.join("-"), variant };
}

function shiftColor(variant) {
	if (variant.startsWith("a")) {
		variant = variant.substr(1);
	} else {
		variant = parseInt(variant, 10);
		if (variant === 50) variant = 100;
		else if (variant <= 500) variant += 100;
		else variant -= 100;
	}
	return variant;
}

function getChild(current, i, child) {
	// couldn't find in array, it hasn't loaded yet.
	if (child === undefined) {
		child = { up: current.index, loaded: false };
	}

	// add index into object
	const c = { ...child, index: i };

	c.isLink = c.up !== current.index;

	// if no style, pass down style
	if (!c.cssClass) {
		c.cssClass = current.cssClass;
		c.txt = current.txt;
	}

	return c;
}

function setAncestors(current, universe) {
	let up = [];
	let upIndex = current.up;
	let seen = [];
	while (upIndex !== undefined) {
		const ancestor = universe.array[upIndex];
		if (!ancestor || seen.includes(upIndex)) {
			upIndex = undefined;
			break;
		}

		// fill in current css class
		if (!current.cssClass && ancestor.cssClass) {
			current.cssClass = ancestor.cssClass;
			current.txt = ancestor.txt;
		}
		// fill in parent css class
		if (up[0] && !up[0].cssClass && ancestor.cssClass) {
			up[0].cssClass = ancestor.cssClass;
			up[0].txt = ancestor.txt;
		}

		seen.push(upIndex);
		up.push({ ...ancestor, index: upIndex });
		upIndex = ancestor.up;
	}
	current.up = up;
}

export function getCurrent(instances, universe = {}, index, isUniverse) {
	if (!universe.array || !universe.array[index]) return { loading: true, index };

	let current = instances[universe.array[index]];
	current.index = current.n; //TODO remove alias
	debugger;

	// set ancestors and fill in cssClass if needed
	setAncestors(current, universe);
	if (!current.cssClass) current.cssClass = "bg-grey-900";

	// get in
	if (current.in && current.in.filter)
		current.in = current.in
			.filter(c => c !== null && !isNaN(c))
			// LOADING indicates just added, waiting for save result
			.map(i => (i === "LOADING" ? LOADING_CHILD : getChild(current, i, universe.array[i])));
	else current.in = [];

	if (isUniverse && !current.todo) {
		current.in.push({ ...NEW_ITEM, index: current.index });
	}

	current.highlightClass = getHighlightClass(current.cssClass);
	current.highlightColor = getHighlightColor(current.cssClass);
	current.color = getColor(current.cssClass);
	current.isFavorite = universe.favorites && universe.favorites.includes(index);

	return current;
}

const LOADING = "";

const getIndexFromHash = hash => (hash ? parseInt(hash.substr(1), 10) : LOADING);

export const getExploreUrlParams = state => {
	const location = state.router.location;
	const match = explorePath(state);
	const index = getIndexFromHash(location.hash);
	return { index, match };
};

export const getUrlInfo = state => {
	const location = state.router.location;
	const pathname = location.pathname;
	const isUniverse = pathname.includes("universe");
	const match = pathname.includes("universe")
		? universePath(state)
		: state.router.location.pathname.startsWith("/explore")
		? explorePath(state)
		: packPath(state);
	const index = getIndexFromHash(location.hash);

	return { index, match, isUniverse };
};

export function getIsaOptions(state, builtpack = {}) {
	const tables = getGeneratorTables(state, builtpack);
	const gens = builtpack.generators || {};
	const genOpts = Object.keys(gens)
		.sort()
		.map(g => ({ label: g, value: g }));
	const tableOpt = tables.map(t => ({ label: t.title, value: `${t._id}`, table: true }));
	return genOpts.concat(tableOpt);
}

export function getGeneratorTables(state, builtpack) {
	const tables = [];
	if (!builtpack || !builtpack.tables) return tables;
	builtpack.tables.forEach(id => {
		const table = state.tables.byId[id];

		if (table && table.returns === "generator") tables.push(table);
	});
	return tables;
}

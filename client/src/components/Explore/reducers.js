import colors from "../../colors";
import { createMatchSelector } from "connected-react-router";

const universePath = createMatchSelector({ path: "/universes/:universe/explore" });
const packPath = createMatchSelector({ path: "/packs/:pack/explore" });

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

function getChild(current, i, child = {}) {
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

function getCurrent(universe = {}, index, isUniverse) {
	if (!universe.array || !universe.array[index]) return { loading: true, index };

	let current = { ...universe.array[index], index: index };

	// set ancestors and fill in cssClass if needed
	setAncestors(current, universe);
	if (!current.cssClass) current.cssClass = "bg-grey-900";

	// get in
	if (current.in && current.in.filter)
		current.in = current.in
			.filter(c => c)
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

const getUniverse = state => {
	const location = state.router.location;
	const isUniverse = location.pathname.includes("universe");
	const match = isUniverse ? universePath(state) : packPath(state);
	let index = getIndexFromHash(location.hash);
	let universe, pack;

	if (!match) return {};

	if (isUniverse) {
		universe = state.universes.byId[match.params.universe] || {
			loaded: false
		};
		pack = state.packs.byId[universe.pack];
		universe._id = match.params.universe;
	} else {
		const packid = match && state.packs.byUrl[match.params.pack];
		pack = state.packs.byId[packid] || (match && { url: match.params.pack });
		universe = (pack && state.universes.byId[pack.tempUniverse]) || { pack: pack._id };
	}

	if (index === LOADING) index = universe.lastSaw;

	return { pack, universe, index, isUniverse };
};

export { getCurrent, getUniverse };

import colors from "util/colors";

const NEW_ITEM = {
	isNew: true,
	cls: "addNew",
	icon: "fas fa-plus",
	in: []
};

const LOADING_CHILD = {
	icon: "fas fa-spinner fa-spin",
	name: "",
	in: [],
	cls: ""
};

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
		if (!current.cls && ancestor.cls) {
			current.cls = ancestor.cls;
			current.txt = ancestor.txt;
		}
		// fill in parent css class
		if (up[0] && !up[0].cls && ancestor.cls) {
			up[0].cls = ancestor.cls;
			up[0].txt = ancestor.txt;
		}

		seen.push(upIndex);
		up.push({ ...ancestor, index: upIndex });
		upIndex = ancestor.up;
	}
	current.up = up;
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
	if (!c.cls) {
		c.cls = current.cls;
		c.txt = current.txt;
	}

	return c;
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

function getParts(cls, dontShift) {
	var bg = cls.split(" ").find(c => c.startsWith("bg-"));
	if (!bg) return { name: "", variant: "" };
	var parts = bg.split("-");
	parts.splice(0, 1); // remove bg-
	var variant = parts[parts.length - 1];
	parts.splice(parts.length - 1, 1);

	if (!variant) return { parts: [cls] };

	if (!dontShift) variant = shiftColor(variant);

	return { name: parts.join("-"), variant };
}

function getHighlightClass(cls) {
	var { name, variant } = getParts(cls);
	return "bg-" + name + "-" + variant;
}

function getHighlightColor(cls) {
	var { name, variant } = getParts(cls);

	return colors[name] ? colors[name][variant] : cls;
}

// get a color from a class
function getColor(cls) {
	var { name, variant } = getParts(cls, true);
	return colors[name] ? colors[name][variant] : cls;
}

export default function getHighlight(cls) {
	if (!cls) return {};
	const hCls = getHighlightClass(cls);
	const hColor = getHighlightColor(hCls);
	return {
		cls: hCls,
		txt: hColor
	};
}

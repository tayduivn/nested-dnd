import colors from "util/colors";

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

export default function getHighlight(cls) {
	if (!cls) return {};
	const hCls = getHighlightClass(cls);
	const hColor = getHighlightColor(hCls);
	return {
		cls: hCls,
		txt: hColor
	};
}

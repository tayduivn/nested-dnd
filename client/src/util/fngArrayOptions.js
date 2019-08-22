import fng from "fantasy-names";

var arrayOptions = [];

function toLabel(val) {
	if (!val) return "";
	return val.replace(/-/g, " ").replace(/_/g, " ");
}

for (var section in fng.generators) {
	var s = fng.generators[section];
	for (var i = 0; i < s.length; i++) {
		arrayOptions.push({
			label: toLabel(section + " > " + s[i]),
			value: [section, s[i]]
		});
	}
}

export function wrapOption(section = "", p = "") {
	return { label: toLabel(section + " > " + p), value: [section, p] };
}

export default arrayOptions;

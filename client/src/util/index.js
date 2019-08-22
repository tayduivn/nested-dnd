import handleNestedPropertyValue from "./handleNestedPropertyValue";
import spread from "./spread";
import fngArrayOptions from "./fngArrayOptions";
import reduceObjToArray from "./reduceObjToArray";
import merge from "./merge";
import "./polyfills";

function clean(obj) {
	Object.assign({}, obj);
	for (var propName in obj) {
		if (obj[propName] === undefined) {
			delete obj[propName];
		}
	}
	return obj;
}

// essentially makes up for the default values when constructing a thing
// need to know if value should be unset (set to undefined) in pack
function valueIsUndefined(value) {
	return value === undefined || value === false
		? true
		: value === null
		? false // null means overwrite other packs to set this blank, or ignore isa value
		: typeof value === "string"
		? value === ""
		: value.constructor && value.constructor.name === "Array"
		? value.equals([])
		: !Object.keys(value).length;
}

function downloadJSON(obj, filename) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
	var dlAnchorElem = document.getElementById("downloadAnchorElem");
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", filename + ".json");
	dlAnchorElem.click();
}

function copyToClipboard(text) {
	var textField = document.createElement("textarea");
	textField.innerText = text;
	document.body.appendChild(textField);
	textField.select();
	document.execCommand("copy");
	textField.remove();
}

function uniq(a) {
	var prims = { boolean: {}, number: {}, string: {} },
		objs = [];

	return a.filter(function(item) {
		var type = typeof item;
		if (type in prims) return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
		else return objs.indexOf(item) >= 0 ? false : objs.push(item);
	});
}

function binaryFind(arr, searchElement) {
	var minIndex = 0;
	var maxIndex = arr.length - 1;
	var currentIndex;
	var currentElement;

	while (minIndex <= maxIndex) {
		currentIndex = ((minIndex + maxIndex) / 2) | 0;
		currentElement = arr[currentIndex];

		if (currentElement < searchElement) {
			minIndex = currentIndex + 1;
		} else if (currentElement > searchElement) {
			maxIndex = currentIndex - 1;
		} else {
			return {
				// Modification
				found: true,
				index: currentIndex
			};
		}
	}

	return {
		// Modification
		found: false,
		index: currentElement < searchElement ? currentIndex + 1 : currentIndex
	};
}

function getQueryParams(location) {
	const params = {};
	location.search
		.substr(1)
		.split("&")
		.map(p => p.split("="))
		.forEach(p => (params[p[0]] = p[1]));
	return params;
}

function toUpper(str) {
	return str
		.split(" ")
		.map(s => s.charAt(0).toUpperCase() + s.substr(1))
		.join(" ");
}

function setBodyStyle({ cssClass = "", txt = "", up = [] } = {}) {
	var body = window.document.getElementById("body");
	if (!body) return; //for tests
	var stripped = body.className
		.split(" ")
		.filter(c => !c.startsWith("bg-") && !c.startsWith("ptn-"))
		.join(" ")
		.trim();
	if (!cssClass) {
		cssClass = (up[0] && up[0].cssClass) || "";
	}
	if (!txt) txt = "";
	stripped += " " + cssClass;
	body.className = stripped.trim();
	body.style.color = txt;
}

const splitClass = (cssClass = "") => {
	const parts = cssClass.split(" ");
	return {
		bg: parts.find(p => p.startsWith("bg-")) || "",
		ptn: parts.find(p => p.startsWith("ptn-")) || ""
	};
};

const NOOP = () => {};

export {
	uniq,
	splitClass,
	copyToClipboard,
	binaryFind,
	clean,
	valueIsUndefined,
	downloadJSON,
	getQueryParams,
	toUpper,
	setBodyStyle,
	handleNestedPropertyValue,
	spread,
	fngArrayOptions,
	reduceObjToArray,
	NOOP,
	merge
};

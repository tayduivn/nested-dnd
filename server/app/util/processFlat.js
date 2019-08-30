/* eslint-disable complexity */
/* eslint-disable max-statements */
const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectID;

const debug = require("debug")("app:util");
const flatten = require("util/flatten");
const Table = require("table/Table");
const Generator = require("generator/Generator");

module.exports = function processFlat(
	toFlatten,
	alreadyFoundTable = new Set(),
	alreadyFoundIsa = new Set(),
	toFindIsas = new Set(),
	toFindTableIds = new Set(),
	usedData = new Set()
) {
	// debug("STARTING  processFlat");

	const flat = flatten(toFlatten);

	for (let path in flat) {
		if (path.endsWith(".type")) {
			const type = flat[path];
			const groupPath = path.substring(0, path.length - 5);
			const valuePath = groupPath + ".value";
			let value = flat[valuePath];
			let group;
			if (value) {
				group = toFlatten;
				const parts = groupPath.split(".");
				parts.forEach(p => (group = group[p]));
				if (!group) {
					debug("something terribel has gone wrong wit this path" + ` ${path}`);
				}
			}

			// embedded table
			switch (type) {
				case "table":
					if (!value) {
						// there should not be a value because it has been flattened
						break;
					}
					group.value = new Table(value);
					break;
				// embedded generator
				case "embed":
					if (!value) {
						// there should not be a value because it has been flattened
						break;
					}
					group.value = new Generator(value);
					break;
				case "table_id":
					let str;
					if (typeof value === "string") {
						str = value;
						group.value = ObjectId(value);
						// debug(`${toFlatten._id}: need to clean up string here ${path}`);
					} else if (value instanceof ObjectId) {
						str = value.toString();
					}
					if (!alreadyFoundTable.has(str) && !toFindTableIds.has(str)) {
						// debug(`found another table! ${path}: ${value}`);
						toFindTableIds.add(str);
					}
					break;
				// generator isa
				case "generator":
					if (!alreadyFoundIsa.has(value) && !toFindIsas.has(value)) {
						// debug(`found another isa! ${path}: ${value}`);
						toFindIsas.add(value);
					}
					break;
				case "data":
					usedData.add(value);
			}
		}
	}
	// debug("DONE      processFlat");
	return { alreadyFoundTable, alreadyFoundIsa, toFindIsas, toFindTableIds, usedData };
};

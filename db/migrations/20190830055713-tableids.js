/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable max-statements */
"use strict";

var dbm;
var type;
var seed;
const ObjectId = require("mongodb").ObjectId;
const mongoose = require("mongoose");
const Pack = require("../../server/app/pack/Pack");
const Universe = require("../../server/app/universe/Universe");

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

function isObject(value) {
	return value !== null && typeof value === "object";
}

function flatten(object) {
	const result = {};

	function flatten(obj, prefix = "") {
		let key;
		for (key in obj) {
			let value = obj[key];

			// we have to check if value is truthy, because `null` is an object
			if (isObject(value) && !(value instanceof ObjectId)) {
				flatten(value, `${prefix}${key}.`);
			} else if (typeof value !== "function") {
				result[`${prefix}${key}`] = value;
			}
		}
	}

	flatten(object);

	return result;
}

function processObject(obj, i, _id, collection) {
	const flat = flatten(obj);
	for (let path in flat) {
		if (path.endsWith(".type")) {
			// set things up
			const type = flat[path];
			const groupPath = path.substring(0, path.length - 5);
			const valuePath = groupPath + ".value";
			let value = flat[valuePath];
			let group, groupParent, groupName, grandParent, ggParent;
			const parts = groupPath.split(".");

			group = obj;
			parts.forEach(p => {
				if (grandParent) ggParent = grandParent;
				if (groupParent) grandParent = groupParent;
				groupParent = group;
				group = group[p];
				groupName = p;
			});
			if (!grandParent) grandParent = obj;
			if (grandParent && !ggParent) ggParent = obj;
			if (!group) {
				console.log(flat);
				throw Error(`something terrible has gone wrong in row ${i} wit this path ${path}`);
			}

			if (
				!value &&
				type !== "table" &&
				type !== "embed" &&
				(grandParent && grandParent.returns !== "fng") &&
				!path.endsWith("data.dice.type")
			) {
				if (path === "style.icon.type") {
					delete obj.style.icon;
				} else if (type === "generator") {
					console.log(
						`${collection} ObjectId('${_id}'): couldn't cast ${value} from string to object id in groupParent: ${JSON.stringify(
							groupParent
						)} group: ${groupName}, path: ${path}`
					);
					delete groupParent[groupName];
				} else {
					console.log(flat);
					throw new Error(`wtf are we going here? at path ${path}`);
				}
			}

			if (type !== "table" && type !== "embed" && !grandParent) {
				console.log(flat);
				throw new Error(`Couldn't find a grandparent at path ${path}`);
			}
			// done setting things up

			switch (type) {
				case "table":
					if (!value) break;
					console.log(flat);
					throw Error(`something has gone wrong with path ${path} in row ${i}`);
				case "embed":
					if (!value) break;
					console.log(flat);
					throw Error(`something has gone wrong with path ${path} in row ${i}`);
				case "table_id":
					if (typeof value === "string") {
						try {
							group.value = ObjectId(value);
							console.log(
								`${collection} ObjectId('${_id}'): casting table_id ${value} from string to object id`
							);
						} catch (e) {
							console.log(
								`${collection} ObjectId('${_id}'): couldn't cast ${value} from string to object id in groupParent: ${JSON.stringify(
									groupParent
								)} group: ${groupName}, path: ${path}`
							);
							delete groupParent[groupName];
						}
					}
					break;
				// generator isa
				case "generator":
					if (typeof value !== "string") {
						console.log(
							`${collection} ObjectId('${_id}'): row ${i} has a non string value at ${path} that is supposed to be a ${type}`,
							value
						);
					}
					break;
				case "string":
					// if (value === "human") {
					// 	console.log("STOPPING BECAUSE HUMAN");
					// 	console.log("object");
					// 	console.log(JSON.stringify(obj, undefined, 2));
					// 	console.log("grandparent");
					// 	console.log(JSON.stringify(grandParent, undefined, 2));
					// 	console.log("groupName", groupName);
					// 	console.log("up part " + parts[parts.length - 2]);
					// 	console.log("STOPPING BECAUSE HUMAN");
					// 	throw Error(
					// 		`${collection} ObjectId('${_id}'): row ${i} path ${path} is a ${type}`,
					// 		value
					// 	);
					// }

					if (grandParent.returns !== "text") {
						const upPart = parts[parts.length - 2];

						if (
							grandParent.returns === "generator" ||
							(upPart === "rows" && ggParent.returns === "generator")
						) {
							console.log(
								`${collection} ObjectId('${_id}'):` + "Casting group to type generator",
								group
							);
							group.type = "generator";
						} else if (!grandParent.returns && grandParent.rows) {
							grandParent.returns = "text";
						} else if (
							groupName === "name" ||
							upPart === "desc" ||
							upPart === "in" ||
							upPart === "style" ||
							grandParent.returns === "fng" ||
							(!upPart && i === "desc") ||
							(!upPart === "rows" && ggParent.returns === "text")
						) {
							// this is fine, nothing to see here
						} else {
							console.log("object");
							console.log(JSON.stringify(obj, undefined, 2));
							console.log("grandparent");
							console.log(JSON.stringify(grandParent, undefined, 2));
							console.log("ggParent returns ", ggParent && ggParent.returns);
							console.log("grandparent returns ", grandParent.returns);
							console.log("groupName", groupName);
							console.log("up part " + upPart);
							throw Error(
								`${collection} ObjectId('${_id}'): row ${i} path ${path} is a ${type}`,
								value
							);
						}
					}
					if (typeof value !== "string") {
						console.log(
							`${collection} ObjectId('${_id}'): row ${i} has a non string value at ${path} that is supposed to be a ${type}`,
							value
						);
					}
					break;
			}
		}
	}
	return obj;
}

exports.up = async function(dbMigrate) {
	console.log("------ up migration 'tableids'");
	const db = await dbMigrate._run("getDbInstance");
	const collection = db.collection("tables");

	mongoose.set("useFindAndModify", false);
	mongoose.set("useCreateIndex", true);
	mongoose.set("useNewUrlParser", true);
	mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/nested-dnd", function(
		err
	) {
		if (err) {
			throw new Error("Couldn't connect to mongo database");
		}
	});
	const packs = await Pack.find()
		.populate("universe_id")
		.exec();

	for (let index = 0; index < packs.length; index++) {
		const pack = packs[index];
		if (!pack._user) {
			if (!pack.universe_id || !pack.universe_id.user) {
				console.log("WHAT");
				console.log(pack);
			}
			pack._user = pack.universe_id.user;
			console.log(`Updating pack ${pack._id} with its universe user ${pack._user}`);
			await pack.save();
		}
	}

	const result = await new Promise((resolve, reject) => {
		collection.find({}, async (err, cursor) => {
			if (err) {
				return reject(err);
			}
			const arr = [];
			while (await cursor.hasNext()) {
				arr.push(await cursor.next());
			}
			console.log("got all tables");
			resolve(arr);
		});
	});

	result.forEach(table => {
		if (!table.rows) return;
		table.rows = table.rows.filter(row => !!row);
		table = processObject(table, "table", table._id, "table");
	});

	const processTable = table =>
		new Promise((resolve, reject) => {
			const ObjectId = require("mongodb").ObjectId;
			collection.updateOne({ _id: ObjectId(table._id) }, table, (err, result) => {
				if (err) return reject(err);
				resolve(result);
			});
		});

	await Promise.all(result.map((table, i) => processTable(table, i)));

	// do it for generator descs and names
	let gens = await new Promise((resolve, reject) => {
		db.collection("generators").find({}, async (err, cursor) => {
			if (err) {
				return reject(err);
			}
			const arr = [];
			while (await cursor.hasNext()) {
				arr.push(await cursor.next());
			}
			console.log("got all generators");
			resolve(arr);
		});
	});

	gens = gens.map(gen => processObject(gen, "gen", gen._id, "gen"));

	const processGens = item =>
		new Promise((resolve, reject) => {
			const ObjectId = require("mongodb").ObjectId;
			db.collection("generators").updateOne({ _id: ObjectId(item._id) }, item, (err, result) => {
				if (err) return reject(err);
				resolve(result);
			});
		});

	await Promise.all(gens.map((gen, i) => processGens(gen, i)));

	console.log("------ done saving gens");

	console.log("------ done up migration 'tableids");
	mongoose.connection.close();
	db.close();
	return null;
};

exports.down = function(dbMigrate) {
	return null;
};

exports._meta = {
	version: 1
};

"use strict";

var dbm;
let type;
let seed;
const ObjectID = require("mongodb").ObjectID;

// http://mongodb.github.io/node-mongodb-native/3.3/

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

const isUrl = function({ category, value } = {}) {
	const isNotUrlCatgory = category !== "img" && category !== "video";
	return value && value.startsWith("http") && isNotUrlCatgory;
};

// eslint-disable-next-line
function makeNewInst(inst, universe, i) {
	const newInst = {
		univ: universe._id,
		name: inst.name,
		isa: inst.isa,
		up: inst.up,
		n: i
	};
	if (inst.todo) {
		newInst.todo = true;
	}
	if (inst.desc) {
		newInst.desc = inst.desc;
	}
	if (universe.favorites.includes(i)) {
		newInst.fav = true;
	}
	if (inst.txt) {
		newInst.txt = inst.txt;
	}
	if (inst.cssClass) {
		newInst.cls = inst.cssClass;
	}
	if (inst.in) {
		newInst.in = inst.in;
	}
	if (inst.data) {
		newInst.data = inst.data;
	}
	if (inst.icon) {
		if (typeof inst.icon === "string") {
			if (inst.icon.startsWith("http")) {
				newInst.icon = {
					kind: "img",
					value: inst.icon
				};
				return;
			}
			const parts = inst.icon.split(" ");
			let type = parts[0];
			let value = parts[1];
			if (parts[0] !== "svg" && parts[0] !== "text") {
				type = "svg";
				value = inst.icon;
			}
			newInst.icon = {
				kind: type === "svg" ? "icon" : "char",
				value: value
			};
		}

		// fix icon is actually a url
		else if (isUrl(inst.icon)) {
			newInst.icon = {
				kind: "img",
				value: inst.icon && inst.icon.value
			};
		} else if (inst.icon) {
			newInst.icon = {
				kind: inst.icon.category,
				value: inst.icon.value
			};
		}
	}
	if (inst.img) {
		newInst.icon = {
			kind: "img",
			value: inst.img
		};
	}

	return newInst;
}

exports.up = async function(dbMigrate) {
	console.log("------ up migration 'instances'");
	const db = await dbMigrate._run("getDbInstance");

	const instances = await new Promise((resolve, reject) => {
		db.createCollection("instances", err => {
			if (err) {
				return reject(err);
			}
			console.log("created instances collection");

			resolve(db.collection("instances"));
		});
	});

	const allUniverses = await new Promise((resolve, reject) => {
		db.collection("universes").find({}, async (err, cursor) => {
			if (err) {
				return reject(err);
			}
			const universes = [];
			while (await cursor.hasNext()) {
				universes.push(await cursor.next());
			}
			console.log("got all universes");
			resolve(universes);
		});
	});

	const processUniverse = async universe => {
		const storeIndexes = [];
		const insertMe = [];
		let lookupNewId = {};
		let insertedIds = [];

		if (universe.array) {
			universe.array.forEach((inst, i) => {
				// skip null elements in the array
				if (!inst) {
					return;
				}
				insertMe.push(makeNewInst(inst, universe, i));
				storeIndexes.push(i);
			});

			insertedIds = await new Promise((resolve, reject) => {
				instances.insertMany(insertMe, function(err, result) {
					if (err) return reject(err);
					resolve(result.insertedIds);
				});
			});

			// maps the old index to the new id
			lookupNewId = insertedIds.reduce((obj, newId, i) => {
				const originalIndex = storeIndexes[i];
				obj[originalIndex] = newId;
				return obj;
			}, {});

			// update all instances with the correct IDs.
			const processInstance = async (id, i) => {
				const newInst = { ...insertMe[i] };
				if (!isNaN(insertMe[i].up)) {
					newInst.up = lookupNewId[insertMe[i].up];
				}
				if (insertMe[i].in) {
					newInst.in = insertMe[i].in.map(index => lookupNewId[index]);
				}

				await new Promise((resolve, reject) => {
					instances.updateOne({ _id: id }, newInst, function(err, result) {
						if (err) return reject(err);
						if (!result.modifiedCount) {
							console.error(`couldn't find instance with id ${id}`);
							reject(result);
						}
						resolve(result);
					});
				});

				return newInst;
			};

			await insertedIds.map((id, i) => processInstance(id, i));
		}

		const newUniverse = {
			user: universe.user_id,
			pack: universe.pack,
			title: universe.title,
			last: lookupNewId[universe.lastSaw],
			seed: insertedIds[0]
		};

		await new Promise((resolve, reject) => {
			db.collection("universes").updateOne({ _id: universe._id }, newUniverse, (err, result) => {
				if (err) return reject(err);
				if (!result.modifiedCount) {
					console.error(`couldn't find universe with id ${universe._id}`);
					reject(result);
				}
				resolve(result);
			});
		});

		console.log(`done writing universe ${universe._id}`);
	};

	await Promise.all(allUniverses.map(universe => processUniverse(universe)));

	// TODO: remove array from universe, update lastSaw, favorites, and seed

	console.log("added instances");

	instances.createIndex({ univ: 1, n: 1 }, { unique: true });
	console.log("created index");

	db.close();
	return null;
};

exports.down = async function(dbMigrate) {
	console.log("------ down migration 'instances'");
	const db = await dbMigrate._run("getDbInstance");

	const instances = db.collection("instances");

	const allInst = await new Promise((resolve, reject) => {
		instances.find({}, async (err, cursor) => {
			if (err) return reject(err);

			const array = [];
			while (await cursor.hasNext()) {
				array.push(await cursor.next());
			}
			resolve(array);
		});
	});
	const universeById = {};

	allInst.forEach(instance => (universeById[instance.univ] = null));

	const getUniverse = async universeId => {
		universeById[universeId] = await new Promise((resolve, reject) => {
			let uid;
			try {
				uid = ObjectID(universeId);
			} catch (e) {
				console.error(`Couldn't tranform into an ObjectID: ${universeId}`);
				return reject(e);
			}
			db.collection("universes").findOne({ _id: uid }, function(err, u) {
				if (err) return reject(err);
				if (!u) {
					console.error(`Couldn't find universe ${universeId}`);
					return reject(`Couldn't find universe ${universeId}`);
				}
				console.log(`got universe ${universeId}`);
				resolve(u);
			});
		});
	};

	await Promise.all(Object.keys(universeById).map(universeId => getUniverse(universeId)));

	await instances.remove();
	console.log("deleted instances");
	db.close();
	return null;
};

exports._meta = {
	version: 1
};

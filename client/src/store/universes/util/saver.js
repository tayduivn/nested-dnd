import async from "async";

import DB from "util/DB";
import merge from "util/merge";
import flatten from "util/flatten";

const PAUSE_BETWEEN = 1000;

// Queue of save tasks
export default async.cargo(async (tasks, callback) => {
	let universeId = tasks[0].universeId;

	// merge all the tasks together by instance
	const data = tasks.reduce((instances, { data }) => {
		let instanceId;

		for (instanceId in data) {
			instances[instanceId] = merge(instances[instanceId] || {}, data[instanceId]);
		}
		return instances;
	}, {});

	let flatData = [];
	let instanceId;
	for (instanceId in data) {
		flatData.push({
			id: instanceId,
			changes: flatten(data[instanceId])
		});
	}

	const json = await DB.fetch(`universes/${universeId}/instances`, "PUT", { body: flatData });

	console.log(json);
	//return data.result;
	//if (error).result this.setState({ error });

	// take a break, then say we're done
	if (callback) {
		setTimeout(() => callback(json), PAUSE_BETWEEN);
	}
});

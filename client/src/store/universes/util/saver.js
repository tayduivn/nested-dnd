import async from "async";

import DB from "util/DB";
import flatten from "util/flatten";

// this is an exceptional case. idk
import store from "store";
import { changeInstanceReceived } from "../actions/exploreActions";

const PAUSE_BETWEEN = 3000;

// Queue of save tasks
// THIS CANNOT BE AN ASYNC function so that the pause will work
export default async.cargo((tasks, callback = () => {}) => {
	// merge all the tasks together by universe
	const u = tasks.reduce((u, { universe_id, instance_id, changes = {} }) => {
		if (!u[universe_id]) u[universe_id] = [];
		const flatChanges = flatten(changes);
		u[universe_id].push({ instance_id, changes: flatChanges });
		return u;
	}, {});

	const uIdArr = Object.keys(u);

	const promises = uIdArr.map(universe_id => {
		return DB.fetch(`universes/${universe_id}/instances`, "PUT", { body: u[universe_id] });
	});

	// send out all the universe changes simultaneously
	Promise.all(promises).then(universeResults => {
		universeResults.forEach((universeTasks, i) => {
			const originalUniverse = u[uIdArr[i]];
			universeTasks.forEach((json, j) => {
				const originalTask = originalUniverse[j];
				store.dispatch(changeInstanceReceived(uIdArr[i], originalTask, json));
			});
		});

		// take a break, then say we're done.
		setTimeout(() => callback(), PAUSE_BETWEEN);
	});
});

import merge from "./merge";

export default function reduceObjToArray(state = [], data) {
	let newState = [...state];

	// TODO eslint error
	// eslint-disable-next-line
	for (let i in data) {
		//we are deleting
		if (!data[i]) newState[i] = null;
		else newState[i] = merge(newState[i], data[i]);
	}

	// We increment in reverse so we can splice the null (deleted) values
	let i = newState.length;
	while (i--) {
		if (!newState[i]) newState.splice(i, 1);
	}
	return newState;
}

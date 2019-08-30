import processInSort from "../util/processInSort";
import { selectAncestorsAndStyle } from "../selectors";
import { ADD, SORT, DELETE_LINK } from "util/const";

function removeDeletedAndNew(inArr) {
	return (inArr && [].concat(inArr.filter(child => child && !child.isNew))) || [];
}

const doDeleteLink = (inArr, value) => {
	//const currentInArr = [...inArr];
	var deleteIndex = value;

	return inArr.map(c => c && c.index).filter(c => c && typeof c !== "string" && c !== deleteIndex);
};

function processOneProperty(p, v, inArr) {
	let property = p,
		value = v;
	if (property === SORT) {
		property = "in";
		value = processInSort(removeDeletedAndNew(inArr), value);
	} else if (property === DELETE_LINK) {
		property = "in";
		value = doDeleteLink(removeDeletedAndNew(inArr), value);
	} else if (property === "in") {
		value = removeDeletedAndNew(value);
	} else if (property === "up") {
		value = parseInt(value, 10);
	} else if (property === ADD) {
		// add link, so just append to in and send that
		const linkNum = parseInt(value, 10);
		if (Number.isInteger(linkNum)) {
			property = "in";
			value = [...removeDeletedAndNew(inArr).map(c => c && c.n), linkNum];
		}
	}
	return { property, value };
}

export default function handleChangeClean(data = {}, oldInstance, instance_id, state) {
	const changes = {};

	// processes each item
	Object.keys(data).forEach(key => {
		const { property, value } = processOneProperty(key, data[key], oldInstance.in);
		changes[property] = value;
	});

	//add additional if needed

	if (changes.cls) {
		// reset to parent value if reset
		changes.txt = null;
	}
	// if we set txt, it has to have a class.
	// TODO: do this on the back end
	if (changes.txt && !oldInstance.cls) {
		const { cls } = selectAncestorsAndStyle(instance_id, state.universes.instances);
		// reset to parent value if reset
		changes.cls = cls;
	}
	return changes;
}

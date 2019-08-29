import processInSort from "../util/processInSort";

function removeDeletedAndNew(inArr) {
	return (inArr && [].concat(inArr.filter(child => child && !child.isNew))) || [];
}

const doDeleteLink = (inArr, value) => {
	//const currentInArr = [...inArr];
	var deleteIndex = value;

	return inArr.map(c => c && c.index).filter(c => c && typeof c !== "string" && c !== deleteIndex);
};

export default function handleChangeClean(p, v, inArr) {
	let property = p,
		value = v;
	if (property === "sort") {
		property = "in";
		value = processInSort(removeDeletedAndNew(inArr), value);
	} else if (property === "deleteLink") {
		property = "in";
		value = doDeleteLink(removeDeletedAndNew(inArr), value);
	} else if (property === "in") {
		value = removeDeletedAndNew(value);
	} else if (property === "up") {
		value = parseInt(value, 10);
	} else if (property === "add") {
		// add link, so just append to in and send that
		const linkNum = parseInt(value, 10);
		if (Number.isInteger(linkNum)) {
			property = "in";
			value = [...removeDeletedAndNew(inArr).map(c => c && c.n), linkNum];
		}
	}
	return { property, value };
}

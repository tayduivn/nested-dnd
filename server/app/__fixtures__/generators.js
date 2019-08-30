const mongoose = require("mongoose");
const ObjectId = mongoose.mongo.ObjectId;

module.exports = {
	tavern: {
		_id: ObjectId("5aad9b5b63cc6f338cf5709c"),
		isa: "tavern",
		extends: "building",
		name: {
			value: ObjectId("5aad81da2617df0c845965b4"),
			type: "table_id"
		},
		style: {
			icon: { value: "svg game-icons/lorc/beer-stein" },
			txt: { value: "brown" },
			pattern: { value: "purty-wood" },
			bg: { value: "wood-200" }
		},
		in: [
			{ amount: { max: 5, min: 1 }, type: "generator", value: "seated table" },
			{ amount: { max: 4, min: 0 }, type: "generator", value: "table" },
			{ type: "generator", value: "bar" },
			{ type: "generator", value: "hearth" },
			{ amount: { max: 1, min: 0 }, type: "generator", value: "bard" },
			{ amount: { max: 1 }, type: "generator", value: "bounty board" },
			{ amount: { max: 3, min: 0 }, type: "generator", value: "bedroom" },
			{ amount: { max: 3, min: 0 }, type: "generator", value: "bedroom (occupied)" },
			{ type: "generator", value: "the morning after" }
		],
		pack: ObjectId("5aac89021d9de21d4c482c35"),
		__v: 196,
		chooseRandom: false,
		desc: [{ type: "table_id", value: ObjectId("5b866bfb065efeebd40bed37") }]
	}
};

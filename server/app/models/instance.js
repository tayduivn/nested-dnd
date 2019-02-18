const Schema = require("mongoose").Schema;

const Nested = require("../routes/packs/nested");

const flatInstanceSchema = Schema(
	{
		name: String,
		isa: String,
		txt: {
			type: String,
			set: v => (!v ? undefined : v),
			get: v => (!v ? undefined : v)
		},
		cssClass: {
			type: String,
			set: v => (!v ? undefined : v),
			get: v => (!v ? undefined : v)
		},
		icon: {
			type: {
				category: {
					$type: String,
					enum: ["icon", "img", "char"],
					default: "icon"
				},
				value: {
					type: String
				}
			}
		},
		up: Number,
		todo: Boolean,
		desc: [String],
		in: {
			type: [Number],
			default: void 0,
			set: value => {
				if (!value) value = undefined;
				return value;
			}
		},
		isNestedSeed: Boolean,
		data: Schema.Types.Mixed
	},
	{ _id: false }
);

// clean up from old type
flatInstanceSchema.pre("init", doc => {
	if (typeof doc.icon === "string") {
		if (doc.icon.startsWith("http")) {
			doc.icon = {
				category: "img",
				value: doc.icon
			};
			return;
		}
		const parts = doc.icon.split(" ");
		let type = parts[0];
		let value = parts[1];
		if (parts[0] !== "svg" && parts[0] !== "text") {
			type = "svg";
			value = doc.icon;
		}
		doc.icon = {
			category: type === "svg" ? "icon" : "char",
			value: value
		};
	}
	// fix icon is actually a url
	else if (doc.icon && doc.icon.value && doc.icon.value.startsWith("http")) {
		doc.icon.category = "img";
	}
	if (doc.img)
		doc.icon = {
			category: "img",
			value: doc.img
		};
});

/**
 * Should return a Nested
 * @param  {[type]} generations [description]
 * @return {[type]}             [description]
 */
flatInstanceSchema.methods.expand = function(generations) {
	var inArr = this.in || [];
	var arr = this.parent().array;

	var node = Nested.copy(this);
	node.up = expandUp.call(this);

	// copy style from parent if it is the currently displayed node
	if (generations > 0 && !node.cssClass && node.up) {
		node.cssClass = node.up[0].cssClass;
		node.txt = node.up[0].txt;
	}

	if (!generations || generations < 1) {
		node.in = (inArr && inArr.length ? true : undefined) || this.todo;
		return node;
	}

	node.in = [];
	inArr.forEach((c, i) => {
		c = parseInt(c, 10);

		var cInst = arr[c];
		if (!cInst) return;

		cTree = cInst.expand(generations - 1);
		cTree.index = c;
		cTree.up = expandUp.call(cInst);

		node.in[i] = cTree;
	});

	if (!node.in.length) {
		node.in = undefined;
	}
	if (this.todo) {
		node.in = true;
	}

	return node;
};

/**
 * Populate up with ancestor array from just a parent index
 * @param {Object} node the node to add up to
 */
function expandUp() {
	//don't have ancestors
	if (typeof this.up === "undefined" || this.up === null) return undefined;
	if (this.up instanceof Array) {
		if (!this.up.length) {
			//don't have ancestors
			this.up = undefined;
			return undefined;
		}
		var nestedUp = [].concat(this.up);
		this.up = this.up[0].index;
		return nestedUp;
	}

	const arr = this.parent().array;
	var upIndex = this.up;
	var isParent = true;
	var up = [];

	while (typeof upIndex !== "undefined") {
		if (isNaN(upIndex)) {
			throw new Error();
		}

		var ref = arr[upIndex];
		if (!ref) {
			upIndex = undefined;
			continue;
		}

		var ancestor = Nested.getAncestor(ref, isParent);
		ancestor.index = upIndex;
		isParent = false;
		upIndex = ref.up;

		if (up.find(a => a.index === upIndex)) {
			// infinite loop
			upIndex = ref.up = undefined;
		} else {
			up.push(ancestor);

			// set cssClass and txt
			if (!up[0].cssClass) {
				up[0].cssClass = ref.cssClass;
				up[0].txt = ref.txt;
			}
		}
	}

	return up;
}

module.exports = { flatInstanceSchema };

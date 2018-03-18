const Schema = require("mongoose").Schema;

const Maker = require('./make');

var styleSchema = Schema({
	icon: {
		type: String, // tableid string table -- if no type, it's a string
		value: Schema.Types.Mixed
	},

	img: {
		type: String,
		value: Schema.Types.Mixed
	}, 

	// todo: check hex or valid color name
	txt: {
		type: String, // tableid string table -- if no type, it's a string
		value: Schema.Types.Mixed
	},

	// todo: check hex or valid color name
	bg: {
		type: String, // tableid string table -- if no type, it's a string
		value: Schema.Types.Mixed
	},

	pattern: {
		type: String,
		value: Schema.Types.Mixed
	},

	// if the generated name will affect the color
	// TODO: use to generate background color
	noAutoColor: Boolean
}, { typeKey: "$type", _id: false });

styleSchema.methods.makeTextColor = async function(){
	return Maker.makeMixedThing(this.txt, this.parent().model('Table'))
};

styleSchema.methods.makeBackgroundColor = async function(){
	return Maker.makeMixedThing(this.bg, this.parent().model('Table'))
};

styleSchema.methods.makeIcon = async function(){
	return Maker.makeMixedThing(this.icon, this.parent().model('Table'))
};

styleSchema.methods.makeImage = async function(){
	return Maker.makeMixedThing(this.img, this.parent().model('Table'))
};

styleSchema.methods.makePattern = async function(){
	return Maker.makeMixedThing(this.pattern, this.parent().model('Table'))
};

module.exports = styleSchema;
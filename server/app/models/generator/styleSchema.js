const Schema = require("mongoose").Schema;
const Maker = require('./make')

var styleSchema = Schema({
	icon: {
		type: String, // tableid string table -- if no type, it's a string
		value: Schema.Types.Mixed
	},

	imgURL: String, 

	// todo: check hex or valid color name
	textColor: {
		type: String, // tableid string table -- if no type, it's a string
		value: Schema.Types.Mixed
	},

	// todo: check hex or valid color name
	backgroundColor: {
		type: String, // tableid string table -- if no type, it's a string
		value: Schema.Types.Mixed
	},

	// if the generated name will 
	stopAutoColor: Boolean
}, { typeKey: "$type", _id: false });

styleSchema.virtual('makeTextColor').get(function(){
	return Maker.makeMixedThing(this.textColor, this.parent().model('Table'))
});
styleSchema.virtual('makeBackgroundColor').get(function(){
	return Maker.makeMixedThing(this.backgroundColor, this.parent().model('Table'))
});
styleSchema.virtual('makeIcon').get(function(){
	return Maker.makeMixedThing(this.icon, this.parent().model('Table'))
});

module.exports = styleSchema;
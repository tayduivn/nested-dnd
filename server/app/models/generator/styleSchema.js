const Schema = require("mongoose").Schema;

const Maker = require('./make');

function validateMixedThing(input){
	if(input.type === 'table' && typeof input.value === 'string')
		input.type = 'string'
	if(input.type === 'string' && typeof input.value !== 'string'){
		if(input.value.rows) input.type = 'table'
		else throw Error("cannot set name to value "+input.value)
	}
	return input;
}

var mixedTypeSchema = Schema({
	type: String, // tableid string table -- if no type, it's a string
	value: Schema.Types.Mixed
}, { typeKey: '$type' })

var styleSchema = Schema({
	icon: {
		type: mixedTypeSchema,
		set: validateMixedThing
	},

	img: {
		type: mixedTypeSchema,
		set: validateMixedThing
	}, 

	// todo: check hex or valid color name
	txt: {
		type: mixedTypeSchema,
		set: validateMixedThing
	},

	// todo: check hex or valid color name
	bg: {
		type: mixedTypeSchema,
		set: validateMixedThing
	},

	pattern: {
		type: mixedTypeSchema,
		set: validateMixedThing
	},

	// if the generated name will affect the color
	// TODO: use to generate background color
	noAutoColor: Boolean
}, { _id: false });

styleSchema.path('icon').set(validateMixedThing);

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

// TODO
styleSchema.methods.strToColor = function(str) {
	if(typeof str !== 'string') return '';

	var colors = "multicolored|opaline|rainbow|red|magenta|orange|yellow|teal|green|blue|turquoise|purple|gold|golden|glowing|shimmering|luminous|faint|white|black|brown|pale|silver|silvery|gray|tan|grey|pink|shady|sharkverse|baconverse|doughnutverse|lasagnaverse";

	str = " "+str.replace(/-/g," ")+" ";
	var matches = str.match("^.*\\s("+colors+")\\s.*$");
	if(!matches) matches = str.match("^.*\\s("+colors+")ish\\s.*$");
	if(matches && matches[1])
		str = matches[1];
	else
		return "";

	if(str === "tan") str = 'khaki';
	if(str === "silvery") str = "silver";
	if(str === "red") str = "darkred";
	if(str === "shady") str = "grey";
	if(str === "blue") str = "darkblue";
	if(str === "multicolored") str = "rainbow";
	if(str === "golden") str = "gold";
	if(str === "shimmering" || str === "glowing" || str === "luminous") str = "glow";
	if(str === "faint" || str === "pale") str = "white";
	if(str === "opaline") str = "floralwhite";

	return str.trim();
}

module.exports = styleSchema;
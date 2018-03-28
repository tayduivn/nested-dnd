const Schema = require("mongoose").Schema;

const Maker = require('./make');

const colorConvert = {
	tan: 'khaki',
	silvery: 'silver',
	red: 'darkred',
	shady: "grey",
	blue: "darkblue",
	multicolored: "rainbow",
	golden: "gold",
	shimmering: "glow",
	glowing: "glow",
	luminous: "glow",
	faint: "white",
	pale: "white",
	opaline: "floralwhite"
}

var mixedTypeSchema = Schema({
	type: {
		$type: String,
		enum: ['table_id', 'string', 'table'] // if no type, it's a string
	}, 
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
	return makeIt.call(this, this.txt);
};

styleSchema.methods.makeBackgroundColor = async function(){
	return makeIt.call(this, this.bg);
};

styleSchema.methods.makeIcon = async function(){
	return makeIt.call(this, this.icon);
};

styleSchema.methods.makeImage = async function(){
	return makeIt.call(this, this.img);
};

styleSchema.methods.makePattern = async function(){
	return makeIt.call(this, this.pattern);
};

styleSchema.methods.strToColor = function(str) {
	if(typeof str !== 'string')
		return false;

	var colors = "multicolored|opaline|rainbow|red|magenta|orange|yellow|teal|green|blue|turquoise|purple|gold|golden|glowing|shimmering|luminous|faint|white|black|brown|pale|silver|silvery|gray|tan|grey|pink|shady|sharkverse|baconverse|doughnutverse|lasagnaverse";

	str = " "+str.replace(/-/g," ")+" ";
	var matches = str.match("^.*\\s("+colors+")\\s.*$");
	if(!matches) matches = str.match("^.*\\s("+colors+")ish\\s.*$");
	if(matches && matches[1])
		str = matches[1];
	else
		return false;

	str = str.trim();

	for(var oldColor in colorConvert){
		if(str === oldColor)
			str = colorConvert[oldColor];
	}

	return str.length ? str : false;
}

function makeIt(value){
	return Maker.makeMixedThing(value, this.parent().model('Table'));
}

function validateMixedThing(input){
	var { type, value } = input;

	if(type === 'table' && typeof value === 'string')
		input.type = 'string'
	if(type === 'string' && typeof value !== 'string'){
		if(value.rows) input.type = 'table'
		else throw Error("cannot set name to value "+value)
	}
	return input;
}

module.exports = styleSchema;
module.exports.validateMixedThing = validateMixedThing;
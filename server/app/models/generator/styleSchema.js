const Schema = require("mongoose").Schema;
var colorConvert = require('../../util/colorConvert');

const Maker = require('./make');
const Table = require("../table");

colorConvert = Object.assign({}, colorConvert, {
	tan: colorConvert['khaki'],
	silvery: colorConvert['silver'],
	red: colorConvert['darkred'],
	shady: colorConvert["grey"],
	blue: colorConvert["darkblue"],
	multicolored: "grey-100 ptn-rainbow",
	golden: colorConvert["gold"],
	shimmering: "grey-1000 ptn-glow",
	glowing: "grey-1000 ptn-glow",
	luminous: "grey-1000 ptn-glow",
	faint: colorConvert["white"],
	pale: colorConvert["white"],
	opaline: "amber-50"
});

var mixedTypeSchema = Schema({
	type: {
		$type: String,
		enum: ['table_id', 'string', 'table','data'] // if no type, it's a string
	}, 
	value: Schema.Types.Mixed
}, { typeKey: '$type', _id: false })

var styleSchema = Schema({
	icon: {
		type: mixedTypeSchema,
		set: validateMixedThing
	},

	img: {
		type: mixedTypeSchema,
		set: validateMixedThing
	},

	useImg: Boolean,

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

	var colors = "multicolored|opaline|rainbow|red|magenta|orange|yellow|teal|green|blue|turquoise|purple|gold|golden|glowing|shimmering|luminous|faint|white|black|brown|pale|silver|silvery|gray|tan|grey|pink|shady|sharkverse|baconverse|doughnutverse|lasagnaverse|"+Object.keys(colorConvert).join("|");

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

// this is a setter, not a validator
function validateMixedThing(input){
	if(input === null) {
		return undefined;
	}
	if(input.value === null){
		input.value = undefined;
		return input;
	}

	if(typeof input === 'string'){
		return { type: 'string', value: input }
	}

	if(input.type === 'table'){
		if(typeof input.value === 'string'){
			input.type = 'string'
		}
		else if(input.rows && input.rows.length === 1 && typeof input.rows[0] === 'string'){
			input = {type:string, value: input.rows[0]};
		}
		else{ // validate against table schema
			var t = new Table(input.value);
			input.value = t.toJSON();
			delete input.value._id;
			delete input.value.pack;
			delete input.value.public;
		}
		
	}
	else if(input.type === 'string' 
		&& typeof input.value !== 'string' 
		&& input.value !== undefined){

		if(input.value && input.value.rows) input.type = 'table'
		else throw Error("cannot set name to value "+value)
	}
	return input;
}

module.exports = styleSchema;
module.exports.validateMixedThing = validateMixedThing;
module.exports.mixedTypeSchema = mixedTypeSchema;
import React from 'react'
import Color from 'color-js';

var Styler = {};

var html5colors = [
	"black","dimgray","gray","darkgray","silver","lightgray","gainsboro","whitesmoke","white",
	"slategray","lightslategray","lightsteelblue","lightblue","powderblue","paleturquoise","lightcyan","azure","mintcream","peachpuff",
	"bisque","blanchedalmond","papayawhip","antiquewhite","linen","oldlace","cornsilk","khaki","palegoldenrod","beige",
	"lemonchiffon","lightgoldenrodyellow","lightyellow","rosybrown","thistle","lavender","aliceblue","ghostwhite","snow","tan","burlywood",
	"wheat","navajowhite","moccasin","indianred","palevioletred","lightpink","pink","mistyrose","lavenderblush","seashell","floralwhite",
	"ivory","darkviolet","blueviolet","darkorchid","mediumorchid","orchid","violet","plum","mediumpurple","mediumslateblue","slateblue",
	"darkslateblue","darkslategray","teal","darkcyan","lightseagreen","darkturquoise","mediumturquoise","turquoise","cyan","aquamarine","palegreen",
	"lightgreen","mediumaquamarine","darkseagreen","darkkhaki","goldenrod","peru","chocolate","sienna","saddlebrown","maroon","darkred","brown",
	"firebrick","crimson","red","orangered","tomato","coral","lightcoral","salmon","darksalmon","sandybrown","lightsalmon","darkorange","orange",
	"gold","yellow","greenyellow","chartreuse","lawngreen","mediumspringgreen","springgreen","lime","limegreen","mediumseagreen","seagreen","forestgreen",
	"green","darkgreen","darkolivegreen","olive","olivedrab","yellowgreen","skyblue","lightskyblue","deepskyblue","dodgerblue","cornflowerblue",
	"royalblue","cadetblue","steelblue","blue","mediumblue","darkblue","navy","midnightblue","indigo","purple","darkmagenta","mediumvioletred",
	"deeppink","magenta","ocean"
];
var customClasses = ["rainbow","ocean","glow", "colorchange"];

var colorOptions = null;

Styler.selectClear = function(){
	return <i className="glyphicon glyphicon-remove" />
}

Styler.getHexcodes = function(){
	var hexcodes = []
	html5colors.forEach(function(color){
		hexcodes.push(Color(color).toCSS());
	});
	console.log(hexcodes.join("\",\""));
}

function getColorOptions(){
	if(!colorOptions){
		var colors = ([]).concat(html5colors);
		colors.sort(function(a,b){
			return Color(a).getLuminance() - Color(b).getLuminance();
		});
		colorOptions = colors.map((color) => { return { value: color, label: color } });
	}
	return colorOptions;
}

Styler.getColorSwatches = ()=>{
	var colors = ([]).concat(html5colors);
	colors.sort(function(a,b){
		return Color(a).getHue() - Color(b).getHue();
	});
	return colors;
}

Styler.getBackgroundOptions = function(originalOption){

	var colors = getColorOptions(originalOption).concat(customClasses.map((color) => { return { value: color, label: color } }));

	if(originalOption && !html5colors.concat(customClasses).includes(originalOption)){
		return colors.concat([{
			value:originalOption,
			label:originalOption
		}])
	}
	return ([{label:"default",value:"default"}]).concat(colors);
}

Styler.getColorOptions = function(originalOption){
	var colors = getColorOptions(originalOption)

	if(originalOption && !html5colors.includes(originalOption)){
		return colors.concat([{
			value:originalOption,
			label:originalOption
		}])
	}

	return ([{label:"default",value:"default"}]).concat(colors);
}

Styler.renderColorOption = function(option){
	return (
		<div><i className={"fa fa-2x fa-square "+option.label}></i>  {option.label}</div>
	);
}

function shift(c, amount){
	var lightness = c.getLightness();
	if(c.getLightness() > 0.49){
		if(lightness > .6) amount+=.15;
		if(lightness > .9) amount+=.3;
		return c.darkenByAmount(amount);
	}
	return c.lightenByAmount(amount);
}

Styler.getShadow = function(color){
	if(!color) return "";

	color = shift(Color(color), .35);
	var shadow = color.toCSS();
	
	return {
		stroke: "1px "+shadow,
		h1BG: shadow,
		shadow: "-2px -2px 5px "+shadow
			+", 2px -2px 5px "+shadow
			+", -2px 2px 5px "+shadow
			+", 2px 2px 5px "+shadow
	}
};

Styler.cleanColor = function(color, name){

	if(typeof color !== "string"){
		// null is acceptible - prevents isa from overwriting
		return (color === null) ? null : undefined;
	}

	color = color.toLowerCase();

	return color;
}


export default Styler;
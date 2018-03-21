import React from 'react'
import Color from 'color-js';

var Styler = {};

var html5colors = [];
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
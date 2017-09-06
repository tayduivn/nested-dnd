import React from 'react'
import Color from 'color-js';

var Styler = {};

var html5colors = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgray","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
var html5hexcodes = ["#F0F8FF","#FAEBD7","#00FFFF","#7FFFD4","#F0FFFF","#F5F5DC","#FFE4C4","#000000","#FFEBCD","#0000FF","#8A2BE2","#A52A2A","#DEB887","#5F9EA0","#7FFF00","#D2691E","#FF7F50","#6495ED","#FFF8DC","#DC143C","#00FFFF","#00008B","#008B8B","#A9A9A9","#006400","#BDB76B","#8B008B","#556B2F","#FF8C00","#9932CC","#8B0000","#E9967A","#8FBC8F","#483D8B","#2F4F4F","#00CED1","#9400D3","#FF1493","#00BFFF","#696969","#1E90FF","#B22222","#FFFAF0","#228B22","#FF00FF","#DCDCDC","#F8F8FF","#FFD700","#DAA520","#808080","#008000","#ADFF2F","#CD5C5C","#4B0082","#FFFFF0","#F0E68C","#E6E6FA","#FFF0F5","#7CFC00","#FFFACD","#ADD8E6","#F08080","#E0FFFF","#FAFAD2","#D3D3D3","#90EE90","#FFB6C1","#FFA07A","#20B2AA","#87CEFA","#778899","#B0C4DE","#FFFFE0","#00FF00","#32CD32","#FAF0E6","#FF00FF","#800000","#66CDAA","#0000CD","#BA55D3","#9370D8","#3CB371","#7B68EE","#00FA9A","#48D1CC","#C71585","#191970","#F5FFFA","#FFE4E1","#FFE4B5","#FFDEAD","#000080","#FDF5E6","#808000","#6B8E23","#FFA500","#FF4500","#DA70D6","#EEE8AA","#98FB98","#AFEEEE","#D87093","#FFEFD5","#FFDAB9","#CD853F","#FFC0CB","#DDA0DD","#B0E0E6","#800080","#FF0000","#BC8F8F","#4169E1","#8B4513","#FA8072","#F4A460","#2E8B57","#FFF5EE","#A0522D","#C0C0C0","#87CEEB","#6A5ACD","#708090","#FFFAFA","#00FF7F","#4682B4","#D2B48C","#008080","#D8BFD8","#FF6347","#40E0D0","#EE82EE","#F5DEB3","#FFFFFF","#F5F5F5","#FFFF00","#9ACD32"];
var customClasses = ["rainbow","ocean","glow", "colorchange"];
var allClasses = html5colors.concat(customClasses);

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

Styler.cleanColor = function(color, name){

	if(typeof color !== "string"){
		// null is acceptible - prevents isa from overwriting
		return (color === null) ? null : undefined;
	}

	color = color.toLowerCase();

	return color;
}

Styler.getClass = function(instanceName, icon, thing, isa, parent){
	var cssClass = (thing.autoColor || thing.autoColor === undefined) ? strToColor(instanceName) : "";
	var background = thing.getBackground(isa);
	var textColor = thing.getTextColor(isa);
	var index = html5hexcodes.indexOf(background);
	
	if(cssClass !== ""){
		//was autocolored
		textColor = null;
	}
	else if(allClasses.includes(background)){
		cssClass = background;
	}
	else if ( index !== -1 ){
		cssClass = html5colors[index];
	}
	else if(background){  //add class
		cssClass = addThing(instanceName, background, textColor);
	}
	else if(parent){
		cssClass = parent.cssClass;
		if(parent.textColor)
			textColor = Color(parent.textColor).darkenByAmount((Math.random()/10)-0.05).toCSS();
	}

	if(!icon || icon.length === 0 || (icon.trim && icon.trim().length === 0)){
		cssClass += " empty";
	}

	return { cssClass, textColor };
}

function strToColor(str){
	var colors = "multicolored|opaline|rainbow|red|magenta|orange|yellow|teal|green|blue|turquoise|purple|gold|golden|glowing|shimmering|luminous|faint|white|black|brown|pale|silver|silvery|grey|pink|shady|sharkverse|baconverse|doughnutverse|lasagnaverse";

	str = " "+str.replace(/-/g," ")+" ";
	var matches = str.match("^.*\\s("+colors+")\\s.*$");
	if(!matches) matches = str.match("^.*\\s("+colors+")ish\\s.*$");
	if(matches && matches[1])
		str = matches[1];
	else
		return "";

	if(str === "silvery") return "silver";
	if(str === "red") return "darkred";
	if(str === "shady") return "grey";
	if(str === "blue") return "darkblue";
	if(str === "multicolored") return "rainbow";
	if(str === "golden") return "gold";
	if(str === "shimmering" || str === "glowing" || str === "luminous") return "glow";
	if(str === "faint" || str === "pale") return "white";
	if(str === "opaline") return "floralwhite";

	return str.trim();
}

var addThing = (function(){
	var rules = [];

	function shift(c, amount){
		if(c.getLightness() > 0.49){
			if(amount > .3) amount-=.2;
			return c.darkenByAmount(amount);
		}
		return c.lightenByAmount(amount);
	}

	function makeSafeForCSS(name) {
		var str = ""+name;
		if(!isNaN(str[0]))
			str = "_"+str;

	  return str.replace(/[^a-z0-9]/g, function(s) {
	      var c = s.charCodeAt(0);
	      if (c === 32) return '-';
	      if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
	      return '__' + ('000' + c.toString(16)).slice(-4);
	  });
	}

	function createCSSSelector(selector, style) {
		if (!document.styleSheets) return;
		if (document.getElementsByTagName('head').length === 0) return;

		var styleSheet,mediaType;

		if (document.styleSheets.length > 0) {
			for (var i = document.styleSheets.length-1; i >= 0; i--) {
				if (document.styleSheets[i].disabled) 
					continue;
				var media = document.styleSheets[i].media;
				mediaType = typeof media;

				if (mediaType === 'string') {
					if (media === '' || (media.indexOf('screen') !== -1)) {
						styleSheet = document.styleSheets[i];
					}
				}
				else if (mediaType==='object') {
					if (media.mediaText === '' || (media.mediaText.indexOf('screen') !== -1)) {
						styleSheet = document.styleSheets[i];
					}
				}

				if (typeof styleSheet !== 'undefined') 
					break;
			}
		}

		if (typeof styleSheet === 'undefined') {
			var styleSheetElement = document.createElement('style');
			styleSheetElement.type = 'text/css';
			document.getElementsByTagName('head')[0].appendChild(styleSheetElement);

			for (i = 0; i < document.styleSheets.length; i++) {
				if (document.styleSheets[i].disabled) {
					continue;
				}
				styleSheet = document.styleSheets[i];
			}

			mediaType = typeof styleSheet.media;
		}

		if (mediaType === 'string') {
			var l;
			for (i = 0, l = styleSheet.rules.length; i < l; i++) {
				if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase()===selector.toLowerCase()) {
					styleSheet.rules[i].style.cssText = style;
					return;
				}
			}
			styleSheet.addRule(selector,style);
		}
		else if (mediaType === 'object') {
			var styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
			for (i = 0; i < styleSheetLength; i++) {
				if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() === selector.toLowerCase()) {
					styleSheet.cssRules[i].style.cssText = style;
					return;
				}
			}
			styleSheet.insertRule(selector + '{' + style + '}', styleSheetLength);
		}
	};

	return function(name, background, textColor){
		var className = makeSafeForCSS(name);

		var found = rules.find((r) => r.rule === background);
		if(found){
			return found.className;
		}

		allClasses.push(className);
		rules.push({
			className: className,
			rule: background
		})

		var bg = Color(background.split(" ")[0]);
		var hover = shift(bg,0.05);
		var border = hover;
		var color = (textColor) ? Color(textColor) : shift(bg,0.5);

		var c="."+className;
		var btn=c+".parent .btn.btn-default";
		var dropdown=c+".parent .dropdown-menu";
		var dropdownItem= dropdown+" > li > a";
		var btnBG = shift(bg,0.1);

		createCSSSelector(c, 
			"background:"+background+";"+
			"color:"+color.toCSS()+";"
		);
		createCSSSelector(c+".link.child-inner:hover", 
			"background:"+background+";"+
			"color:"+color.toCSS()+";"+
			"opacity:0.75;"
		);
		createCSSSelector(btn,
			"background:"+background+";"+
			"border-color:"+border.toCSS()
		);
		createCSSSelector(btn+":focus,"+btn+".focus",
			"background-color:"+shift(btnBG,0.1).toCSS()+";"+
			"border-color:"+shift(btnBG,0.25).toCSS()
		);
		createCSSSelector(btn+":hover,"+btn+":active,"+btn+":active, .open > .dropdown-toggle",
			"background-color:"+shift(btnBG,0.1).toCSS()+";"+
			"border-color:"+shift(btnBG,0.12).toCSS()
		);
		createCSSSelector(dropdown,
			"background-color:"+bg.toCSS()+";"+
			"border-color:"+border.toCSS()
		);
		createCSSSelector(dropdownItem+":hover",
			"background-color:"+shift(hover,0.05).toCSS()+";"
		);

		return className;
	}
})();


export default Styler;
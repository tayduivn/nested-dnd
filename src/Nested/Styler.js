import Color from 'color-js';

var Styler = {};


var html5colors = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgray","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];

Styler.getHexcodes = function(){
	var hexcodes = []
	html5colors.forEach(function(color){
		hexcodes.push(Color(color).toCSS());
	});
	console.log(hexcodes.join(","));
}

Styler.getClass = function(thing){
	if(html5colors.includes(thing.background)){
		return thing.background;
	}

	var str = ""+thing.name;
	if(!isNaN(str[0]))
		str = "_"+str;
	str = makeSafeForCSS(str);
	return str;
}

Styler.strToColor = function(str){
	var colors = "multicolored|rainbow|red|magenta|orange|yellow|teal|green|blue|blueish|turquoise|purple|gold|golden|faint|white|black|brown|pale|silver|grey|pink";

	var matches = str.match("^.*\\s("+colors+")\\s.*$")
	if(!matches) matches = str.match("^("+colors+")\\s.*$");
	if(!matches) matches = str.match("^.*\\s("+colors+")$");
	if(matches && matches[1])
		return matches[1];

	return "";
}

Styler.addThing = function(thing){
	if(thing.background && !html5colors.includes(thing.cssClass)){
		var bg = Color(thing.background.split(" ")[0]);
		var hover = shift(bg,0.05);
		var border = hover;
		var color = (thing.textColor) ? thing.textColor : shift(bg,0.5);

		var c="."+thing.cssClass;
		var btn=c+".parent .btn.btn-default";
		var dropdown=c+".parent .dropdown-menu";
		var dropdownItem= dropdown+" > li > a";
		var btnBG = shift(bg,0.1);
		createCSSSelector(c, 
			"background:"+thing.background+";"+
			"background-color:"+bg.toString()+";"+
			"color:"+color.toString()+";"
		);
		createCSSSelector(btn,
			"background:"+thing.background+";"+
			"border-color:"+border.toString()
		);
		createCSSSelector(btn+":focus,"+btn+".focus",
			"background-color:"+shift(btnBG,0.1).toString()+";"+
			"border-color:"+shift(btnBG,0.25).toString()
		);
		createCSSSelector(btn+":hover,"+btn+":active,"+btn+":active, .open > .dropdown-toggle",
			"background-color:"+shift(btnBG,0.1).toString()+";"+
			"border-color:"+shift(btnBG,0.12).toString()
		);
		createCSSSelector(dropdown,
			"background-color:"+bg.toString()+";"+
			"border-color:"+border.toString()
		);
		createCSSSelector(dropdownItem+":hover",
			"background-color:"+shift(hover,0.05).toString()+";"
		);
	}

	function shift(c, amount){
		if(c.getLightness() > 0.5){
			return c.darkenByAmount(amount);
		}
		return c.lightenByAmount(amount);
	}
}
/*
@mixin button-variant($color, $background, $border) {
  color: $color;
  background-color: $background;
  border-color: $border;

  &:focus,
  &.focus {
    color: $color;
    background-color: darken($background, 10%);
        border-color: darken($border, 25%);
  }
  &:hover {
    color: $color;
    background-color: darken($background, 10%);
        border-color: darken($border, 12%);
  }
  &:active,
  &.active, .open > .dropdown-toggle {
    color: $color;
    background-color: darken($background, 10%);
        border-color: darken($border, 12%);

    &:hover,
    &:focus,
    &.focus {
      color: $color;
      background-color: darken($background, 17%);
          border-color: darken($border, 25%);
    }
  }
  &:active,
  &.active,
  .open > .dropdown-toggle {
    background-image: none;
  }
  &.disabled,
  &[disabled],
  fieldset[disabled] & {
    &:hover,
    &:focus,
    &.focus {
      background-color: $background;
          border-color: $border;
    }
  }

  .badge {
    color: $background;
    background-color: $color;
  }
}*/

function makeSafeForCSS(name) {
  return name.replace(/[^a-z0-9]/g, function(s) {
      var c = s.charCodeAt(0);
      if (c == 32) return '-';
      if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
      return '__' + ('000' + c.toString(16)).slice(-4);
  });
}

function createCSSSelector(selector, style) {
	if (!document.styleSheets) return;
	if (document.getElementsByTagName('head').length == 0) return;

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
			else if (mediaType=='object') {
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
		for (var i = 0, l = styleSheet.rules.length; i < l; i++) {
			if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase()==selector.toLowerCase()) {
				styleSheet.rules[i].style.cssText = style;
				return;
			}
		}
		styleSheet.addRule(selector,style);
	}
	else if (mediaType === 'object') {
		var styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
		for (var i = 0; i < styleSheetLength; i++) {
			if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
				styleSheet.cssRules[i].style.cssText = style;
				return;
			}
		}
		styleSheet.insertRule(selector + '{' + style + '}', styleSheetLength);
	}
};

export default Styler;
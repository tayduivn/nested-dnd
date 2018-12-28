var https = require("https"),
	concat = require("concat-stream");

var faIconsArr = [];
var svgIcons = [];

var getFaIcons = new Promise(resolve => {
	https.get(
		"https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.0.13/advanced-options/metadata/icons.json",
		function(res) {
			res.setEncoding("utf8");
			res.pipe(
				concat({ encoding: "string" }, function(remoteSrc) {
					var faIcons = JSON.parse(remoteSrc);

					for (var name in faIcons) {
						var styles = faIcons[name].styles;
						var label = name.replace(new RegExp("-", "g"), " ");
						var values = [];

						if (styles.includes("brands")) values.push("fab fa-" + name);
						if (styles.includes("regular")) values.push("far fa-" + name);
						if (styles.includes("solid")) values.push("fas fa-" + name);

						values.forEach(v => {
							faIconsArr.push({
								label: label,
								value: v
							});
						});
					}

					resolve();
				})
			);
		}
	);
});

var getSvgIcons = new Promise(resolve => {
	var lineReader = require("readline").createInterface({
		input: require("fs").createReadStream("./icons.txt")
	});

	lineReader.on("line", function(line) {
		line = line.substr(line.indexOf("icons") + 6);
		line = line.replace(/\\/g, "/");
		line = line.replace(/\.svg/g, "");

		var parts = line.split("/");
		var name = parts[parts.length - 1];
		name = name.split("-");
		if (!isNaN(name[0])) name.splice(0, 1);
		name = name.join(" ");

		svgIcons.push({
			label: name,
			value: "svg " + line
		});
	});

	lineReader.on("close", resolve);
});

// Icon list make
// ------------------------------
// node gi_convert.js > icons_out.js

Promise.all([getFaIcons, getSvgIcons]).then(() => {
	console.log("module.exports=" + JSON.stringify(faIconsArr.concat(svgIcons)));
});

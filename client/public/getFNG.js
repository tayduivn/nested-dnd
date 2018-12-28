var https = require("https"),
	concat = require("concat-stream");

function extractSection(html) {
	const sectionNameReg = new RegExp(/<div id=\"(.*?)\" class=\"genTitle\"/g);
	var result = sectionNameReg.exec(html);
	var sectionTitle = result[1];
	console.log(result[1]);

	const urlReg = new RegExp(/<a href=\"(?!http)([\w\-\.\d]+)\"/g);
	var match = urlReg.exec(html);
	var matches = [];
	var jsFiles = [];

	while (match != null) {
		// matched text: match[0]
		// match start: match.index
		// capturing group n: match[n]
		matches.push(match[1]);
		match = urlReg.exec(html);
	}

	return {
		section: sectionTitle,
		php: matches
	};
}

let getMainWebsite = getWebsite(
	"https://www.fantasynamegenerators.com",
	html => {
		var sections = html.split('<div class="genList">');
		var urlTODO = [];
		for (var i = 1; i < sections.length - 1; i++) {
			var { section, urls } = extractSection(sections[i]);
			urlTODO.push(urls);
		}

		var promises = [];
		var jsFiles = [];

		//matches.sort().forEach(url=>{
		promises.push(
			getWebsite(
				"https://www.fantasynamegenerators.com/irish-names.php",
				html => {
					console.log(html.substr(0, 1000));
					const reg = new RegExp(/<script/g);
					var nuMatch = reg.exec(html);
					console.log(nuMatch[0]);

					while (nuMatch != null) {
						// matched text: match[0]
						// match start: match.index
						// capturing group n: match[n]
						if (!jsFiles.includes(nuMatch[1])) {
							console.log(nuMatch[1]);
							jsFiles.push(nuMatch[1]);
						}
						nuMatch = reg.exec(html);
					}
				}
			)
		);
		//})
	}
);

function getWebsite(url, callback) {
	return new Promise(resolve => {
		https.get("https://www.fantasynamegenerators.com", function(res) {
			res.setEncoding("utf8");
			res.pipe(
				concat({ encoding: "string" }, function(remoteSrc) {
					callback(remoteSrc);
					resolve();
				})
			);
		});
	});
}

Promise.all([getMainWebsite]).then(() => {
	// console.log("module.exports="+JSON.stringify(faIconsArr.concat(svgIcons)));
});

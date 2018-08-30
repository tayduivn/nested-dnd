var colors = require('material-colors');

var replace = require('./server/app/util/colorConvert');

colors.wood = {
	'50': '#f6ede0',
	'100': '#e9d2b3',
	'200': '#dbb480',
	'300': '#cd964d',
	'400': '#c28026',
	'500': '#b76900',
	'600': '#b06100',
	'700': '#a75600',
	'800': '#9f4c00',
	'900': '#903b00',
	'a100': '#ffd2bc',
	'a200': '#ffb089',
	'a400': '#ff8d56',
	'a700': '#ff7c3c',
}

for(var color in colors){
	colors[color]['1000'] = "sdf";
}

var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('./server/data/dump/nested-dnd/generators.json')
});

lineReader.on('line',function(line){

	var start = line.indexOf('"bg":');

	if(start === -1) {
		// console.log(line);
		return;
	}

	start += 5;
	var numChars = line.substr(start).indexOf('}')+1;
	var bg = "";
	try{

		bg = line.substr(start, numChars)
		bg = convertBG(bg, line);
	
		line = line.substr(0,start)+bg+line.substr(start+numChars);

		try{
			JSON.parse(line)
		}
		catch(e){
			console.error("FAILED TO PARSE JSON");
		}

		console.log(line);
	}
	catch(e){
		bg = "";
		line = JSON.parse(line)

		if(!line.style.bg.value){
			return console.log(line);
		}

		var rows = line.style.bg.value.rows;

		if(!rows){
			return console.log(line);
		}

		rows.forEach(function(row, i){
			row = convertBG(JSON.stringify(row), line);
			rows[i] = JSON.parse(row);
		})

		console.log(JSON.stringify(line));
	}

	
	//var json = JSON.parse(line);
});


function convertBG(input, line){
	var bg = input;
	for(var name in replace){
		var regExp = new RegExp('"'+name+'"', 'gi');
		bg = bg.replace(regExp, '"'+replace[name]+'"')
	}

	JSON.parse(bg).value

	// validate();
	return bg;

	
	function validate(){
		bg = JSON.parse(bg).value

		if(!bg){
			console.log("Can't find bg");
			console.log(JSON.stringify(line));
			console.log(input);
			return
		}

		var parts = bg.split("-");
		var variant = parts[parts.length-1];
		parts.splice(parts.length-1)
		var name = "";
		parts.forEach(function(p,i){
			if(i !== 0)
				p = p.charAt(0).toUpperCase()+p.substr(1);
			name+= p;
		});
		if(!colors[name] || !colors[name][variant]){
			console.log(bg+" "+name+"-"+variant);
		}
	}
}


	


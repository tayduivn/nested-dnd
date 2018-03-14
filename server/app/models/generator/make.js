const async = require('async');

var Maker = {

	makeMixedThing: function({type, value}, Table){
		if(value === undefined || value === null)
			return value;

		switch(type){
			case "tableid":
				return null; // TODO
				break;
			case "table":
				var table = new Table(value);
				return table.roll(); // TODO: roll
				break;
		}
		return value;
	},

	make: function(gen, generations, pack){
		if(!gen){
			console.trace("gen cannot be undefined");
			throw new Error("make(): gen cannot be undefined");
		}

		if(isNaN(generations) || generations < 0) generations = 0;

		//make into a Generator obj if not
		if(!gen.save){
			var Generator = pack.model('Generator');
			gen = new Generator(gen);
		}

		var result = {
			up: [] // placeholder for later
		};
		//optional fields --------------------------------------
		var txt = gen.makeTextColor;
		var cssClass =  gen.makeCssClass;
		var icon = gen.makeIcon;
		if(txt) result.txt = txt;
		if(cssClass) result.cssClass = cssClass;
		if(icon) result.icon = icon;
		if(gen.name) result.name = gen.name;
		if(gen.isa) result.isa = gen.isa;
		if(gen.in && gen.in.length) result.in = true; // placeholder for later;

		// in ---------------------------------------------
		if(generations && gen.in && gen.in.length){
			var madeChildren = gen.in.map((c)=>{
				return this.makeChild(c, pack, generations-1);
			})

			//flatten madeChildren into single array
			var flatArray = [];
			madeChildren.forEach((child)=>{
				if(child instanceof Array){
					flatArray = flatArray.concat(child);
				}
				else if(child !== null){
					flatArray.push(child);
				}
			});

			result.in = flatArray;

			if(!madeChildren || madeChildren.length === 0){
				result.isEmpty = true;
			}
		}

		return result;
	},

	makeChild: function(child, pack, generations){
		// check chance
		if(!child.isIncluded) return null;

		const amount = child.makeAmount;

		var gen; 
		if(child.type === "generator"){
			gen = pack.generators[child.value]
		}
		if(child.type === "embed"){
			gen = child.value;
		}

		var arr = [];
		for(var i = 0; i < amount; i++){
			if(gen){
				arr.push(this.make(gen, generations, pack))
			}
			else arr.push({ 
				name: child.value,
				up: [],
				in: false
			});
		}

		return arr;
	}

}

module.exports = Maker;
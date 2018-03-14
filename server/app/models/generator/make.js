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

		var name = gen.displayName || gen.isa;

		var result = {
			name: name,
			isa: gen.isa,
			cssClass: gen.makeCssClass,
			textColor: gen.makeTextColor,
			icon: gen.makeIcon,
			children: !!(gen.children && gen.children.length), // Boolean
			ancestors: [] // placeholder for later
		};

		if(generations && gen.children && gen.children.length){
			var madeChildren = gen.children.map((c)=>{
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

			result.children = flatArray;

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

		var arr = [];
		for(var i = 0; i < amount; i++){
			if(gen){
				arr.push(this.make(gen, generations, pack))
			}
			else arr.push({ 
				name: child.value,
				ancestors: [],
				children: false
			});
		}

		return arr;
	}

}

module.exports = Maker;
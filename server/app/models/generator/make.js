
const Nested = require('../../routes/packs/nested');

var Maker = {

	/**
	 * Make a thing that could be a tableid, a table, or a string
	 * @param  {string} options.type  tableid, table, or string
	 * @param  {Object|string} options.value the thing
	 * @param  {Table} Table         the table schema
	 * @return {string}              the random value
	 */
	makeMixedThing: async function(thing, Table){
		if(typeof thing === "string" || !thing) 
			return thing;

		// try to get Table model from thing
		Table = getTableModel(thing, Table);

		var {type, value} = thing;
		if(type === undefined || value === undefined || value === null)
			return value;

		switch(type){
			case "table_id":
				var table = await Table.findById(value); // TODO
				value = await table.roll();
				break;
			case "table":
				value = await rollEmbeddedTable(value, thing, Table);
				break;
		}
		return value;
	},

	/**
	 * Creates a random version of a generator
	 * @param  {Object|Generator} gen         the generator 
	 * @param  {Integer} generations the number of nested levels to generate
	 * @param  {BuiltPack} builtpack        the compiled built pack with combined definitions of generators to use
	 * @param {Object} node the pre-existing node that we are generating children for
	 * @return {Nested}             the node that will be passed to the user
	 */
	make: async function(gen, generations, builtpack, node){
		if(isNaN(generations) || generations < 0) generations = 0;

		//make into a Generator obj if not
		gen = cleanGen(gen, builtpack);

		// make a new node if doesn't exist yet
		if(!node){
			let name = await gen.makeName;
			let style = await gen.makeStyle(name);
			node = new Nested(name, gen, style);
		}

		if(!generations || !gen.in || !gen.in.length) 
			return node;
		
		// in ---------------------------------------------
		var madeChildren;

		// make children
		await Promise.all(gen.in.map((c)=>{
			return this.makeChild(c, builtpack, generations-1);
		})).then(result=>madeChildren=result);

		//flatten madeChildren into single array
		var flatArray = [];
		madeChildren.forEach((child)=>{
			flatArray = flatArray.concat(child);
		});

		node.in = (!flatArray || !flatArray.length) ? undefined : flatArray;

		return node;
	},

	/**
	 * Processes the type of a child to randomly generate it
	 * @param  {Object} child       childSchema
	 * @param  {BuiltPack} builtpack   the compiled pack
	 * @param  {Integer} generations the number of nested levels to generate
	 * @return {Object[]}             an array of nodes that was generated by this child
	 */
	makeChild: async function(child, builtpack, generations){
		if(!child || !builtpack) return [];

		var arr = [];
		var Table = builtpack.model('Table');
		var Generator = builtpack.model('Generator');

		// wrap as a child if needed
		if(!child.model) child = new Generator({in: [ child ]}).in[0];

		var amount = child.makeAmount;

		var {gen,table} = await checkTypes(child, Table, builtpack)
			.catch(()=>{ amount = 0; return {} });

		if(!amount || !child.isIncluded) return [];

		for(var i = 0; i < amount; i++){
			if(gen){
				arr.push(await Maker.make(gen, generations, builtpack))
			}
			else if(table){
				var result = await table.roll();
				if(typeof result === undefined) continue;
				if(typeof result === 'string') result = { value: result };
				arr = arr.concat(await this.makeChild(result, builtpack, generations));
			}
			else if(child.value){
				arr.push({ 
					name: child.value,
					up: [],
					in: false
				});
			}
		}

		return arr;
	}

}

async function checkTypes(child, Table, builtpack){
	var gen, table; 

	if(child.type === "table"){
		if(typeof child.value !== 'object'){
			var e = new Error("Data needs cleanup - table should not be a string: ");
			e.data = child.parent()._doc;
			throw e;
		}
		else
			table = new Table(child.value)
	}
	else if(child.type === "table_id"){
		table = await Table.findById(child.value)
	}
	else if(child.type === "generator"){
		gen = builtpack.getGen(child.value)
	}
	else if(child.type === 'embed'){ // embed or string
		gen = child.value;
	}
	return {gen, table};
}

function getTableModel(thing, Table){
	if(Table) return Table;

	var parent = thing.$parent || (thing.parent && thing.parent());

	if(parent)
		Table = parent.model('Table');
	if(typeof thing.type === 'string' && thing.type.includes('table') && !Table){
		throw new Error("Argument Table is required");
	}

	return Table;
}

async function rollEmbeddedTable(value, thing, Table){
	if(typeof value === 'object' && !(value instanceof Array)){
		var table = new Table(value);
		value = await table.roll();
	}
	else {
		console.error("Data needs cleanup - table should not be a string: ");
		var parent = thing.$parent || thing.parent();
		console.error(parent._doc);
		value = value.toString();
	}
	return value;
}

function cleanGen(gen, builtpack){
	if(!gen){
		throw new Error("make(): gen cannot be undefined");
	}

	if(!gen.save){
		var Generator = builtpack.model('Generator');
		gen = new Generator(gen)
	}
	gen = gen.extend(builtpack);

	return gen;
}
module.exports = Maker;
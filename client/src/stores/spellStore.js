const DEBUG_SPELL = "Light";

class SpellStore{
	constructor(){
		this.spells = {};
	}
	addAll(spells = {}){
		for(var name in spells){
			if(DEBUG_SPELL === name){
				console.log("DEBUG SPELL ----- "+name);
				console.log(spells[name]);
			}

			this.spells[name] = new SpellData(name, spells[name], this.spells);

			if(DEBUG_SPELL === name){
				console.log(this.spells[name]);
			}
		}
	}
	getAll(){
		return this.spells;
	}
	get(name){
		if(!this.spells[name]){
			console.log("can't find spell with name "+name);
			return false;
		}
		return this.spells[name];
	}
	exists(name){
		return !!this.spells[name];
	}
	getNames(){
		return Object.keys(this.spells).sort();
	}
	getClassSpells(classname, maxlevel){
		var spells = [];
		for(var spellname in this.spells){
			var spell = this.spells[spellname];
			if(spell.classes && spell.classes.includes(classname) 
				&& spell.level && spell.level <= maxlevel
				&& !spell.feature)
				spells.push(spellname);
		}
		return spells;
	}
}

class SpellData{
	constructor(name, options, spells){
		if(name === DEBUG_SPELL){
			console.log("DEBUG "+name);
		}

		//extend the existing spell
		if(spells[name]){
			options = { ...spells[name].originalOptions, ...options };
		}
		//set the name
		if(!options.namegen || !options.namegen.length){
			options.namegen = name;
		}

		this._saveOptions(options);

		this.originalOptions = options;
	}
	_saveOptions({namegen = "", cast_time = "", classes, description = [], components = { types: "" }, school = "", duration = "", level = 0, ritual = false, dice, range, save = false, shortDesc = false, icon = false, isFeature = false, uses, subtitle}){
		this.namegen = namegen;
		this.cast_time = cast_time;
		this.components = components;
		this.classes = classes;
		this.description = description;
		this.duration = duration;
		this.range = range;
		this.school = school;
		this.dice = dice;
		this.level = level;
		this.save = save;
		this.ritual = !!ritual;
		this.shortDesc = shortDesc;
		this.icon = icon;
		this.isFeature = !!isFeature;
		this.uses = uses;
		this.subtitle = subtitle;
	}
}





export default new SpellStore();
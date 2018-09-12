import SHORT_DESC, { replace } from './ShortDesc';
import { defaultCharacterData, getInventory, getFeatureCard } from './DDBConvert';

const IGNORE_FEATURES = ["Hit Points", 'Feat'];
const USE_PARENT_DESC = ["Favored Enemy"]

const abbreviate = true;
const isHarryPotter = true;

var configData;

function getAbility(c, abil){
	var stat = c.abilities[abil.toLowerCase()]
	var num = stat.base;
	stat.adjust.forEach(s=>num+=s.amount);
	return getMod(num);
}

function getMod(val) {
	var mod = Math.floor((val - 10) / 2);
	if (val >= 30) mod = 10;
	else if (val < 2) mod = -5;
	return mod;
}

function attemptJSONParse(data){
	if(typeof data === 'string'){
		try{
			data = JSON.parse(data);
		}
		catch(e){
			return {};
		}
	}
	return data;
}

function ddbConvert(data){

	data = attemptJSONParse(data);
	configData = data.configData;
	data = data.character;

	var c = defaultCharacterData(data);

	if(data.name) c.name = data.name;
	
	// background feature
	const bg = data.features.background;
	if(!bg.hasCustomBackground && bg.definition.featureName){
		c.features.push({
				name: bg.definition.featureName,
				desc: (abbreviate) ? getShortDesc(bg.definition.featureName) : bg.definition.featureDescription
			})
	}

	data.features.racialTraits.forEach(f=>feature(f,c));

	//must do AFTER racial Traits!
	var CON = c.abilities.con.base;
	c.abilities.con.adjust.forEach(a=>CON+=a.value);
	CON = parseInt(CON,10);
	c.hp = data.hitPoints.base+(getMod(CON)*data.level);

	data.classes.forEach(cl=>{
		var clas = {
			name: cl.class.name,
			level: cl.level,
			subclasses: {}
		}

		c.hitDice.push({
			value: cl.hitDice.diceValue,
			count: cl.hitDice.diceCount
		})

		cl.features.forEach(f=>feature(f,c,clas,cl,data));

		data.features.feats.forEach(f=>feature(f,c,clas,cl,data))

		c.classes.push(clas);
	});

	bg.dynamicModifiers.forEach(m=>processMod(m,{},c));
	if(bg.customBackground.dynamicModifiers)
		bg.customBackground.dynamicModifiers.forEach(m=>processMod(m,{},c));

	c = { ...c, ...getInventory(data)};
	return c;
}

function swapComma(str){
	var parts = str.split(', ');
	str = "";
	for(var i = parts.length-1; i > -1; i--){
		str+=parts[i].trim()+' ';
	}
	return str.trim();
}

function getSpellCard({ definition: def, alwaysPrepared }, spellcasting){
	const lvl = def.level;
	const shortRange = (def.range && def.range.rangeValue > 5) ? def.range.rangeValue : undefined;

	// add spell to spellcasting
	var spell = {
		name: def.name,
		level: lvl,
		ritual: def.ritual,
		prepared: alwaysPrepared || lvl === 0
	}
	if(!spellcasting.spells[lvl])
		spellcasting.spells[lvl] = [];
	spellcasting.spells[lvl].push(spell)

	return {
		...spell,
		category: 'spell',
		weaponCategory: null,
		range: shortRange,
		concentration: def.concentration,
		description: def.description,
		attackType: def.attackType,
		castTime: def.castingTime && def.castingTime.castingTimeInterval+" "+def.castingTime.castingTimeUnit,
		properties: null,
		saveData: (def.requiresSavingThrow) ? { throw: def.saveDcStat } : undefined,
		duration: (def.duration) ? def.duration.durationInterval+" "+def.duration.durationUnit : undefined,
		components: (!def.components) ? undefined : {
			types: def.components.replace(', ',''),
			materials: def.componentsDescription
		}
	}
}

function processFeatureOption(o, { name, description }, c, clas, classData){
	if(!o.description || USE_PARENT_DESC.includes(name)){
		o.description = description;
		o.parentFeature = name;
	}
	feature({ definition: o}, c, clas, classData);
}

function processSpellcasting(description, c, clas, classData){
	if(!c.spellcasting){
		c.spellcasting = {
			list: [] 
		}
	}

	var spellcasting = {
		name: clas.name,
		level: clas.level,
		ability: classData.class.spellCastingAbility.toLowerCase(),
		spells: [],
		ritualCast: description.includes("Ritual Cast")
	};

	const classConfig = configData.classConfigurations.find((c=>c.name===clas.name));

	var slots = classConfig.spellRules.levelSpellSlots[clas.level]
	if(slots) c.spellcasting.slots = slots;

	if(classData.spells){
		/// ------------- ADD SPELLS -------------
		classData.spells.forEach(s=>c.cards.push(getSpellCard(s, spellcasting)));
	}

	c.spellcasting.list.push(spellcasting);

	return;
}

function feature({ definition, options = [], dynamicModifiers = [], limitedUseAbilities: limit = [], isAttack }, c, clas, classData){

	// returnable
	if(IGNORE_FEATURES.includes(definition.name)) return;
	if(definition.name === "Spellcasting")
		return processSpellcasting(definition.description, c, clas, classData);
	if(definition.name === "Thieves’ Cant")
		return c.proficiencies.languages.push('Thieves’ Cant');
	
	var doDisplay = !definition.hideInBuilder;
	var mods = (definition.grantedModifiers || []).concat(dynamicModifiers);
	var hasSubFeatures = definition.features && definition.features.length
	var onlyProficiency = mods.length && !hasSubFeatures;
	var name = definition.name;
	
	// process options
	if(options.length) doDisplay = false;
	options.forEach(o=>processFeatureOption(o, definition, c, clas, classData))

	// modifiers
	mods.forEach(m=>{
		var isProf = processMod(m, definition.name, c, clas, classData);
		if(isProf === false) onlyProficiency = false;
	})
	if(onlyProficiency || !doDisplay) 
		return;

	if(definition.dynamicModifiers){
		name = definition.dynamicModifiers.map(m=>m.friendlySubtypeName).join(", ");
		if(!name.length) name = definition.name;
	}
	// ---- end modifiers
	
	var result = {
		name: (name==='Font of Magic') ? 'Flexible Casting' : name,
		desc: cleanDescHTML(definition.description)
	}

	if(limit && limit.length && name !== 'Font of Magic'){
		limit.forEach(l=>result.uses = l.maxUses); //todo check multiple
	}

	getAdvResist(definition.parentFeature || result.name, c.advResist, definition.name);

	if(abbreviate){
		var shortDesc = getShortDesc(definition.parentFeature || result.name);
		if(shortDesc !== undefined) result.desc = shortDesc;
		if(shortDesc === false) return;
	}
	if(definition.activationType === 'Action')
		result.desc = "";	

	if((definition.activationType && definition.activationTime) || isAttack){
		c.cards.push(getFeatureCard(definition, limit))
	}

	c.features.push(result);
}

function cleanDescHTML(str){
	return window.$('<div>'+str+'</div>').text();
}


function processMod(m, fName, c, clas, classData){
	var name = swapComma(m.friendlySubtypeName).toLowerCase();

	var weapons = ['weapons','crossbow','sword','dagger','rapier'];
	var isWeapon = false;
	weapons.forEach(str=>{
		if(m.subType.indexOf(str) !== -1) isWeapon = true;
	})

	var tools = ['-kit','-tool','-supplies','-set','flute', 'vehicles'];
	var isTool = false
	tools.forEach(str=>{
		if(m.subType.indexOf(str) !== -1) isTool = true;
	})

	switch(m.type){
		case "proficiency":
			if(m.subType.indexOf('armor') !== -1 || m.subType === 'shields')
				c.proficiencies.armor.push(name);
			else if(isWeapon)
				c.proficiencies.weapons.push(name);
			else if(isTool)
				c.proficiencies.tools.push(name);
			else if(m.subType.indexOf('-saving-throws') !== -1){
				c.abilities[m.subType.substr(0,3)].saveProficient = true;
			}
			else
				c.proficiencies.skills.push(m.friendlySubtypeName);
			break;
		case "language":
			var lang = isHarryPotter ? harryPotterify(m.friendlySubtypeName) : m.friendlySubtypeName;
			if(!c.proficiencies.languages.includes(lang))
				c.proficiencies.languages.push(lang)
			break;
		case "set":
			if(m.subType === 'subclass')
				clas.subclasses[fName] = classData.subclass.name;
			else if(m.subType === 'unarmored-armor-class'){
				c.equipment.armor.unarmoredBonus = m.value
				if(!m.value && m.stat){
					c.equipment.armor.unarmoredBonus = getAbility(c, m.stat)
				}

			}
			else return false;
			break;
		case "bonus":
			if(m.subType === 'strength-score')
				c.abilities.str.adjust.push({value: m.value})
			else if(m.subType === 'dexterity-score')
				c.abilities.dex.adjust.push({value: m.value})
			else if(m.subType === 'constitution-score')
				c.abilities.con.adjust.push({value: m.value})
			else if(m.subType === 'intelligence-score')
				c.abilities.int.adjust.push({value: m.value})
			else if(m.subType === 'wisdom-score')
				c.abilities.wis.adjust.push({value: m.value})
			else if(m.subType === 'charisma-score')
				c.abilities.cha.adjust.push({value: m.value})
			else if(m.subType === 'hit-points-per-level')
				c.hp+= m.value * c.level;
			break;
		case "expertise": 
			c.proficiencies.doubleSkills.push(m.friendlySubtypeName);
			break;
		default: 
			return false
	}
}

function getAdvResist(name, { advantages, resistances, other }, childFeature){
	switch(name){
		case "Among the Dead":
			advantages.push("Saves against disease");
			break;
		case "Assassinate":
			advantages.push("Attacking creatures that haven't taken a turn yet");
			other.push({
				name: "Assassinate",
				desc: "Critical damage to surprised creatures"
			})
			break;
		case "Artificer’s Lore":
			other.push({
				name: name,
				desc: "Double proficiency bonus for History checks on magic items, alchemical objects, or technological devices."
			});
			break;
		case "Danger Sense": 
			advantages.push("Dexterity saves against things you can see and hear");
			break;
		case 'Fey Ancestry':
			advantages.push("Saves against being charmed, Magic can't put you to sleep");
			break;
		case 'Gnome Cunning':
			advantages.push("Intelligence, Wisdom, and Charisma saving throws against magic.");
			break;
		case "Rage (Damage +2)":
			advantages.push("STR checks and saves while raging")
			resistances.push("Bludgeoning/piercing/slashing while raging")
			break;
		case "Dragon Ancestor":
			other.push({
				name: "Dragon Ancestor",
				desc: "Double proficiency bonus for CHA checks on "+childFeature+"s" 
			});
			break;
		case "Favored Enemy":
			advantages.push("Survival and INT checks against favored enemies");
			break;
		case "Natural Explorer":
			advantages.push("Initiative during your first turn attacking creatures that have not yet acted")
			break;
		default: return;
	}
}

function getShortDesc(name){
	if(name.startsWith("Sneak Attack"))
		return "If you have advantage or target is flanked, deal extra damage"

	return SHORT_DESC[name];
}

function harryPotterify(str){
	for(var name in replace){
		str = str.replace(name, replace[name]);
	}
	return str;
}

export { ddbConvert, swapComma, isHarryPotter, harryPotterify, abbreviate };
import SHORT_DESC, { replace, CARD_DATA } from './ShortDesc';
import { defaultCharacterData, getInventory } from './DDBConvert';

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

function feature(f,c,clas,classData){
	if(IGNORE_FEATURES.includes(f.definition.name)) return;
	if(f.definition.name === "Spellcasting"){
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
			ritualCast: f.definition.description.includes("Ritual Cast")
		};

		const classConfig = configData.classConfigurations.find((c=>c.name===clas.name));

		var slots = classConfig.spellRules.levelSpellSlots[clas.level]
		if(slots) c.spellcasting.slots = slots;

		if(classData.spells){
			/// ------------- ADD SPELLS -------------
			classData.spells.forEach(s=>{
				const lvl = s.definition.level;
				if(!spellcasting.spells[lvl])
					spellcasting.spells[lvl] = [];

				var spell = {
					name: s.definition.name,
					level: lvl,
					ritual: s.definition.ritual,
					prepared: s.alwaysPrepared || lvl === 0
				}
				spellcasting.spells[lvl].push(spell)

				const shortRange = (s.definition.range && s.definition.range.rangeValue > 5) ? s.definition.range.rangeValue : undefined;
				const def = s.definition;
				var card = Object.assign({
					category: 'spell',
					weaponCategory: null,
					range: shortRange,
					concentration: def.concentration,
					description: def.description,
					attackType: def.attackType,
					castTime: def.castingTime && def.castingTime.castingTimeInterval+" "+def.castingTime.castingTimeUnit,
					properties: null
				}, spell);

				if(def.requiresSavingThrow){
					card.saveData = {
						throw: def.saveDcStat
					}
				}
				if(def.duration){
					card.duration = def.duration.durationInterval+" "+def.duration.durationUnit+( def.duration.durationInterval > 1 ? s:'');
				}
				if(def.components){
					card.components = {
						types: def.components.replace(', ',''),
						materials: def.componentsDescription
					}
				}

				c.cards.push(card);
			});
		}

		c.spellcasting.list.push(spellcasting);

		return;
	}
	if(f.definition.name === "Thieves’ Cant"){
		c.proficiencies.languages.push('Thieves’ Cant');
		return;
	}

	var doDisplay = !f.definition.hideInBuilder;

	if(f.options && f.options.length){
		f.options.forEach(o=>{
			if(!o.description || USE_PARENT_DESC.includes(f.definition.name)){
				o.description = f.definition.description;
				o.parentFeature = f.definition.name;
			}
			o = {
				definition: o
			}
			feature(o,c,clas,classData);
		})
		doDisplay = false;
	}

	var mods = f.definition.grantedModifiers || [];
	if(f.dynamicModifiers) 
		mods = mods.concat(f.dynamicModifiers);

	var hasSubFeatures = f.definition.features && f.definition.features.length
	var onlyProficiency = mods.length && !hasSubFeatures;
	mods.forEach(m=>{
		var isProf = processMod(m,f,c,clas,classData);
		if(isProf === false) onlyProficiency = false;
	})
	if(onlyProficiency || !doDisplay) return;

	var name = f.definition.name;
	if(f.definition.dynamicModifiers){
		name = f.definition.dynamicModifiers.map(m=>m.friendlySubtypeName).join(", ");
		if(!name.length) name = f.definition.name;
	}
	
	var result = {
		name: (name==='Font of Magic') ? 'Flexible Casting' : name,
		desc: cleanDescHTML(f.definition.description)
	}

	var limit = f.limitedUseAbilities;
	if(limit && limit.length && name !== 'Font of Magic'){
		limit.forEach(l=>result.uses = l.maxUses); //todo check multiple
	}

	getAdvResist(f.definition.parentFeature || result.name, c.advResist, f.definition.name);

	if(abbreviate){
		var shortDesc = getShortDesc(f.definition.parentFeature || result.name);
		if(shortDesc !== undefined) result.desc = shortDesc;
		if(shortDesc === false) return;
	}
	if(f.definition.activationType === 'Action')
		result.desc = "";	

	var card = false;
	if((f.definition.activationType && f.definition.activationTime) || f.isAttack){
		var activation = (f.definition.activationType && f.definition.activationTime);
		const shortRange = (f.definition.range && f.definition.range > 5) ? f.definition.range : undefined;
		card = {
			name: f.definition.name,
			category: 'spell',
			consumable: f.definition.isConsumable,
			weight: f.definition.weight,
			attackType: f.definition.attackType,
			castTime: activation ? (f.definition.activationTime+' '+f.definition.activationType.toLowerCase()) : "Modifier",
			range: shortRange,
			isFeature: true,
			icon: getIcon(f.definition.name),
			description: f.definition.description.replace('</p>','').split('<p>'),
			longRange: (shortRange) ? f.definition.longRange : undefined,
			properties: f.definition.properties
		};

		if(f.definition.damage){
			card.damage = {
				diceString: f.definition.damage.diceString,
				damageType: f.definition.damageType,
				addModifier: true
			};
		}

		if(f.limitedUseAbilities){
			var abil = f.limitedUseAbilities.find(a=>a.name === f.definition.name);
			if(abil){
				card.uses = {
					count: abil.maxUses,
					reset: abil.resetType.toLowerCase()
				}
			}
		}

		card = {...card, ...CARD_DATA[card.name]};
	}

	c.features.push(result);
	if(card) c.cards.push(card);
}

function cleanDescHTML(str){
	return window.$('<div>'+str+'</div>').text();
}


function processMod(m,f,c,clas,classData){
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
				clas.subclasses[f.definition.name] = classData.subclass.name;
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

function getIcon(name){
	switch(name){
		case "Second Wind": return 'svg game-icons/delapouite/originals/healing';
		default: return undefined;
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
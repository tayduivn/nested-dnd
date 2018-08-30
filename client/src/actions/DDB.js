
import {PROP_DESC} from '../components/Characters/Cards/CardsUtil';

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


function ddbConvert(data){

	if(typeof data === 'string'){
		try{
			data = JSON.parse(data);
		}
		catch(e){
			return {};
		}
	}
	configData = data.configData;
	data = data.character;

	var coin = data.currencies;

	var c = {
		level: data.level,
		proficiencyBonus: data.proficiencyBonus,
		hitDice: [],
		body: {
			speeds: {
				walk: data.weightSpeeds.normal.walk
			}
		},
		background: {
			startingCoin: ((coin.pp) ? coin.pp+'p':'')
				+((coin.ep) ? coin.ep+'e':'')
				+((coin.gp) ? coin.gp+'g':'')
				+((coin.sp) ? coin.sp+'s':'')
				+((coin.cp) ? coin.cp+'c':'')
		},
		race: {
			name: isHarryPotter ? harryPotterify(data.race) : data.race,
			size: data.size
		},
		classes: [],
		abilities: {
			str: { base: data.stats.str, adjust: [] },
			dex: { base: data.stats.dex, adjust: [] },
			con: { base: data.stats.con, adjust: [] },
			int: { base: data.stats.int, adjust: [] },
			cha: { base: data.stats.cha, adjust: [] },
			wis: { base: data.stats.wis, adjust: [] }
		},
		features: [],
		proficiencies: {
			armor: [],
			weapons: [],
			skills: [],
			doubleSkills: [],
			languages: [],
			tools: [],
			doubleTools: []
		},
		advResist: {
			advantages: [],
			resistances: [],
			other: []
		},
		equipment: {
			armor: {},
			containers: []
		},
		spellcasting: null,
		cards: []
	};
	if(data.name) c.name = data.name;

	if(data.eyes) c.body.eyes = data.eyes;
	if(data.skin) c.body.skin = data.skin;
	if(data.hair) c.body.hair = data.hair;
	if(data.age) c.body.age = data.age;
	if(data.height) c.body.height = data.height;
	if(data.weight) c.body.weight = data.weight;

	const spds = data.weightSpeeds.normal;
	if(spds.fly) c.body.speeds.fly = spds.fly;
	if(spds.burrow) c.body.speeds.burrow = spds.burrow;
	if(spds.swim) c.body.speeds.swim = spds.swim;
	if(spds.climb) c.body.speeds.climb = spds.climb;

	const bg = data.features.background;
	if(bg.hasCustomBackground){
		if(bg.customBackground.name) 
			c.background.name = bg.customBackground.name

	}else{
		if(bg.definition.name) c.background.name = bg.definition.name
		if(bg.definition.featureName){
			c.features.push({
				name: bg.definition.featureName,
				desc: (abbreviate) ? getShortDesc(bg.definition.featureName) : bg.definition.featureDescription
			})
		}
	}
	
	
	if(data.traits.personalityTraits) c.background.personality = data.traits.personalityTraits;
	if(data.traits.ideals) c.background.ideal = data.traits.ideals;
	if(data.traits.bonds) c.background.bond = data.traits.bonds;
	if(data.traits.flaws) c.background.flaw = data.traits.flaws;

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
	})

	bg.dynamicModifiers.forEach(m=>processMod(m,{},c));
	if(bg.customBackground.dynamicModifiers)
		bg.customBackground.dynamicModifiers.forEach(m=>processMod(m,{},c));



	// inventory ------
	if(data.inventory.armor){
		const armor = (data.inventory && data.inventory.armor && data.inventory.armor.filter(a=>a.equipped)) ||[];
		armor.forEach(arm=>{
			if(arm.definition.name === 'Shield'){
				c.equipment.hasShield = true;
			}
			else if(!arm.stackable){
				c.equipment.armor = {
					name: arm.definition.name,
					data: {
						ac: arm.definition.armorClass,
						itemType: arm.definition.type
					}
				}
			}
			else{
				//todo stackable armor
			}
		})
	}
	if(data.inventory.weapons){
		var weaps = data.inventory.weapons;
		var weapCount = {};

		weaps.forEach(w=>{
			let name = swapComma(w.definition.name)
			if(!weapCount[name]) weapCount[name] = 0;
			weapCount[name]++;

			// only put weapon once
			if(c.cards.find(card=>card.name === name))
				return;

			const shortRange = (w.definition.range && w.definition.range > 5) ? w.definition.range : undefined;
			var card = {
				category: 'item',
				name: name,
				consumable: w.definition.isConsumable,
				weight: w.definition.weight,
				attackType: w.definition.attackType,
				damage: {
					diceString: w.definition.damage.diceString,
					damageType: w.definition.damageType,
					addModifier: true
				},
				range: shortRange,
				longRange: (shortRange) ? w.definition.longRange : undefined,
				weaponCategory: w.definition.category,
				properties: w.definition.properties
			};

			if(abbreviate){
				card.properties.forEach(p=>p.description = PROP_DESC[p.name])
			}
			c.cards.push(card);
		});

		weaps = [];
		for(var w in weapCount){
			weaps.push((weapCount[w] > 1) ? weapCount[w]+' '+w+'s' : w);
		}

		c.equipment.weapons = weaps.join(", ");

		
	}
	if(data.inventory.gear){

		var magic = makeContainer('Magical',data.inventory.gear.filter(g=>g.definition.magic||g.definition.subType==='Potion'));
		var tools = makeContainer('Tools',data.inventory.gear.filter(g=>g.definition.subType==='Tool'));
		var bp = makeContainer('Backpack', 
			data.inventory.gear.filter(g=>
				g.definition.subType!=='Tool'
				&& g.definition.subType!=='Potion'
				&& !g.definition.magic
				&& g.definition.name !== 'Backpack'))

		c.equipment.containers.push(bp);
		if(tools.content.length) c.equipment.containers.push(tools);
		if(magic.content.length) c.equipment.containers.push(magic);

		data.inventory.gear.forEach(e=>{

			var addCard = e.definition.subType==='Potion';
			if(!addCard) return;

			let name = swapComma(e.definition.name)

			var card = {
				category: 'item',
				name: name,
				consumable: e.definition.isConsumable,
				weight: e.definition.weight,
				healing: {
					diceString: '2d4 + 2',
					addModifier: false
				},
				description: cleanParagraphHTML(e.definition.description)
			};

			c.cards.push(card);
		})
	}
	if(data.notes.personalPossessions)
		c.equipment.containers.push({ content: [data.notes.personalPossessions] })
	return c;
}

function makeContainer(label, arr){
	var items = [];
	
	arr.forEach(g=>{
		var name = swapComma(g.definition.name.toLowerCase());
		var showQuantity = g.quantity > 1 && !name.startsWith('ball bearings')

		items.push((showQuantity ? g.quantity+" ": '')
			+name
		)
	});
	return {
		name: label,
		content: items
	}
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

		card = {...card, ...getData(card.name)};
	}

	c.features.push(result);
	if(card) c.cards.push(card);
}

function cleanDescHTML(str){
	return window.$('<div>'+str+'</div>').text();
}

function cleanParagraphHTML(str){
	return window.$('<div>'+str+'</div>').find('p').map((i,p)=>{
		return window.$(p).text()
	}).toArray();
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

function getData(name){
	switch(name){
		case "Second Wind": 
			return {
				icon: 'svg game-icons/delapouite/originals/healing',
				range: 'Self',
				healing: {
					addModifier: true,
					diceString: "1d10"
				}
			};
		case 'Font of Magic':
			return {
				name: 'Flexible Casting',
				subtitle: 'Sorcery Points',
				shortDesc: "Use sorcery points to gain spell slots, or sacrifice spell slots to gain sorcery points",
				uses: { count: 2 },
				icon: 'svg game-icons/lorc/trade',
				description: [
					"You can transform unexpended sorcery points into one spell slot as a bonus action on your turn. You can create spell slots no higher in level than 5th. You can expend one spell slot as a bonus action and gain a number of sorcery points equal to the slot&rsquo;s level.",
					"Any spell slot you create with this feature vanishes when you finish a long rest.",
					"<table style='width:100%'><thead><tr><th>Spell Slot Level&nbsp;&nbsp;</th><th>Sorcery Points</th></tr></thead><tbody><tr><td>1st</td><td>2</td></tr><tr><td>2nd</td><td>3</td></tr><tr><td>3rd</td><td>5</td></tr><tr><td>4th</td><td>6</td></tr><tr><td>5th</td><td>7</td></tr></tbody></table>"
				]
			}
			case 'Martial Arts (d4)':
				return {
					"name": "Martial Arts",
					"icon": "svg game-icons/lorc/punch-blast",
					"damage": {
						"diceString": "1d4",
						"attack": true,
						"progression": true,
						"addModifier": true
					},
					description: [
						"You gain the following benefits while you are unarmed or wielding only monk weapons and you aren't wearing armor or a shield.",
						"• Can use Dex instead of Strength for Monk Weapons and Unarmed Strikes.",
						"• Can use 1d4 for Monk Weapons and Unarmed Strikes.",
						"• Can attack as a bonus action using an Unarmed Strike if you attacked with an Unarmed Strike or Monk Weapon.",
						"Monk Weapons are shortswords, and any simple melee weapon that isn't 2 handed or heavy.",
						"At Higher Levels: At level 5 the damage is 1d6, 1d8 at level 11, and 1d10 at level 17"
					]
				}
		default: return undefined;
	}
}

function getShortDesc(name){

	if(name.startsWith("Sneak Attack"))
		return "If you have advantage or target is flanked, deal extra damage"

	switch(name) {
		case "Ability Score Improvement": return false
		case "Ability Score Increase": return false
		case "Abjuration Savant": return "Half gold/time to copy Abj. spells"
		case "Action Surge": return "Take another action on your turn";
		case "Among the Dead": return "Undead who directly attack you make a WIS save or target someone else. A succesful save or attacking the creature makes it immune to this for a day."
		case "Arcane Recovery": return "(^lvl/2) spell slot levels on short rest"
		case "Arcane Tradition": return false
		case "Arcane Ward": return "When you cast lvl 1+ Abjuration spell, gain (lvlx2) + (INT) temp  HP. Lasts until long rest"
		case "Archery": return "+2 to ranged weapon attack"
		case "Artificer’s Lore": return false;
		case "Assassinate": return false;
		case "Athlete": return "Standing up costs 5 ft, climbing doesn't cost extra, running long jump or running high jump after only 5 ft.";
		case "Bonus Proficiencies": return false
		case "Bonus Proficiency": return false
		case "Careful Spell": return "(1) a creature you hit succeeds their save"
		case "Channel Belief": return "short rest restores"
		case "City Secrets": return "Your party can travel in cities twice as fast while out of combat"
		case "Circle Forms": return "Transform into CR 1 creature";
		case "Circle of the Moon": return false
		case "Colossus Slayer": return "Weapons deal an extra 1d8 on creatures below full health"
		case "Combat Wild Shape": return "Wild Shape is a bonus action. Can use a bonus action to spend 1 spell slot to regain 1d8 HP per spell level."
		case "Criminal Contact": return "trustworthy associate who can link you to a criminal network"
		case "Cunning Action": return '';
		case "Danger Sense": return false;
		case "Darkvision": return "see 60 ft in darkness"
		case "Deflect Missiles": return false;
		case "Destructive Wrath": return "Channel Belief: maximum lighting or thunder damage"
		case "Distant Spell": return "(1) double the range of a spell"
		case "Divine Domain": return false
		case "Dragon Ancestor": return false
		case "Draconic Bloodline": return false
		case "Draconic Resilience": return false
		case "Empowered Spell": return "(1) reroll up to cha damage dice"
		case "Evocation Savant": return "gold and time to copy an evocation spell is halved"
		case "Expertise": return false
		case "Extended Spell": return "(1) double duration of spell up to 24hr"
		case "Fast Hands": return "see Cunning Action card"
		case "Favored Enemy": return "+2 damage against"
		case "Fey Ancestry": return false
		case "Flurry of Blows": return false;
		case "Font of Magic": case "Flexible Casting": return 'sorcery points ↔ spell slots';
		case "Fury of the Small": return "If attack larger creature, add your level to the damage. Regain after short rest"
		case "Gnome Cunning": return false
		case "Halfling Nimbleness": return "move through larger creatures' space"
		case "Healing Light": return "d6"
		case "Heightened Spell": return "(3) target disadvantage on save"
		case "Hunter Conclave": return false
		case "Ki": return false;
		case "Life Domain": return "Healing spells of 1st level or higher regain 2 + the spell’s level additional HP"
		case "Lucky": return "Reroll 1's"
		case "Martial Archetype": return false
		case "Martial Arts": return false;
		case "Martial Arts (d4)": return ' ';
		case "Mask of the Wild": return "You can hide in any natural phenomena (like rain)"
		case "Metamagic": return false
		case "Military Rank": return "Soldiers loyal to your military organization recognize your authority."
		case "Natural Explorer": 
			return "2x proficiency to INT and WIS checks in favored terrain. If travel 1 hr+ in favored terrain: difficult terrain doesn't slow, can't get lost except by magic, always alert to danger, forage x2, tracking gives number, size, how long ago, alone can stealth at normal pace"
		case "Naturally Stealthy": return "Hide when obscured by a larger creature"
		case "Open Hand Technique": return "see Flurry of Blows card"
		case "Patient Defense": return false;
		case "Portent": return "After long rest, roll two d20s. ______  ______ You can replace any roll with these."
		case "Position of Privilege": return "You are welcome in high society, and people assume you have the right to be wherever you are. Common folk make every effort to accommodate you."
		case "Protection": return "If weiding a shield: When an enemy attacks an ally within 5 ft of you, use your reaction to impose disadvantage."
		case "Quickened Spell": return "(2) change action to bonus action"
		case "Rage": return "+2 to damage"
		case "Rage (Damage +2)": return false
		case "Ranger’s Companion": return "";
		case "Reckless Attack": return "Advantage on first attack roll (melee weapon using Strength), but attack rolls against you have advantage until your next turn."
		case "Relentless Endurance":  return "When reduced to 0 HP you can go to 1 HP instead"
		case "Researcher": return "If you don't know a piece of lore, you often know where to obtain it"
		case "Rustic Hospitality": return "You can find a place to hide, rest, or recuperate among other commoners. They will shield you from the law or anyone else, though they will not risk their lives for you."
		case "Savage Attacks": return "crit with melee weapon, roll damage dice 1 more time";
		case "Sculpt Spells": return "Choose a number of creatures equal to 1 + the spell’s level that will succeed on their saves and take no damage"
		case "Second-Story Work": return "Climb doesn't cost extra movement. Jump distance (DEX) ft."
		case "Second Wind": return "Regain after short/long rest."
		case "School of Abjuration": return false
		case "Sorcerous Origin": return false;
		case "Step of the Wind": return false;
		case "Subtle Spell": return "(1) spell doesn't require V or S"
		case "Thief": return false;
		case "Tides of Chaos": return "Reroll. Regain after a Wild Magic Surge."
		case "Trance": return "meditate 4 hrs instead of sleep"
		case "Turn Undead": return false
		case "Twinned Spell": return "( lvl ) target 2nd creature in range."
		case "Two-Weapon Fighting": return "add your ability modifier to the damage of the second attack"
		case "Unarmored Defense": return false;
		case "Unarmored Movement": return false;
		case "Wanderer": return "Excellent memory for maps and geography. Find food, water for 6 people daily";
		case "Way of the Open Hand": return false;
		case "Wild Magic": return false;
		case "Wild Magic Surge": return "After a level 1+ spell, roll a d20. If you get a 1, a Surge happens."
		case "Wild Shape": return "Regain after short/long rest. Lasts (lvl/2) hours."
		case "Wild Shape Forms": return false
		case "Wrath of the Storm": return "2d8";
		default: return undefined;
	}
}

const replace = {
	"Orc": "Giant",
	"Elf": "Veela",
	"Rock Gnome": "Pukwudgie",
	"Gnome": "Pukwudgie",
	"Gnomish": "Pukwudgie",
	"Dwarvish": "Gobbledegook"
}

function harryPotterify(str){
	for(var name in replace){
		str = str.replace(name, replace[name]);
	}
	return str;
}

export { ddbConvert };
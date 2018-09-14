import { raceStore, backgroundStore } from "./classStore";

import { Abilities, Skills } from "./CharacterAbilities";
import { ClassInfo, Background, Body } from './CharRolePlay'
import { Health, Proficiencies, AdvResist, Feature } from './CharMiddleCol'
import Equipment from './Equipment';
import Cards, { appendPlus } from './Cards';

export default class Character {
	constructor(
		{
			lock = false,
			advResist = {},
			background = {},
			equipment = [],
			classes = [],
			features = [],
			name = "",
			player = "",
			proficiencies = {},
			race = { name: "Human" },
			abilities = {},
			hp = false,
			body
		} = {}
	) {
		if (hp !== false) hp = parseInt(hp, 10);

		this.lock = !!lock;
		this.name = name;
		this.player = player;
		this.race = { ...raceStore.get(race.name), race };
		this.classes = classes.map ? classes.map(c => new ClassInfo(c)) : [];
		this.background = new Background(background);
		this.abilities = new Abilities(abilities);
		this.health = new Health(hp);
		this.proficiencies = new Proficiencies(proficiencies);
		this.equipment = new Equipment(equipment, this);
		this.advResist = new AdvResist(advResist);
		this.features = features.map ? features.map(a => new Feature(a)) : [];
		this.body = new Body(body, this.race.speed);
		this.spellcasting = false;
		this.cards = new Cards(this.equipment.items, [], this.features);

		this.racialAdjustAbilities();

		// adjust speed if Monk
		let monk = this.getClass("Monk");
		if(monk && monk.level >= 2 && !this.equipment.armor && !this.equipment.hasShield){
			this.body.speed += 10;
		}

		this.addProficiencies();
		this.addFeaturesAndAdvantages();
	}
	racialAdjustAbilities(){
		// adjust ability scores based on race
		for (var ability in this.race.abilities) {
			this.abilities[ability].addAdjustment(
				this.race.abilities[ability],
				1,
				this.race.name
			);
		}
	}
	getSkills() {
		return new Skills(this.proficiencies.skills.list, this.proficiencies.skills.double_proficiency, this);
	}
	isClass(name) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].name === name) return true;
		}
		return false;
	}
	/**
	 * @return ClassInfo
	 */
	getClass(name) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].name === name) return this.classes[i];
		}
		return false;
	}
	isSubclass(name, value) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].isSubclass(name, value)) return true;
		}
		return false;
	}
	addProficiencies() {
		this.proficiencies.add(this.race.proficiencies, this.race.name);
		if (this.background.proficiencies)
			this.proficiencies.add(
				this.background.proficiencies,
				this.background.name
			);
		this.classes.forEach(({ classData }) => {
			this.proficiencies.add(classData.proficiencies, classData.name);
		});

		this.abilities.setSaveProficiencies(
			this.proficiencies.saves.list,
			this.proficiencyBonus
		);
	}
	_raceFeatures(newAdvantages, newFeatures){
		var ar = this.race.advResist;
		if (ar) {
			for (var adv in ar.other) {
				newAdvantages.push({
					name: adv,
					desc: ar.other[adv]
				});
			}
			if (ar.advantages) {
				this.advResist.advantages.push(
					...ar.advantages
				);
			}
			if (ar.resistances) {
				this.advResist.resistances.push(
					...ar.resistances
				);
			}
		}
		for (var feat in this.race.features) {
			newFeatures.push({ ...this.race.features[feat], name: feat });
		}
	}
	_classFeatures(newFeatures){
		//classes features
		this.classes.forEach(({ classData, level, subclasses }) => {
			newFeatures.push(
				...classData.getFeaturesAtLevel(level, subclasses)
			);
		});
	}
	_processAdvantages(newAdvantages, newFeatures){
		newFeatures.forEach(f => {
			if (f.advantage) this.advResist.advantages.push(f.advantage);
			if (f.resist) this.advResist.resistances.push(f.resist);
			if (f.advResist) newAdvantages.push(f.advResist);
			if (f.proficiencies)
				this.proficiencies.add(f.proficiencies, f.name);
			this.features.push(new Feature(f));
		});
		newAdvantages.forEach(a => {
			this.advResist.other.push(new Feature(a));
		});
	}
	addFeaturesAndAdvantages() {
		// get features and advantages
		var newFeatures = [];
		var newAdvantages = [];

		// background feature
		if (this.background.feature) {
			newFeatures.push(new Feature(this.background.feature));
		} else if (this.background.name) {
			var bg = backgroundStore.get(this.background.name);
			if (bg.feature) newFeatures.push(bg.feature);
		}

		this._raceFeatures(newAdvantages, newFeatures);
		this._classFeatures(newFeatures);
		this._processAdvantages(newAdvantages, newFeatures)
		
	}
	_getRaceSpellcasting(profBonus){
		if (this.race.spellcasting) {
			this.spellcasting.add(
				this.race.spellcasting,
				this.race.name,
				this.abilities[this.race.spellcasting.ability].getMod(),
				0,
				[],
				{},
				profBonus
			);
		}
	}
	_getClassSpellcasting(profBonus){
		this.classes.forEach(c => {
			var classSC = c.classData.spellcasting;
			if (classSC){
				this.spellcasting.add(
					classSC,
					c.name,
					this.abilities[classSC.ability].getMod(),
					c.level,
					c.slots,
					c.knownSpells,
					profBonus
				);
			}
		});
	}
	printProficiencyBonus() {
		return appendPlus(this.proficiencyBonus);
	}
	getHitDice() {
		return this.health.getHitDice(this.classes);
	}
	/**
	 * @param {Feature} feature
	 */
	getFeatureUses(feature) {
		return feature.getUses(this.abilities, this.level);
	}
	/**
	 * @param {Feature} feature
	 */
	getFeatureDesc(feature) {
		return feature.getDesc(this.level, this.abilities);
	}
	getClassLevel(name) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].name === name) {
				return this.classes[i].level;
			}
		}
		return 0;
	}
	getSpellSlots() {
		if (!this.spellcasting) return [];

		return this.spellcasting.getSlots(this.classes);
	}
}
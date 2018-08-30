import React from "react";
import { Link } from 'react-router-dom'

import DB from '../../actions/CRUDAction';
import { ddbConvert } from '../../actions/DDB'

import "./Characters.css";

const CharacterItem = (c) => (
	<Link to={`/characters/${c._id}`} state={c} >
		<li>
			<div className="pull-right">
				<strong>{c.level}</strong>
			</div>
			<p className="charName">{c.name ? c.name : c.classes[0].name}</p>
			<p className="playerName">{c.player}</p>
		</li>
	</Link>
);

const CharactersList = ({characters = []}) =>(
	<ul className="list-group characterList">
		{characters.map ? characters.map((c, i) =>
			<CharacterItem key={i} {...c} />
		) : null}
	</ul>
);

const ImportFromDDB = ({handleUpdate}) => (
	<form onSubmit={handleUpdate}>
		<div className="form-group">
			<label htmlFor="ddbData">Import from D&D Beyond</label>
			<textarea className="form-control" id="ddbData" name="ddbData"
					placeholder='Go to your D&D Beyond character page, add "/json" to the end of the URL, and copy/paste the data here. For example: https://www.dndbeyond.com/profile/username/characters/0000000/json' defaultValue={JSON.stringify(DDB_DATA)} />
			<button type="submit" className="btn btn-primary mt-1">Import</button>
		</div>
	</form>
)

const Display = ({data: characters, handleUpdate}) => (
	<div>
		<CharactersList characters={characters} />
		<ImportFromDDB handleUpdate={handleUpdate} />
	</div>
)

export default class Characters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: undefined,
			data: []
		};
	}

	handleUpdate = (e) => {
		e.preventDefault();
		var data = (new FormData(e.currentTarget)).get('ddbData');
		var newData = ddbConvert(data);
		console.log(newData);
		const _this = this;
		DB.create('/universes/'+this.props.universe_id+'/characters', newData).then(r=>{
			_this.setState({error: r.error, data: _this.state.data.concat([r.data])})
		});
	}

	componentDidMount() {
		DB.fetch('/universes/'+this.props.universe_id+'/characters').then(r=>this.setState(r));
	}
	render() {
		if(this.state.error) return this.state.error.display;

		return <Display {...this.state} handleUpdate={this.handleUpdate} />
	}
}

export {ImportFromDDB};

const DDB_DATA = {
	"character": {
		"id": 2513448,
		"name": "",
		"player": "Cattegy",
		"age": null,
		"hair": null,
		"eyes": null,
		"skin": null,
		"height": null,
		"weight": null,
		"size": "Medium",
		"alignment": "Unknown",
		"faith": null,
		"level": 3,
		"race": "Half-Orc",
		"gender": null,
		"proficiencyBonus": 2,
		"inspiration": false,
		"background": "Outlander",
		"avatarUrl": "",
		"frameAvatarUrl": "",
		"backdropAvatarUrl": "",
		"smallBackdropAvatarUrl": "",
		"largeBackdropAvatarUrl": "",
		"thumbnailBackdropAvatarUrl": "",
		"avatarId": null,
		"frameAvatarId": null,
		"backdropAvatarId": null,
		"smallBackdropAvatarId": null,
		"largeBackdropAvatarId": null,
		"thumbnailBackdropAvatarId": null,
		"ammunition": null,
		"preferences": {
			"useHomebrewContent": true,
			"progressionType": 1,
			"encumbranceType": 2,
			"ignoreCoinWeight": true,
			"hitPointType": 1,
			"showUnarmedStrike": true,
			"showCompanions": false,
			"showWildShape": false,
			"primarySense": 5,
			"primaryMovement": 1
		},
		"attack": {
			"perAction": 0,
			"attackOptions": []
		},
		"classes": [
			{
				"id": 2538435,
				"isStartingClass": true,
				"class": {
					"id": 5,
					"name": "Ranger",
					"equipmentDescription": "<p class=\"Core-Styles_Core-Body-Last--to-apply-extra-space-\">You start with the following equipment, in addition to the equipment granted by your background:</p>\r\n<ul>\r\n<li class=\"Core-Styles_Core-Bulleted\">(<span class=\"Serif-Character-Style_Italic-Serif\">a</span>) scale mail or (<span class=\"Serif-Character-Style_Italic-Serif\">b</span>) leather armor</li>\r\n<li class=\"Core-Styles_Core-Bulleted\">(<span class=\"Serif-Character-Style_Italic-Serif\">a</span>) two shortswords or (<span class=\"Serif-Character-Style_Italic-Serif\">b</span>) two simple melee weapons</li>\r\n<li class=\"Core-Styles_Core-Bulleted\">(<span class=\"Serif-Character-Style_Italic-Serif\">a</span>) a dungeoneer&rsquo;s pack or (<span class=\"Serif-Character-Style_Italic-Serif\">b</span>) an explorer&rsquo;s pack</li>\r\n<li class=\"Core-Styles_Core-Bulleted\">A longbow and a quiver of 20 arrows</li>\r\n</ul>",
					"spellCastingAbility": "WIS",
					"spellCastingStatId": 5,
					"parentId": null,
					"isDerivedClass": true,
					"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/6/366/315/315/636272702825813090.png",
					"largeAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/6/367/636272702826438096.png",
					"portraitAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/10/7/636336417569697438.jpeg",
					"wealthDice": {
						"diceCount": 5,
						"diceValue": 4,
						"diceMultiplier": 10,
						"fixedValue": null,
						"diceString": "5d4"
					},
					"canCastSpells": true,
					"knowsAllSpells": false,
					"spellPrepareType": null
				},
				"subclass": {
					"id": 43,
					"name": "Beast Master",
					"equipmentDescription": null,
					"spellCastingAbility": "WIS",
					"spellCastingStatId": 5,
					"parentId": 5,
					"isDerivedClass": true,
					"avatarUrl": null,
					"largeAvatarUrl": null,
					"portraitAvatarUrl": null,
					"wealthDice": {
						"diceCount": null,
						"diceValue": null,
						"diceMultiplier": null,
						"fixedValue": null,
						"diceString": null
					},
					"canCastSpells": false,
					"knowsAllSpells": false,
					"spellPrepareType": null
				},
				"level": 3,
				"hitDice": {
					"diceCount": 3,
					"diceValue": 10,
					"diceMultiplier": null,
					"fixedValue": 10,
					"diceString": "3d10 + 10"
				},
				"hitDiceUsed": 0,
				"spells": [
					{
						"uniqueId": "136026",
						"typeId": 435869154,
						"definition": {
							"id": 1991,
							"name": "Alarm",
							"level": 1,
							"school": "Abjuration",
							"duration": {
								"durationInterval": 8,
								"durationUnit": "Hour",
								"durationType": "Time"
							},
							"castingTime": {
								"castingTimeInterval": 1,
								"castingTimeUnit": "Minute"
							},
							"activationType": "Minute",
							"range": {
								"origin": "Ranged",
								"rangeValue": 30,
								"aoeType": null,
								"aoeValue": null
							},
							"description": "<p>You set an alarm against unwanted intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a Tiny or larger creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm. You also choose whether the alarm is mental or audible.</p>\r\n<p>A mental alarm alerts you with a ping in your mind if you are within 1 mile of the warded area. This ping awakens you if you are sleeping.</p>\r\n<p>An audible alarm produces the sound of a hand bell for 10 seconds within 60 feet.</p>",
							"concentration": false,
							"ritual": true,
							"rangeArea": null,
							"damageEffect": null,
							"components": "V, S, M",
							"componentsDescription": "(a tiny bell and a piece of fine silver wire)  ",
							"saveDcStat": null,
							"damage": null,
							"healing": null,
							"healingDice": null,
							"tempHpDice": null,
							"attackType": "",
							"canCastAtHigherLevel": false,
							"availableToClasses": [
								5,
								8
							],
							"isHomebrew": false,
							"version": null,
							"requiresSavingThrow": false,
							"requiresAttackRoll": false,
							"atHigherLevels": {
								"scaleType": null,
								"additionalAttacks": [],
								"additionalTargets": [],
								"areaOfEffect": [],
								"duration": [],
								"creatures": [],
								"special": [],
								"points": []
							},
							"modifiers": []
						},
						"overrideSaveDC": null,
						"prepared": false,
						"countsAsKnownSpell": true,
						"usesSpellSlot": true,
						"castAtLevel": null,
						"alwaysPrepared": false,
						"restriction": null,
						"spellCastingAbility": null,
						"displayAsAttack": null,
						"additionalDescription": null,
						"range": {
							"origin": "Ranged",
							"rangeValue": 30,
							"aoeType": null,
							"aoeValue": null
						},
						"castingTime": {
							"castingTimeInterval": 1,
							"castingTimeUnit": "Minute"
						},
						"spellCustomData": {
							"nameOverride": null,
							"notes": null,
							"damageBonus": null,
							"toHitBonus": null,
							"toHitOverride": null,
							"isOffhand": null,
							"isSilver": false,
							"isAdamantine": false,
							"saveDCBonus": null,
							"saveDCOverride": null,
							"weightOverride": null
						},
						"baseLevelAtWill": false,
						"atWillLimitedUseLevel": null
					},
					{
						"uniqueId": "136565",
						"typeId": 435869154,
						"definition": {
							"id": 2065,
							"name": "Detect Magic",
							"level": 1,
							"school": "Divination",
							"duration": {
								"durationInterval": 10,
								"durationUnit": "Minute",
								"durationType": "Concentration"
							},
							"castingTime": {
								"castingTimeInterval": 1,
								"castingTimeUnit": "Action"
							},
							"activationType": "Action",
							"range": {
								"origin": "Self",
								"rangeValue": 0,
								"aoeType": "Sphere",
								"aoeValue": 30
							},
							"description": "<p>For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.</p>\r\n<p>The spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.</p>",
							"concentration": true,
							"ritual": true,
							"rangeArea": null,
							"damageEffect": null,
							"components": "V, S",
							"componentsDescription": "",
							"saveDcStat": null,
							"damage": null,
							"healing": null,
							"healingDice": null,
							"tempHpDice": null,
							"attackType": "",
							"canCastAtHigherLevel": false,
							"availableToClasses": [
								1,
								2,
								74,
								3,
								4,
								5,
								6,
								8
							],
							"isHomebrew": false,
							"version": null,
							"requiresSavingThrow": false,
							"requiresAttackRoll": false,
							"atHigherLevels": {
								"scaleType": null,
								"additionalAttacks": [],
								"additionalTargets": [],
								"areaOfEffect": [],
								"duration": [],
								"creatures": [],
								"special": [],
								"points": []
							},
							"modifiers": []
						},
						"overrideSaveDC": null,
						"prepared": false,
						"countsAsKnownSpell": true,
						"usesSpellSlot": true,
						"castAtLevel": null,
						"alwaysPrepared": false,
						"restriction": null,
						"spellCastingAbility": null,
						"displayAsAttack": null,
						"additionalDescription": null,
						"range": {
							"origin": "Self",
							"rangeValue": 0,
							"aoeType": "Sphere",
							"aoeValue": 30
						},
						"castingTime": {
							"castingTimeInterval": 1,
							"castingTimeUnit": "Action"
						},
						"spellCustomData": {
							"nameOverride": null,
							"notes": null,
							"damageBonus": null,
							"toHitBonus": null,
							"toHitOverride": null,
							"isOffhand": null,
							"isSilver": false,
							"isAdamantine": false,
							"saveDCBonus": null,
							"saveDCOverride": null,
							"weightOverride": null
						},
						"baseLevelAtWill": false,
						"atWillLimitedUseLevel": null
					},
					{
						"uniqueId": "138323",
						"typeId": 435869154,
						"definition": {
							"id": 2149,
							"name": "Hunter's Mark",
							"level": 1,
							"school": "Divination",
							"duration": {
								"durationInterval": 1,
								"durationUnit": "Hour",
								"durationType": "Concentration"
							},
							"castingTime": {
								"castingTimeInterval": 1,
								"castingTimeUnit": "Bonus Action"
							},
							"activationType": "Bonus Action",
							"range": {
								"origin": "Ranged",
								"rangeValue": 90,
								"aoeType": null,
								"aoeValue": null
							},
							"description": "<p>You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.</p>\r\n<p><strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your concentration on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your concentration on the spell for up to 24 hours.</p>",
							"concentration": true,
							"ritual": false,
							"rangeArea": null,
							"damageEffect": null,
							"components": "V",
							"componentsDescription": "",
							"saveDcStat": null,
							"damage": null,
							"healing": null,
							"healingDice": null,
							"tempHpDice": null,
							"attackType": "",
							"canCastAtHigherLevel": true,
							"availableToClasses": [
								42,
								5
							],
							"isHomebrew": false,
							"version": null,
							"requiresSavingThrow": false,
							"requiresAttackRoll": false,
							"atHigherLevels": {
								"scaleType": "spellscale",
								"additionalAttacks": [],
								"additionalTargets": [],
								"areaOfEffect": [],
								"duration": [],
								"creatures": [],
								"special": [],
								"points": []
							},
							"modifiers": [
								{
									"id": "spell_2149_169",
									"type": "damage",
									"subType": "bludgeoning",
									"die": {
										"diceCount": 1,
										"diceValue": 6,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": "1d6"
									},
									"count": 1,
									"duration": 0,
									"durationUnit": null,
									"restriction": "Weapon Damage Type - bludgeoning, piercing, or slashing",
									"friendlyTypeName": "Damage",
									"friendlySubtypeName": "Bludgeoning",
									"usePrimaryStat": false,
									"atHigherLevels": {
										"scaleType": "spellscale",
										"additionalAttacks": [],
										"additionalTargets": [],
										"areaOfEffect": [],
										"duration": [],
										"creatures": [],
										"special": [],
										"points": []
									}
								},
								{
									"id": "spell_2149_170",
									"type": "damage",
									"subType": "piercing",
									"die": {
										"diceCount": 1,
										"diceValue": 6,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": "1d6"
									},
									"count": 1,
									"duration": 0,
									"durationUnit": null,
									"restriction": "Weapon Damage Type - bludgeoning, piercing, or slashing",
									"friendlyTypeName": "Damage",
									"friendlySubtypeName": "Piercing",
									"usePrimaryStat": false,
									"atHigherLevels": {
										"scaleType": "spellscale",
										"additionalAttacks": [],
										"additionalTargets": [],
										"areaOfEffect": [],
										"duration": [],
										"creatures": [],
										"special": [],
										"points": []
									}
								},
								{
									"id": "spell_2149_171",
									"type": "damage",
									"subType": "slashing",
									"die": {
										"diceCount": 1,
										"diceValue": 6,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": "1d6"
									},
									"count": 1,
									"duration": 0,
									"durationUnit": null,
									"restriction": "Weapon Damage Type - bludgeoning, piercing, or slashing",
									"friendlyTypeName": "Damage",
									"friendlySubtypeName": "Slashing",
									"usePrimaryStat": false,
									"atHigherLevels": {
										"scaleType": "spellscale",
										"additionalAttacks": [],
										"additionalTargets": [],
										"areaOfEffect": [],
										"duration": [],
										"creatures": [],
										"special": [],
										"points": []
									}
								},
								{
									"id": "spell_2149_172",
									"type": "advantage",
									"subType": "perception",
									"die": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"count": 1,
									"duration": 0,
									"durationUnit": null,
									"restriction": "To Find Target",
									"friendlyTypeName": "Advantage",
									"friendlySubtypeName": "Perception",
									"usePrimaryStat": false,
									"atHigherLevels": {
										"scaleType": "spellscale",
										"additionalAttacks": [],
										"additionalTargets": [],
										"areaOfEffect": [],
										"duration": [],
										"creatures": [],
										"special": [],
										"points": []
									}
								},
								{
									"id": "spell_2149_173",
									"type": "advantage",
									"subType": "survival",
									"die": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"count": 1,
									"duration": 0,
									"durationUnit": null,
									"restriction": "To Find Target",
									"friendlyTypeName": "Advantage",
									"friendlySubtypeName": "Survival",
									"usePrimaryStat": false,
									"atHigherLevels": {
										"scaleType": "spellscale",
										"additionalAttacks": [],
										"additionalTargets": [],
										"areaOfEffect": [],
										"duration": [],
										"creatures": [],
										"special": [],
										"points": []
									}
								}
							]
						},
						"overrideSaveDC": null,
						"prepared": false,
						"countsAsKnownSpell": true,
						"usesSpellSlot": true,
						"castAtLevel": null,
						"alwaysPrepared": false,
						"restriction": null,
						"spellCastingAbility": null,
						"displayAsAttack": null,
						"additionalDescription": null,
						"range": {
							"origin": "Ranged",
							"rangeValue": 90,
							"aoeType": null,
							"aoeValue": null
						},
						"castingTime": {
							"castingTimeInterval": 1,
							"castingTimeUnit": "Bonus Action"
						},
						"spellCustomData": {
							"nameOverride": null,
							"notes": null,
							"damageBonus": null,
							"toHitBonus": null,
							"toHitOverride": null,
							"isOffhand": null,
							"isSilver": false,
							"isAdamantine": false,
							"saveDCBonus": null,
							"saveDCOverride": null,
							"weightOverride": null
						},
						"baseLevelAtWill": false,
						"atWillLimitedUseLevel": null
					}
				],
				"features": [
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 294,
							"displayOrder": 3,
							"name": "Favored Enemy",
							"description": "<p class=\"compendium-hr\">Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain t<span class=\"No-Break\">ype of enemy.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">Choose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. Alternatively, you can select two races of humanoid (such as gnolls and orcs) as fav<span class=\"No-Break\">ored enemies.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">You have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall informatio<span class=\"No-Break\">n about them.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">When you gain this feature, you also learn one language of your choice that is spoken by your favored enemies, if they spea<span class=\"No-Break\">k one at all.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">You choose one additional favored enemy, as well as an associated language, at 6th and 14th level. As you gain levels, your choices should reflect the types of monsters you have encountered on you<span class=\"No-Break\">r adventures.</span></p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "",
							"requiredLevel": 1,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": []
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [
							{
								"id": 62,
								"name": "Humanoids",
								"description": "<p><strong>Humanoids</strong> are the main peoples of a fantasy gaming world, both civilized and savage, including humans and a tremendous variety of other species. They have language and culture, few if any innate magical abilities (though most humanoids can learn spellcasting), and a bipedal form. The most common humanoid races are the ones most suitable as player characters: humans, dwarves, elves, and halflings. Almost as numerous but far more savage and brutal, and almost uniformly evil, are the races of goblinoids (goblins, hobgoblins, and bugbears), orcs, gnolls, lizardfolk, and kobolds.</p>",
								"level": 1,
								"activationTime": null,
								"activationType": null,
								"grantedModifiers": [],
								"abilities": {
									"spells": [],
									"actions": []
								},
								"limitedUseAbilities": [],
								"dynamicModifiers": [
									{
										"id": "classFeatureOption_62_10330",
										"type": "favored-enemy",
										"subType": "gnolls",
										"dice": {
											"diceCount": null,
											"diceValue": null,
											"diceMultiplier": null,
											"fixedValue": null,
											"diceString": null
										},
										"restriction": "",
										"stat": null,
										"requiresAttunement": false,
										"duration": {
											"durationInterval": 0,
											"durationUnit": null
										},
										"friendlyTypeName": "Favored Enemy",
										"friendlySubtypeName": "Gnolls",
										"value": null
									},
									{
										"id": "classFeatureOption_62_10331",
										"type": "favored-enemy",
										"subType": "humans",
										"dice": {
											"diceCount": null,
											"diceValue": null,
											"diceMultiplier": null,
											"fixedValue": null,
											"diceString": null
										},
										"restriction": "",
										"stat": null,
										"requiresAttunement": false,
										"duration": {
											"durationInterval": 0,
											"durationUnit": null
										},
										"friendlyTypeName": "Favored Enemy",
										"friendlySubtypeName": "Humans",
										"value": null
									}
								]
							}
						],
						"dynamicModifiers": [
							{
								"id": "classFeature_294_2325",
								"type": "language",
								"subType": "undercommon",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Language",
								"friendlySubtypeName": "Undercommon",
								"value": null
							}
						]
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 295,
							"displayOrder": 4,
							"name": "Natural Explorer",
							"description": "<p class=\"compendium-hr\">You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, swamp, or the Underdark. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you&rsquo;re p<span class=\"No-Break\">roficient in.</span></p>\r\n<p class=\"Core-Styles_Core-Body-Last--to-apply-extra-space-\">While traveling for an hour or more in your favored terrain, you gain the following benefits:</p>\r\n<ul>\r\n<li class=\"Core-Styles_Core-Bulleted\">Difficult terrain doesn&rsquo;t slow your group&rsquo;s travel.</li>\r\n<li class=\"Core-Styles_Core-Bulleted\">Your group can&rsquo;t become lost except by magical means.</li>\r\n<li class=\"Core-Styles_Core-Bulleted\">Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger.</li>\r\n<li class=\"Core-Styles_Core-Bulleted\">If you are traveling alone, you can move stealthily at a normal pace.</li>\r\n<li class=\"Core-Styles_Core-Bulleted\">When you forage, you find twice as much food as you normally would.</li>\r\n<li class=\"Core-Styles_Core-Bulleted-Last\">While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area.</li>\r\n</ul>\r\n<p class=\"Core-Styles_Core-Body\">You choose additional favored terrain types at 6th an<span class=\"No-Break\">d 10th level.</span></p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "",
							"requiredLevel": 1,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": []
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [
							{
								"id": 171,
								"name": "Desert",
								"description": "",
								"level": null,
								"activationTime": null,
								"activationType": null,
								"grantedModifiers": [],
								"abilities": {
									"spells": [],
									"actions": []
								},
								"limitedUseAbilities": [],
								"dynamicModifiers": []
							}
						],
						"dynamicModifiers": []
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 296,
							"displayOrder": 5,
							"name": "Fighting Style",
							"description": "<p class=\"Core-Styles_Core-Body\">At 2nd level, you adopt a particular style of fighting as your specialty. Choose one of the follow<span class=\"No-Break\">ing options.&nbsp;</span></p>\r\n<p class=\"Core-Styles_Core-Body\">You can&rsquo;t take a Fighting Style option more than once, even if you later get to <span class=\"No-Break\">choose again.</span></p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "",
							"requiredLevel": 2,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": []
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [
							{
								"id": 63,
								"name": "Archery",
								"description": "<p class=\"compendium-hr\">You gain a +2 bonus to attack rolls you make with ra<span class=\"No-Break\">nged weapons.</span></p>",
								"level": 2,
								"activationTime": null,
								"activationType": null,
								"grantedModifiers": [
									{
										"id": "classFeatureOption_63_1442",
										"type": "bonus",
										"subType": "ranged-weapon-attacks",
										"dice": {
											"diceCount": null,
											"diceValue": null,
											"diceMultiplier": null,
											"fixedValue": null,
											"diceString": null
										},
										"restriction": "",
										"stat": null,
										"requiresAttunement": false,
										"duration": {
											"durationInterval": 0,
											"durationUnit": null
										},
										"friendlyTypeName": "Bonus",
										"friendlySubtypeName": "Ranged Weapon Attacks",
										"value": 2
									}
								],
								"abilities": {
									"spells": [],
									"actions": []
								},
								"limitedUseAbilities": [],
								"dynamicModifiers": []
							}
						],
						"dynamicModifiers": []
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 297,
							"displayOrder": 6,
							"name": "Spellcasting",
							"description": "<p class=\"compendium-hr\">By the time you reach 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does. See <span style=\"color: #99cc00;\"><a style=\"color: #47d18c;\" title=\"Spells Rules\" href=\"https://www.dndbeyond.com/compendium/rules/basic-rules/spellcasting\">Spells Rules</a></span> for the general rules of spellcasting and the <span style=\"color: #993366;\"><a style=\"color: #704cd9;\" title=\"Spells Listing (Ranger)\" href=\"https://www.dndbeyond.com/spells?filter-class=5&amp;filter-search=&amp;filter-sub-class=&amp;filter-concentration=&amp;filter-ritual=&amp;filter-unlocked-content=\">Spells Listing</a></span>&nbsp;for the range<span class=\"No-Break\">r spell list.</span></p>\r\n<h5 class=\"compendium-hr\">Spell Slots</h5>\r\n<p class=\"Core-Styles_Core-Body\">The Ranger table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these spells, you must expend a slot of the spell&rsquo;s level or higher. You regain all expended spell slots when you finish<span class=\"No-Break\"> a long rest.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">For example, if you know the 1st-level spell <span class=\"Serif-Character-Style_Italic-Serif\">animal friendship</span> and have a 1st-level and a 2nd-level spell slot available, you can cast <span class=\"Serif-Character-Style_Italic-Serif\">animal friendship</span> using<span class=\"No-Break\"> either slot.</span></p>\r\n<h5 class=\"compendium-hr\">Spells Known of 1st Level and Higher</h5>\r\n<p class=\"Core-Styles_Core-Body\">You know two 1st-level spells of your choice from the range<span class=\"No-Break\">r spell list.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">The Spells Known column of the Ranger table shows when you learn more ranger spells of your choice. Each of these spells must be of a level for which you have spell slots. For instance, when you reach 5th level in this class, you can learn one new spell of 1st <span class=\"No-Break\">or 2nd level.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">Additionally, when you gain a level in this class, you can choose one of the ranger spells you know and replace it with another spell from the ranger spell list, which also must be of a level for which you have<span class=\"No-Break\"> spell slots.</span></p>\r\n<h5 class=\"compendium-hr\">Spellcasting Ability</h5>\r\n<p class=\"Core-Styles_Core-Body-Last--to-apply-extra-space-\">Wisdom is your spellcasting ability for your ranger spells, since your magic draws on your attunement to nature. You use your Wisdom whenever a spell refers to your spellcasting ability. In addition, you use your Wisdom modifier when setting the saving throw DC for a ranger spell you cast and when making an attack roll with one.</p>\r\n<p class=\"List-Styles_List-Item-Centered\"><strong><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Spell save DC </span></strong>= 8 + your proficiency bonus + your Wisdom modifier</p>\r\n<p class=\"List-Styles_List-Item-Centered\"><strong><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Spell attack modifier </span></strong>= your proficiency bonus + your Wisdom modifier</p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "<p><em>This feature is affected by multiclassing</em>. See the <a title=\"Multiclassing - Class Features\" href=\"https://www.dndbeyond.com/compendium/rules/basic-rules/customization-options#ClassFeatures\">Multiclassing</a> rules for more information.</p>\r\n<p class=\"compendium-hr\">By the time you reach 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does. See <span style=\"color: #99cc00;\"><a style=\"color: #47d18c;\" title=\"Spells Rules\" href=\"https://www.dndbeyond.com/compendium/rules/basic-rules/spellcasting\">Spells Rules</a></span> for the general rules of spellcasting and the <span style=\"color: #993366;\"><a style=\"color: #704cd9;\" title=\"Spells Listing (Ranger)\" href=\"https://www.dndbeyond.com/spells?filter-class=5&amp;filter-search=&amp;filter-sub-class=&amp;filter-concentration=&amp;filter-ritual=&amp;filter-unlocked-content=\">Spells Listing</a></span>&nbsp;for the range<span class=\"No-Break\">r spell list.</span></p>\r\n<h5 class=\"compendium-hr\">Spell Slots</h5>\r\n<p class=\"Core-Styles_Core-Body\">The Ranger table shows how many spell slots you have to cast your spells of 1st level and higher. To cast one of these spells, you must expend a slot of the spell&rsquo;s level or higher. You regain all expended spell slots when you finish<span class=\"No-Break\"> a long rest.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">For example, if you know the 1st-level spell <span class=\"Serif-Character-Style_Italic-Serif\">animal friendship</span> and have a 1st-level and a 2nd-level spell slot available, you can cast <span class=\"Serif-Character-Style_Italic-Serif\">animal friendship</span> using<span class=\"No-Break\"> either slot.</span></p>\r\n<h5 class=\"compendium-hr\">Spells Known of 1st Level and Higher</h5>\r\n<p class=\"Core-Styles_Core-Body\">You know two 1st-level spells of your choice from the range<span class=\"No-Break\">r spell list.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">The Spells Known column of the Ranger table shows when you learn more ranger spells of your choice. Each of these spells must be of a level for which you have spell slots. For instance, when you reach 5th level in this class, you can learn one new spell of 1st <span class=\"No-Break\">or 2nd level.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">Additionally, when you gain a level in this class, you can choose one of the ranger spells you know and replace it with another spell from the ranger spell list, which also must be of a level for which you have<span class=\"No-Break\"> spell slots.</span></p>\r\n<h5 class=\"compendium-hr\">Spellcasting Ability</h5>\r\n<p class=\"Core-Styles_Core-Body-Last--to-apply-extra-space-\">Wisdom is your spellcasting ability for your ranger spells, since your magic draws on your attunement to nature. You use your Wisdom whenever a spell refers to your spellcasting ability. In addition, you use your Wisdom modifier when setting the saving throw DC for a ranger spell you cast and when making an attack roll with one.</p>\r\n<p class=\"List-Styles_List-Item-Centered\"><strong><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Spell save DC </span></strong>= 8 + your proficiency bonus + your Wisdom modifier</p>\r\n<p class=\"List-Styles_List-Item-Centered\"><strong><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Spell attack modifier </span></strong>= your proficiency bonus + your Wisdom modifier</p>",
							"requiredLevel": 2,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": []
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [],
						"dynamicModifiers": []
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 298,
							"displayOrder": 7,
							"name": "Ranger Archetype",
							"description": "<p class=\"compendium-hr\">At 3rd level, you choose an archetype that you strive to emulate: the Hunter that is detailed at the end of the class description or one from another source. Your choice grants you features at 3rd level and again at 7th, 11th, an<span class=\"No-Break\">d 15th level.</span></p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "",
							"requiredLevel": 3,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": [
								{
									"id": "classFeature_298_2032",
									"type": "set",
									"subType": "subclass",
									"dice": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"restriction": "",
									"stat": null,
									"requiresAttunement": false,
									"duration": {
										"durationInterval": 0,
										"durationUnit": null
									},
									"friendlyTypeName": "Set",
									"friendlySubtypeName": "Subclass",
									"value": null
								}
							]
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [],
						"dynamicModifiers": []
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 299,
							"displayOrder": 8,
							"name": "Primeval Awareness",
							"description": "<p class=\"compendium-hr\">Beginning at 3rd level, you can use your action and expend one ranger spell slot to focus your awareness on the region around you. For 1 minute per level of the spell slot you expend, you can sense whether the following types of creatures are present within 1 mile of you (or within up to 6 miles if you are in your favored terrain): aberrations, celestials, dragons, elementals, fey, fiends, and undead. This feature doesn&rsquo;t reveal the creatures&rsquo; locati<span class=\"No-Break\">on or number.</span></p>",
							"activationTime": 1,
							"activationType": "Action",
							"multiClassDescription": "",
							"requiredLevel": 3,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": []
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [],
						"dynamicModifiers": []
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 334,
							"displayOrder": 100,
							"name": "Ranger’s Companion",
							"description": "<p class=\"compendium-hr\">At 3rd level, you gain a beast companion that accompanies you on your adventures and is trained to fight alongside you. Choose a beast that is no larger than Medium and that has a challenge rating of 1/4 or lower. Add your proficiency bonus to the beast&rsquo;s AC, attack rolls, and damage rolls, as well as to any saving throws and skills it is proficient in. Its hit point maximum equals the hit point number in its stat block or four times your ranger level, whichever is higher. Like any creature, it can spend Hit Dice during a short rest to regai<span class=\"No-Break\">n hit points.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">The beast obeys your commands as best as it can. It takes its turn on your initiative, though it doesn&rsquo;t take an action unless you command it to. On your turn, you can verbally command the beast where to move (no action required by you). You can use your action to verbally command it to take the Attack, Dash, Disengage, Dodge, or Help action. Once you have the Extra Attack feature, you can make one weapon attack yourself when you command the beast to take the A<span class=\"No-Break\">ttack action.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">If you are incapacitated or absent, the beast acts on its own, focusing on protecting you and itself. The beast never requires your command to use its reaction, such as when making an opport<span class=\"No-Break\">unity attack.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">While traveling through your favored terrain with only the beast, you can move stealthily at a<span class=\"No-Break\"> normal pace.</span></p>\r\n<p class=\"Core-Styles_Core-Body\">If the beast dies, you can obtain a new companion by spending 8 hours magically bonding with a beast that isn&rsquo;t hostile to you and that meets the <span class=\"No-Break\">requirements.</span></p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "",
							"requiredLevel": 3,
							"isSubClassFeature": true,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": []
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [],
						"dynamicModifiers": []
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 466,
							"displayOrder": 2,
							"name": "Proficiencies",
							"description": "<p><strong><span class=\"Serif-Character-Style_Bold-Serif\">Armor: </span></strong>Light armor, medium a<span class=\"No-Break\">rmor, shields<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Weapons: </span></strong>Simple weapons, ma<span class=\"No-Break\">rtial weapons<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Tools: </span></strong>None<br /><strong><span class=\"Serif-Character-Style_Bold-Serif\">Saving Throws: </span></strong>Streng<span class=\"No-Break\">th, Dexterity<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Skills: </span></strong>Choose three from Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth,<span class=\"No-Break\"> and Survival</span></p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "<p><strong><span class=\"Serif-Character-Style_Bold-Serif\">Armor: </span></strong>Light armor, medium a<span class=\"No-Break\">rmor, shields<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Weapons: </span></strong>Simple weapons, ma<span class=\"No-Break\">rtial weapons</span><span class=\"No-Break\"><br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Skills: </span></strong>Choose one&nbsp;from Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth,<span class=\"No-Break\"> and Survival</span></p>",
							"requiredLevel": 1,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": [
								{
									"id": "classFeature_466_1548",
									"type": "proficiency",
									"subType": "light-armor",
									"dice": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"restriction": "",
									"stat": null,
									"requiresAttunement": false,
									"duration": {
										"durationInterval": 0,
										"durationUnit": null
									},
									"friendlyTypeName": "Proficiency",
									"friendlySubtypeName": "Light Armor",
									"value": null
								},
								{
									"id": "classFeature_466_1549",
									"type": "proficiency",
									"subType": "medium-armor",
									"dice": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"restriction": "",
									"stat": null,
									"requiresAttunement": false,
									"duration": {
										"durationInterval": 0,
										"durationUnit": null
									},
									"friendlyTypeName": "Proficiency",
									"friendlySubtypeName": "Medium Armor",
									"value": null
								},
								{
									"id": "classFeature_466_1550",
									"type": "proficiency",
									"subType": "shields",
									"dice": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"restriction": "",
									"stat": null,
									"requiresAttunement": false,
									"duration": {
										"durationInterval": 0,
										"durationUnit": null
									},
									"friendlyTypeName": "Proficiency",
									"friendlySubtypeName": "Shields",
									"value": null
								},
								{
									"id": "classFeature_466_1551",
									"type": "proficiency",
									"subType": "simple-weapons",
									"dice": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"restriction": "",
									"stat": null,
									"requiresAttunement": false,
									"duration": {
										"durationInterval": 0,
										"durationUnit": null
									},
									"friendlyTypeName": "Proficiency",
									"friendlySubtypeName": "Simple Weapons",
									"value": null
								},
								{
									"id": "classFeature_466_1552",
									"type": "proficiency",
									"subType": "martial-weapons",
									"dice": {
										"diceCount": null,
										"diceValue": null,
										"diceMultiplier": null,
										"fixedValue": null,
										"diceString": null
									},
									"restriction": "",
									"stat": null,
									"requiresAttunement": false,
									"duration": {
										"durationInterval": 0,
										"durationUnit": null
									},
									"friendlyTypeName": "Proficiency",
									"friendlySubtypeName": "Martial Weapons",
									"value": null
								}
							]
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [],
						"dynamicModifiers": [
							{
								"id": "classFeature_466_1554",
								"type": "proficiency",
								"subType": "strength-saving-throws",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Proficiency",
								"friendlySubtypeName": "Strength Saving Throws",
								"value": null
							},
							{
								"id": "classFeature_466_1555",
								"type": "proficiency",
								"subType": "dexterity-saving-throws",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Proficiency",
								"friendlySubtypeName": "Dexterity Saving Throws",
								"value": null
							},
							{
								"id": "classFeature_466_1556",
								"type": "proficiency",
								"subType": "insight",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Proficiency",
								"friendlySubtypeName": "Insight",
								"value": null
							},
							{
								"id": "classFeature_466_1557",
								"type": "proficiency",
								"subType": "investigation",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Proficiency",
								"friendlySubtypeName": "Investigation",
								"value": null
							},
							{
								"id": "classFeature_466_1558",
								"type": "proficiency",
								"subType": "stealth",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Proficiency",
								"friendlySubtypeName": "Stealth",
								"value": null
							}
						]
					},
					{
						"isAttack": false,
						"attackDice": null,
						"definition": {
							"id": 538,
							"displayOrder": 1,
							"name": "Hit Points",
							"description": "<p><strong><span class=\"Serif-Character-Style_Bold-Serif\">Hit Dice: </span></strong>1d10 per<span class=\"No-Break\"> ranger level<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Hit Points at 1st Level: </span></strong>10 + your Constitu<span class=\"No-Break\">tion modifier<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Hit Points at Higher Levels:</span></strong> 1d10 (or 6) + your Constitution modifier per ranger le<span class=\"No-Break\">vel after 1st</span></p>",
							"activationTime": null,
							"activationType": null,
							"multiClassDescription": "",
							"requiredLevel": 1,
							"isSubClassFeature": false,
							"limitedUse": [],
							"hideInBuilder": false,
							"grantedModifiers": []
						},
						"abilities": {
							"spells": [],
							"actions": []
						},
						"limitedUseAbilities": [],
						"options": [],
						"dynamicModifiers": []
					}
				]
			}
		],
		"conditions": [],
		"currencies": {
			"cp": 0,
			"sp": 0,
			"gp": 10,
			"ep": 0,
			"pp": 0
		},
		"deathSaves": {
			"failCount": null,
			"successCount": null,
			"isStabilized": false
		},
		"defense": {
			"armorClass": {
				"miscBonus": null,
				"miscBonusDescription": null
			},
			"spells": []
		},
		"experience": {
			"current": 900,
			"adjustment": null,
			"next": 2700
		},
		"features": {
			"racialTraits": [
				{
					"definition": {
						"id": 99,
						"displayOrder": 1,
						"name": "Ability Score Increase",
						"description": "<p>Your Strength score increases by 2, and your Constitution score in<span class=\"No-Break\">creases by 1.</span></p>",
						"hideInBuilder": true,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": [
							{
								"id": "racialTrait_99_1648",
								"type": "bonus",
								"subType": "strength-score",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Bonus",
								"friendlySubtypeName": "Strength Score",
								"value": 2
							},
							{
								"id": "racialTrait_99_1649",
								"type": "bonus",
								"subType": "constitution-score",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Bonus",
								"friendlySubtypeName": "Constitution Score",
								"value": 1
							}
						]
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 146,
						"displayOrder": 2,
						"name": "Age",
						"description": "<p>&nbsp;Half-orcs mature a little faster than humans, reaching adulthood around age 14. They age noticeably faster and rarely live longer than 75 years.</p>",
						"hideInBuilder": true,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": []
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 147,
						"displayOrder": 3,
						"name": "Alignment",
						"description": "<p>Half-orcs inherit a tendency toward chaos from their orc parents and are not strongly inclined toward good. Half-orcs raised among orcs and willing to live out their lives among them are usually evil.</p>",
						"hideInBuilder": true,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": []
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 148,
						"displayOrder": 4,
						"name": "Size",
						"description": "<p>Half-orcs are somewhat larger and bulkier than humans, and they range from 5 to well over 6 feet tall. Your size is Medium.</p>",
						"hideInBuilder": true,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": []
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 149,
						"displayOrder": 5,
						"name": "Speed",
						"description": "<p>Your base walking speed is 30 feet.</p>",
						"hideInBuilder": true,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": []
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 56,
						"displayOrder": 6,
						"name": "Darkvision",
						"description": "<p>Thanks to your orc blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can&rsquo;t discern color in darkness, only shades of gray.</p>",
						"hideInBuilder": false,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": [
							{
								"id": "racialTrait_56_1381",
								"type": "sense",
								"subType": "darkvision",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Sense",
								"friendlySubtypeName": "Darkvision",
								"value": 60
							}
						]
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 57,
						"displayOrder": 7,
						"name": "Menacing",
						"description": "<p>You gain proficiency in the Intimidation skill.</p>",
						"hideInBuilder": false,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": [
							{
								"id": "racialTrait_57_1382",
								"type": "proficiency",
								"subType": "intimidation",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Proficiency",
								"friendlySubtypeName": "Intimidation",
								"value": null
							}
						]
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 58,
						"displayOrder": 8,
						"name": "Relentless Endurance",
						"description": "<p>When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can&rsquo;t use this feature again until you finish a long rest.</p>",
						"hideInBuilder": false,
						"activationTime": null,
						"activationType": "Special",
						"grantedModifiers": [
							{
								"id": "racialTrait_58_2050215",
								"type": "protection",
								"subType": "0-hp",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Protection",
								"friendlySubtypeName": "0 HP",
								"value": 1
							}
						]
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [
						{
							"id": 1007,
							"entityTypeId": 222216831,
							"name": "",
							"numberUsed": 0,
							"maxUses": 1,
							"statModifierUses": null,
							"resetType": "Long Rest",
							"spells": [],
							"actions": [
								{
									"limitedUse": {
										"minNumberConsumed": null,
										"maxNumberConsumed": 1
									},
									"description": "Relentless Endurance"
								}
							]
						}
					],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 59,
						"displayOrder": 9,
						"name": "Savage Attacks",
						"description": "<p>When you score a critical hit with a melee weapon attack, you can roll one of the weapon&rsquo;s damage dice one additional time and add it to the extra damage of the critical hit.</p>",
						"hideInBuilder": false,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": []
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				},
				{
					"definition": {
						"id": 100,
						"displayOrder": 10,
						"name": "Languages",
						"description": "<p>You can speak, read, and write Common and Orc. Orc is a harsh, grating language with hard consonants. It has no script of its own but is written in the Dwarvish script.</p>",
						"hideInBuilder": true,
						"activationTime": null,
						"activationType": null,
						"grantedModifiers": [
							{
								"id": "racialTrait_100_1650",
								"type": "language",
								"subType": "common",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Language",
								"friendlySubtypeName": "Common",
								"value": null
							},
							{
								"id": "racialTrait_100_1651",
								"type": "language",
								"subType": "orc",
								"dice": {
									"diceCount": null,
									"diceValue": null,
									"diceMultiplier": null,
									"fixedValue": null,
									"diceString": null
								},
								"restriction": "",
								"stat": null,
								"requiresAttunement": false,
								"duration": {
									"durationInterval": 0,
									"durationUnit": null
								},
								"friendlyTypeName": "Language",
								"friendlySubtypeName": "Orc",
								"value": null
							}
						]
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": [],
					"options": [],
					"dynamicModifiers": []
				}
			],
			"background": {
				"hasCustomBackground": false,
				"definition": {
					"id": 17,
					"name": "Outlander",
					"description": "<p class=\"Core-Styles_Core-Body-Last--to-apply-extra-space-\">You grew up in the wilds, far from civilization and the comforts of town and technology. You&rsquo;ve witnessed the migration of herds larger than forests, survived weather more extreme than any city-dweller could comprehend, and enjoyed the solitude of being the only thinking creature for miles in any direction. The wilds are in your blood, whether you were a nomad, an explorer, a recluse, a hunter-gatherer, or even a marauder. Even in places where you don&rsquo;t know the specific features of the terrain, you know the wa<span class=\"No-Break\">ys of the wild.</span></p>\r\n<div class=\"line character height1 marginTop20 marginBottom20\">&nbsp;</div>\r\n<p class=\"Core-Styles_Core-Hanging\"><strong><span class=\"Serif-Character-Style_Bold-Serif\">Skill Proficiencies:</span></strong>&nbsp;Athl<span class=\"No-Break\">etics, Survival<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Tool Proficiencies:</span></strong> One type of mus<span class=\"No-Break\">ical instrument<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Languages:</span></strong> One<span class=\"No-Break\"> of your choice<br /></span><strong><span class=\"Serif-Character-Style_Bold-Serif\">Equipment:</span></strong> A staff, a hunting trap, a trophy from an animal you killed, a set of traveler&rsquo;s clothes, and a pouch c<span class=\"No-Break\">ontaining 10 gp</span></p>\r\n<div class=\"line character height1 marginTop20 marginBottom20\">&nbsp;</div>\r\n<h5 class=\"compendium-hr\">Origin</h5>\r\n<p class=\"Core-Styles_Core-Body\">You&rsquo;ve been to strange places and seen things that others cannot begin to fathom. Consider some of the distant lands you have visited, and how they impacted you. You can roll on the following table to determine your occupation during your time in the wild, or choose one that best fits y<span class=\"No-Break\">our character.</span></p>\r\n<div class=\"_idGenObjectLayout-2\">\r\n<div id=\"_idContainer004\" class=\"_idGenObjectStyleOverride-1\">\r\n<table class=\"compendium-left-aligned-table\">\r\n<thead>\r\n<tr>\r\n<th>d10</th>\r\n<th style=\"text-align: left;\">Origin</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td>1</td>\r\n<td>Forester</td>\r\n</tr>\r\n<tr>\r\n<td>2</td>\r\n<td>Trapper</td>\r\n</tr>\r\n<tr>\r\n<td>3</td>\r\n<td>Homesteader</td>\r\n</tr>\r\n<tr>\r\n<td>4</td>\r\n<td>Guide</td>\r\n</tr>\r\n<tr>\r\n<td>5</td>\r\n<td>Exile or outcast</td>\r\n</tr>\r\n<tr>\r\n<td>6</td>\r\n<td>Bounty hunter</td>\r\n</tr>\r\n<tr>\r\n<td>7</td>\r\n<td>Pilgrim</td>\r\n</tr>\r\n<tr>\r\n<td>8</td>\r\n<td>Tribal nomad</td>\r\n</tr>\r\n<tr>\r\n<td>9</td>\r\n<td>Hunter-gatherer</td>\r\n</tr>\r\n<tr>\r\n<td>10</td>\r\n<td>Tribal marauder</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n</div>\r\n</div>\r\n<blockquote>\r\n<p class=\"compendium-hr\"><strong>FEATURE: WANDERER</strong></p>\r\n<p class=\"Core-Styles_Core-Body\">You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you. In addition, you can find food and fresh water for yourself and up to five other people each day, provided that the land offers berries, small game, water<span class=\"No-Break\">, and so forth.</span></p>\r\n</blockquote>\r\n<div class=\"line character height1 marginTop20 marginBottom20\">&nbsp;</div>\r\n<h5 class=\"compendium-hr\">Suggested Characteristics</h5>\r\n<p class=\"Core-Styles_Core-Body\">Often considered rude and uncouth among civilized folk, outlanders have little respect for the niceties of life in the cities. The ties of tribe, clan, family, and the natural world of which they are a part are the most important bonds to m<span class=\"No-Break\">ost outlanders.</span></p>\r\n<table class=\"compendium-left-aligned-table\">\r\n<thead>\r\n<tr>\r\n<th>d8</th>\r\n<th style=\"text-align: left;\">Personality Trait</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td>1</td>\r\n<td>I&rsquo;m driven by a wanderlust that led me away from home.</td>\r\n</tr>\r\n<tr>\r\n<td>2</td>\r\n<td>I watch over my friends as if they were a litter of newborn pups.</td>\r\n</tr>\r\n<tr>\r\n<td>3</td>\r\n<td>I once ran twenty-five miles without stopping to warn my clan of an approaching orc horde. I&rsquo;d do it again if I had to.</td>\r\n</tr>\r\n<tr>\r\n<td>4</td>\r\n<td>I have a lesson for every situation, drawn from observing nature.</td>\r\n</tr>\r\n<tr>\r\n<td>5</td>\r\n<td>I place no stock in wealthy or well-mannered folk. Money and manners won&rsquo;t save you from a hungry owlbear.</td>\r\n</tr>\r\n<tr>\r\n<td>6</td>\r\n<td>I&rsquo;m always picking things up, absently fiddling with them, and sometimes accidentally breaking them.</td>\r\n</tr>\r\n<tr>\r\n<td>7</td>\r\n<td>I feel far more comfortable around animals than people.</td>\r\n</tr>\r\n<tr>\r\n<td>8</td>\r\n<td>I was, in fact, raised by wolves.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table class=\"compendium-left-aligned-table\">\r\n<thead>\r\n<tr>\r\n<th>d6</th>\r\n<th style=\"text-align: left;\">Ideal</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td>1</td>\r\n<td><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Change.</span> Life is like the seasons, in constant change, and we must change with it. (Chaotic)</td>\r\n</tr>\r\n<tr>\r\n<td>2</td>\r\n<td><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Greater Good.</span> It is each person&rsquo;s responsibility to make the most happiness for the whole tribe. (Good)</td>\r\n</tr>\r\n<tr>\r\n<td>3</td>\r\n<td><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Honor.</span> If I dishonor myself, I dishonor my whole clan. (Lawful)</td>\r\n</tr>\r\n<tr>\r\n<td>4</td>\r\n<td><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Might.</span> The strongest are meant to rule. (Evil)</td>\r\n</tr>\r\n<tr>\r\n<td>5</td>\r\n<td><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Nature.</span> The natural world is more important than all the constructs of civilization. (Neutral)</td>\r\n</tr>\r\n<tr>\r\n<td>6</td>\r\n<td><span class=\"Sans-Serif-Character-Styles_Bold-Sans-Serif\">Glory.</span> I must earn glory in battle, for myself and my clan. (Any)</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table class=\"compendium-left-aligned-table\">\r\n<thead>\r\n<tr>\r\n<th>d6</th>\r\n<th style=\"text-align: left;\">Bond</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td>1</td>\r\n<td>My family, clan, or tribe is the most important thing in my life, even when they are far from me.</td>\r\n</tr>\r\n<tr>\r\n<td>2</td>\r\n<td>An injury to the unspoiled wilderness of my home is an injury to me.</td>\r\n</tr>\r\n<tr>\r\n<td>3</td>\r\n<td>I will bring terrible wrath down on the evildoers who destroyed my homeland.</td>\r\n</tr>\r\n<tr>\r\n<td>4</td>\r\n<td>I am the last of my tribe, and it is up to me to ensure their names enter legend.</td>\r\n</tr>\r\n<tr>\r\n<td>5</td>\r\n<td>I suffer awful visions of a coming disaster and will do anything to prevent it.</td>\r\n</tr>\r\n<tr>\r\n<td>6</td>\r\n<td>It is my duty to provide children to sustain my tribe.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<table class=\"compendium-left-aligned-table\">\r\n<thead>\r\n<tr>\r\n<th>d6</th>\r\n<th style=\"text-align: left;\">Flaw</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td>1</td>\r\n<td>I am too enamored of ale, wine, and other intoxicants.</td>\r\n</tr>\r\n<tr>\r\n<td>2</td>\r\n<td>There&rsquo;s no room for caution in a life lived to the fullest.</td>\r\n</tr>\r\n<tr>\r\n<td>3</td>\r\n<td>I remember every insult I&rsquo;ve received and nurse a silent resentment toward anyone who&rsquo;s ever wronged me.</td>\r\n</tr>\r\n<tr>\r\n<td>4</td>\r\n<td>I am slow to trust members of other races, tribes, and societies.</td>\r\n</tr>\r\n<tr>\r\n<td>5</td>\r\n<td>Violence is my answer to almost any challenge.</td>\r\n</tr>\r\n<tr>\r\n<td>6</td>\r\n<td>Don&rsquo;t expect me to save those who can&rsquo;t save themselves. It is nature&rsquo;s way that the strong thrive and the weak perish.</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<p>&nbsp;</p>",
					"shortDescription": "<p>You grew up in the wilds, far from civilization and the comforts of town and technology. You&rsquo;ve witnessed the migration of herds larger than forests, survived weather more extreme than any city-dweller could comprehend, and enjoyed the solitude of being the only thinking creature for miles in any direction. The wilds are in your blood, whether you were a nomad, an explorer, a recluse, a hunter-gatherer, or even a marauder. Even in places where you don&rsquo;t know the specific features of the terrain, you know the wa<span class=\"No-Break\">ys of the wild.</span></p>",
					"skillProficienciesDescription": "Athletics, Survival",
					"toolProficienciesDescription": "One type of musical instrument",
					"languagesDescription": "One of your choice",
					"equipmentDescription": "A staff, a hunting trap, a trophy from an animal you killed, a set of traveler&rsquo;s clothes, and a pouch containing 10 gp",
					"featureName": "Wanderer",
					"featureDescription": "<p>You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you. In addition, you can find food and fresh water for yourself and up to five other people each day, provided that the land offers berries, small game, water<span class=\"No-Break\">, and so forth.</span></p>",
					"avatarUrl": null,
					"largeAvatarUrl": null,
					"suggestedCharacteristicsDescription": "<p>Often considered rude and uncouth among civilized folk, outlanders have little respect for the niceties of life in the cities. The ties of tribe, clan, family, and the natural world of which they are a part are the most important bonds to m<span class=\"No-Break\">ost outlanders.</span></p>",
					"suggestedProficiencies": [
						"Athletics",
						"Survival"
					],
					"suggestedLanguages": [],
					"personalityTraits": [
						{
							"id": 277,
							"description": "I’m driven by a wanderlust that led me away from home.",
							"diceRoll": 1
						},
						{
							"id": 278,
							"description": "I watch over my friends as if they were a litter of newborn pups.",
							"diceRoll": 2
						},
						{
							"id": 279,
							"description": "I once ran twenty-five miles without stopping to warn to my clan of an approaching orc horde. I’d do it again if I had to.",
							"diceRoll": 3
						},
						{
							"id": 280,
							"description": "I have a lesson for every situation, drawn from observing nature.",
							"diceRoll": 4
						},
						{
							"id": 281,
							"description": "I place no stock in wealthy or well-mannered folk. Money and manners won’t save you from a hungry owlbear.",
							"diceRoll": 5
						},
						{
							"id": 282,
							"description": "I’m always picking things up, absently fiddling with them, and sometimes accidentally breaking them.",
							"diceRoll": 6
						},
						{
							"id": 283,
							"description": "I feel far more comfortable around animals than people.",
							"diceRoll": 7
						},
						{
							"id": 291,
							"description": "I was, in fact, raised by wolves.",
							"diceRoll": 8
						}
					],
					"ideals": [
						{
							"id": 285,
							"description": "Change. Life is like the seasons, in constant change, and we must change with it. (Chaotic)",
							"diceRoll": 1
						},
						{
							"id": 286,
							"description": "Greater Good. It is each person’s responsibility to make the most happiness for the whole tribe. (Good)",
							"diceRoll": 2
						},
						{
							"id": 287,
							"description": "Honor. If I dishonor myself, I dishonor my whole clan. (Lawful)",
							"diceRoll": 3
						},
						{
							"id": 288,
							"description": "Might. The strongest are meant to rule. (Evil)",
							"diceRoll": 4
						},
						{
							"id": 289,
							"description": "Nature. The natural world is more important than all the constructs of civilization. (Neutral)",
							"diceRoll": 5
						},
						{
							"id": 290,
							"description": "Glory. I must earn glory in battle, for myself and my clan. (Any)",
							"diceRoll": 6
						}
					],
					"bonds": [
						{
							"id": 292,
							"description": "My family, clan, or tribe is the most important thing in my life, even when they are far from me.",
							"diceRoll": 1
						},
						{
							"id": 293,
							"description": "An injury to the unspoiled wilderness of my home is an injury to me.",
							"diceRoll": 2
						},
						{
							"id": 294,
							"description": "I will bring terrible wrath down on the evildoers who destroyed my homeland.",
							"diceRoll": 3
						},
						{
							"id": 295,
							"description": "I am the last of my tribe, and it is up to me to ensure their names enter legend.",
							"diceRoll": 4
						},
						{
							"id": 296,
							"description": "I suffer awful visions of a coming disaster and will do anything to prevent it.",
							"diceRoll": 5
						},
						{
							"id": 297,
							"description": "It is my duty to provide children to sustain my tribe.",
							"diceRoll": 6
						}
					],
					"flaws": [
						{
							"id": 298,
							"description": "I am too enamored of ale, wine, and other intoxicants.",
							"diceRoll": 1
						},
						{
							"id": 299,
							"description": "There’s no room for caution in a life lived to the fullest.",
							"diceRoll": 2
						},
						{
							"id": 300,
							"description": "I remember every insult I’ve received and nurse a silent resentment toward anyone who’s ever wronged me.",
							"diceRoll": 3
						},
						{
							"id": 301,
							"description": "I am slow to trust members of other races, tribes, and societies.",
							"diceRoll": 4
						},
						{
							"id": 302,
							"description": "Violence is my answer to almost any challenge.",
							"diceRoll": 5
						},
						{
							"id": 303,
							"description": "Don’t expect me to save those who can’t save themselves. It is nature’s way that the strong thrive and the weak perish.",
							"diceRoll": 6
						}
					],
					"grantedModifiers": []
				},
				"customBackground": {
					"name": null,
					"description": null,
					"backgroundFeature": null,
					"backgroundCharacteristics": null,
					"backgroundType": null,
					"dynamicModifiers": []
				},
				"dynamicModifiers": [
					{
						"id": "background_17_2182",
						"type": "proficiency",
						"subType": "athletics",
						"dice": {
							"diceCount": null,
							"diceValue": null,
							"diceMultiplier": null,
							"fixedValue": null,
							"diceString": null
						},
						"restriction": "",
						"stat": null,
						"requiresAttunement": false,
						"duration": {
							"durationInterval": 0,
							"durationUnit": null
						},
						"friendlyTypeName": "Proficiency",
						"friendlySubtypeName": "Athletics",
						"value": null
					},
					{
						"id": "background_17_2183",
						"type": "proficiency",
						"subType": "survival",
						"dice": {
							"diceCount": null,
							"diceValue": null,
							"diceMultiplier": null,
							"fixedValue": null,
							"diceString": null
						},
						"restriction": "",
						"stat": null,
						"requiresAttunement": false,
						"duration": {
							"durationInterval": 0,
							"durationUnit": null
						},
						"friendlyTypeName": "Proficiency",
						"friendlySubtypeName": "Survival",
						"value": null
					},
					{
						"id": "background_17_2184",
						"type": "proficiency",
						"subType": "drum",
						"dice": {
							"diceCount": null,
							"diceValue": null,
							"diceMultiplier": null,
							"fixedValue": null,
							"diceString": null
						},
						"restriction": "",
						"stat": null,
						"requiresAttunement": false,
						"duration": {
							"durationInterval": 0,
							"durationUnit": null
						},
						"friendlyTypeName": "Proficiency",
						"friendlySubtypeName": "Drum",
						"value": null
					},
					{
						"id": "background_17_2185",
						"type": "language",
						"subType": "giant",
						"dice": {
							"diceCount": null,
							"diceValue": null,
							"diceMultiplier": null,
							"fixedValue": null,
							"diceString": null
						},
						"restriction": "",
						"stat": null,
						"requiresAttunement": false,
						"duration": {
							"durationInterval": 0,
							"durationUnit": null
						},
						"friendlyTypeName": "Language",
						"friendlySubtypeName": "Giant",
						"value": null
					}
				]
			},
			"feats": []
		},
		"hitPoints": {
			"max": 22,
			"base": 22,
			"bonus": null,
			"override": null,
			"current": 12,
			"removed": 0,
			"temp": 0,
			"hitDice": {
				"levels": 3,
				"used": "placeholder"
			}
		},
		"inventory": {
			"armor": [
				{
					"uniqueId": 18343282,
					"definition": {
						"baseTypeID": 701257905,
						"id": 10,
						"entityTypeId": 701257905,
						"canEquip": true,
						"magic": false,
						"name": "Leather",
						"baseArmorName": "Leather",
						"weight": 10.00,
						"type": "Light Armor",
						"description": "<p>The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil. The rest of the armor is made of softer and more flexible materials.</p>",
						"canAttune": false,
						"bundleSize": 1,
						"strengthRequirement": 0,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": false,
						"armorClass": 11,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Armor",
						"isPack": false,
						"grantedModifiers": []
					},
					"isAttuned": false,
					"equipped": true,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				}
			],
			"gear": [
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 20,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Backpack",
						"weight": 5.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>A backpack is a leather pack carried on the back, typically with straps to secure it. A backpack can hold&nbsp;1 cubic foot/ 30 pounds of gear.</p>\r\n<p>You can also strap items, such as a bedroll or a coil of rope, to the outside of a backpack.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343285,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 24,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Bedroll",
						"weight": 7.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>You never know where you&rsquo;re going to sleep, and a bedroll helps you get better sleep in a hayloft or on the cold ground. A bedroll consists of bedding and a blanket thin enough to be rolled up and tied. In an emergency, it can double as a stretcher.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343286,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 41,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Clothes, Traveler's",
						"weight": 4.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>This set of clothes could consist of boots, a wool skirt or breeches, a sturdy belt, a shirt (perhaps with a vest or jacket), and an ample cloak with a hood.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343297,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 52,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Hunting Trap",
						"weight": 25.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>When you use your action to set it, this trap forms a saw-toothed steel ring that snaps shut when a creature steps on a pressure plate in the center. The trap is affixed by a heavy chain to an immobile object, such as a tree or a spike driven into the ground. A creature that steps on the plate must succeed on a DC 13 Dexterity saving throw or take 1d4 piercing damage and stop moving. Thereafter, until the creature breaks free of the trap, its movement is limited by the length of the chain (typically 3 feet long). A creature can use its action to make a DC 13 Strength check, freeing itself or another creature within its reach on a success. Each failed check deals 1 piercing damage to the trapped creature.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343296,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 61,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Mess Kit",
						"weight": 1.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>This tin box contains a cup and simple cutlery. The box clamps together, and one side can be used as a cooking pan and the other as a plate or shallow bowl.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343287,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 71,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Potion of Healing",
						"weight": 0.50,
						"type": "Gear",
						"subType": "Potion",
						"description": "<p>A character who drinks the magical red fluid in this vial regains 2d4 + 2 hit points. Drinking or administering a potion takes an action.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": true,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343887,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 75,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Rations (1 day)",
						"weight": 2.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>Rations consist of dry foods suitable for extended travel, including jerky, dried fruit, hardtack, and nuts.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343290,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 10,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 77,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Rope, Hempen (50 feet)",
						"weight": 10.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>Rope,&nbsp;has 2 hit points and can be burst with a DC 17 Strength check.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343292,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 90,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Tinderbox",
						"weight": 1.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>This small container holds flint, fire steel, and tinder (usually dry cloth soaked in light oil) used to kindle a fire. Using it to light a torch -- or anything else with abundant, exposed fuel -- takes an action. Lighting any other fire takes 1 minute.</p>\r\n<p>&nbsp;</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343288,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 91,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Torch",
						"weight": 1.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>A torch burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet. If you make a melee attack with a burning torch and hit, it deals 1 fire damage.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343289,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 10,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 92,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Waterskin",
						"weight": 5.00,
						"type": "Gear",
						"subType": "Adventuring Gear",
						"description": "<p>A waterskin can hold&nbsp;4 pints of liquid.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343291,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 2103445194,
						"id": 153,
						"entityTypeId": 2103445194,
						"canEquip": false,
						"bundleSize": 1,
						"magic": false,
						"name": "Staff",
						"weight": 4.00,
						"type": "Gear",
						"subType": "Arcane Focus",
						"description": "<p>An arcane focus is a special item designed to channel the power of arcane spells. A sorcerer, warlock, or wizard can use such an item as a spellcasting focus, as described in&nbsp;the <span style=\"color: #47d18c;\"><a style=\"color: #47d18c;\" title=\"Arcane Focus\" href=\"https://www.dndbeyond.com/compendium/rules/basic-rules/spellcasting#MaterialM\">Spellcasting</a></span> section.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": true,
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"filterType": "Other Gear",
						"isConsumable": false,
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343295,
					"typeId": 1439493548,
					"isAttuned": false,
					"equipped": false,
					"quantity": 1,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"displayAsAttack": null,
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				}
			],
			"weapons": [
				{
					"definition": {
						"baseTypeID": 1782728300,
						"id": 30,
						"entityTypeId": 1782728300,
						"magic": false,
						"canEquip": true,
						"bundleSize": 1,
						"name": "Shortsword",
						"weight": 2.00,
						"type": "Shortsword",
						"description": "<p>Proficiency with a shortsword allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": false,
						"damage": {
							"diceCount": 1,
							"diceValue": 6,
							"diceMultiplier": null,
							"fixedValue": null,
							"diceString": "1d6"
						},
						"damageType": "Piercing",
						"fixedDamage": null,
						"properties": [
							{
								"id": 2,
								"name": "Finesse",
								"description": "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls. "
							},
							{
								"id": 4,
								"name": "Light",
								"description": "A light weapon is small and easy to handle, making it ideal for use when fighting with two weapons. "
							}
						],
						"statModifier": {
							"str": true,
							"dex": true
						},
						"attackType": "Melee",
						"category": "Martial",
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"range": 5,
						"longRange": 5,
						"filterType": "Weapon",
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343283,
					"typeId": 1439493548,
					"quantity": 1,
					"isAttuned": false,
					"equipped": true,
					"displayAsAttack": null,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 1782728300,
						"id": 30,
						"entityTypeId": 1782728300,
						"magic": false,
						"canEquip": true,
						"bundleSize": 1,
						"name": "Shortsword",
						"weight": 2.00,
						"type": "Shortsword",
						"description": "<p>Proficiency with a shortsword allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": false,
						"damage": {
							"diceCount": 1,
							"diceValue": 6,
							"diceMultiplier": null,
							"fixedValue": null,
							"diceString": "1d6"
						},
						"damageType": "Piercing",
						"fixedDamage": null,
						"properties": [
							{
								"id": 2,
								"name": "Finesse",
								"description": "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls. "
							},
							{
								"id": 4,
								"name": "Light",
								"description": "A light weapon is small and easy to handle, making it ideal for use when fighting with two weapons. "
							}
						],
						"statModifier": {
							"str": true,
							"dex": true
						},
						"attackType": "Melee",
						"category": "Martial",
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"range": 5,
						"longRange": 5,
						"filterType": "Weapon",
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343284,
					"typeId": 1439493548,
					"quantity": 1,
					"isAttuned": false,
					"equipped": true,
					"displayAsAttack": null,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				},
				{
					"definition": {
						"baseTypeID": 1782728300,
						"id": 37,
						"entityTypeId": 1782728300,
						"magic": false,
						"canEquip": true,
						"bundleSize": 1,
						"name": "Longbow",
						"weight": 2.00,
						"type": "Longbow",
						"description": "<p>Proficiency with a longbow allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p>",
						"canAttune": false,
						"rarity": null,
						"isHomebrew": false,
						"version": null,
						"stackable": false,
						"damage": {
							"diceCount": 1,
							"diceValue": 8,
							"diceMultiplier": null,
							"fixedValue": null,
							"diceString": "1d8"
						},
						"damageType": "Piercing",
						"fixedDamage": null,
						"properties": [
							{
								"id": 1,
								"name": "Ammunition",
								"description": "You can use a weapon that has the ammunition property to make a ranged attack only if you have ammunition to fire from the weapon. Each time you attack with the weapon, you expend one piece of ammunition. Drawing the ammunition from a quiver, case, or other container is part of the attack (you need a free hand to load a one-handed weapon). At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield. \r\nIf you use a weapon that has the ammunition property to make a melee attack, you treat the weapon as an improvised weapon (see \"Improvised Weapons\" later in the section). A sling must be loaded to deal any damage when used in this way. "
							},
							{
								"id": 3,
								"name": "Heavy",
								"description": "Small creatures have disadvantage on attack rolls with heavy weapons. A heavy weapon's size and bulk make it too large for a Small creature to use effectively. "
							},
							{
								"id": 7,
								"name": "Range",
								"description": "A weapon that can be used to make a ranged attack has a range in parentheses after the ammunition or thrown property. The range lists two numbers. The first is the weapon's normal range in feet, and the second indicates the weapon's long range. When attacking a target beyond normal range, you have disadvantage on the attack roll. You can't attack a target beyond the weapon's long range. "
							},
							{
								"id": 11,
								"name": "Two-Handed",
								"description": "This weapon requires two hands when you attack with it. "
							}
						],
						"statModifier": {
							"str": false,
							"dex": true
						},
						"attackType": "Ranged",
						"category": "Martial",
						"avatarUrl": null,
						"largeAvatarUrl": null,
						"range": 150,
						"longRange": 600,
						"filterType": "Weapon",
						"isPack": false,
						"weaponBehaviors": [],
						"grantedModifiers": []
					},
					"uniqueId": 18343293,
					"typeId": 1439493548,
					"quantity": 1,
					"isAttuned": false,
					"equipped": true,
					"displayAsAttack": null,
					"itemCustomData": {
						"nameOverride": null,
						"notes": null,
						"damageBonus": null,
						"toHitBonus": null,
						"toHitOverride": null,
						"isOffhand": null,
						"isSilver": false,
						"isAdamantine": false,
						"saveDCBonus": null,
						"saveDCOverride": null,
						"weightOverride": null
					},
					"abilities": {
						"spells": [],
						"actions": []
					},
					"limitedUseAbilities": []
				}
			]
		},
		"languages": [],
		"lifestyle": null,
		"organization": {
			"name": "None",
			"imageSrc": "placeholder"
		},
		"characterAdjustments": [],
		"customDefenseAdjustments": [],
		"customSenses": [],
		"customSpeeds": [],
		"customSkills": [],
		"customTools": [],
		"customLanguages": [],
		"customAttacks": [],
		"overridePassivePerception": null,
		"weightSpeeds": {
			"normal": {
				"walk": 30,
				"fly": 0,
				"burrow": 0,
				"swim": 0,
				"climb": 0
			},
			"encumbered": {
				"walk": 25,
				"fly": -5,
				"burrow": -5,
				"swim": -5,
				"climb": -5
			},
			"heavilyEncumbered": {
				"walk": 10,
				"fly": -20,
				"burrow": -20,
				"swim": -20,
				"climb": -20
			},
			"pushDragLift": {
				"walk": 5,
				"fly": 5,
				"burrow": 5,
				"swim": 5,
				"climb": 5
			},
			"override": {
				"walk": null,
				"fly": null,
				"burrow": null,
				"swim": null,
				"climb": null
			}
		},
		"spellSlots": [
			{
				"level": 1,
				"used": 0,
				"available": 0
			},
			{
				"level": 2,
				"used": 0,
				"available": 0
			},
			{
				"level": 3,
				"used": 0,
				"available": 0
			},
			{
				"level": 4,
				"used": 0,
				"available": 0
			},
			{
				"level": 5,
				"used": 0,
				"available": 0
			},
			{
				"level": 6,
				"used": 0,
				"available": 0
			},
			{
				"level": 7,
				"used": 0,
				"available": 0
			},
			{
				"level": 8,
				"used": 0,
				"available": 0
			},
			{
				"level": 9,
				"used": 0,
				"available": 0
			}
		],
		"pactMagic": [
			{
				"level": 1,
				"used": 0,
				"available": 0
			},
			{
				"level": 2,
				"used": 0,
				"available": 0
			},
			{
				"level": 3,
				"used": 0,
				"available": 0
			},
			{
				"level": 4,
				"used": 0,
				"available": 0
			},
			{
				"level": 5,
				"used": 0,
				"available": 0
			}
		],
		"stats": {
			"str": 9,
			"dex": 12,
			"con": 10,
			"int": 15,
			"cha": 10,
			"wis": 15
		},
		"bonusStats": {
			"str": null,
			"dex": null,
			"con": null,
			"int": null,
			"cha": null,
			"wis": null
		},
		"overrideStats": {
			"str": null,
			"dex": null,
			"con": null,
			"int": null,
			"cha": null,
			"wis": null
		},
		"traits": {
			"personalityTraits": "I have a lesson for every situation, drawn from observing nature.\nI once ran twenty-five miles without stopping to warn to my clan of an approaching orc horde. I’d do it again if I had to.",
			"ideals": "Nature. The natural world is more important than all the constructs of civilization. (Neutral)",
			"bonds": "I suffer awful visions of a coming disaster and will do anything to prevent it.",
			"flaws": "I remember every insult I’ve received and nurse a silent resentment toward anyone who’s ever wronged me.",
			"appearance": null
		},
		"wildshapes": "placeholder",
		"notes": {
			"allies": null,
			"personalPossessions": "a trophy from an animal you killed",
			"otherHoldings": null,
			"organizations": null,
			"enemies": null,
			"backstory": null,
			"otherNotes": null
		}
	},
	"sheet": {
		"configuration": {
			"startingEquipmentType": 3,
			"abilityScoreType": 3,
			"showHelpText": false
		}
	},
	"sheetData": {
		"weaponProperties": [
			{
				"id": 1,
				"name": "Ammunition",
				"prerequisite": null,
				"description": "You can use a weapon that has the ammunition property to make a ranged attack only if you have ammunition to fire from the weapon. Each time you attack with the weapon, you expend one piece of ammunition. Drawing the ammunition from a quiver, case, or other container is part of the attack (you need a free hand to load a one-handed weapon). At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield. \r\nIf you use a weapon that has the ammunition property to make a melee attack, you treat the weapon as an improvised weapon (see \"Improvised Weapons\" later in the section). A sling must be loaded to deal any damage when used in this way. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 2,
				"name": "Finesse",
				"prerequisite": null,
				"description": "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 3,
				"name": "Heavy",
				"prerequisite": null,
				"description": "Small creatures have disadvantage on attack rolls with heavy weapons. A heavy weapon's size and bulk make it too large for a Small creature to use effectively. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 4,
				"name": "Light",
				"prerequisite": null,
				"description": "A light weapon is small and easy to handle, making it ideal for use when fighting with two weapons. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 5,
				"name": "Loading",
				"prerequisite": null,
				"description": "Because of the time required to load this weapon, you can fire only one piece of ammunition from it when you use an action, bonus action, or reaction to fire it, regardless of the number of attacks you can normally make. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 7,
				"name": "Range",
				"prerequisite": null,
				"description": "A weapon that can be used to make a ranged attack has a range in parentheses after the ammunition or thrown property. The range lists two numbers. The first is the weapon's normal range in feet, and the second indicates the weapon's long range. When attacking a target beyond normal range, you have disadvantage on the attack roll. You can't attack a target beyond the weapon's long range. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 8,
				"name": "Reach",
				"prerequisite": null,
				"description": "This weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for opportunity attacks with it. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 9,
				"name": "Special",
				"prerequisite": null,
				"description": "A weapon with the special property has unusual rules governing its use, explained in the weapon's description .",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 10,
				"name": "Thrown",
				"prerequisite": null,
				"description": "If a weapon has the thrown property, you can throw the weapon to make a ranged attack. If the weapon is a melee weapon, you use the same ability modifier for that attack roll and damage roll that you would use for a melee attack with the weapon. For example, if you throw a handaxe, you use your Strength, but if you throw a dagger, you can use either your Strength or your Dexterity, since the dagger has the finesse property. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 11,
				"name": "Two-Handed",
				"prerequisite": null,
				"description": "This weapon requires two hands when you attack with it. ",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 12,
				"name": "Versatile",
				"prerequisite": null,
				"description": "This weapon can be used with one or two hands. A damage value in parentheses appears with the property--the damage when the weapon is used with two hands to make a melee attack.\r\n\r\n",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 13,
				"name": "Ammunition (Firearms)",
				"prerequisite": null,
				"description": "The ammunition of a firearm is destroyed upon use. Renaissance and modern firearms use bullets. Futuristic firearms are powered by a special type of ammunition called energy cells. An energy cell contains enough power for all the shots its firearm can make.",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 14,
				"name": "Burst Fire",
				"prerequisite": null,
				"description": "A weapon that has the burst fire property can make a normal single-target attack, or it can spray a 10-foot-cube area within normal range with shots. Each creature in the area must succeed on a DC 15 Dexterity saving throw or take the weapon’s normal damage. This action uses ten pieces of ammunition.",
				"requiredLevel": null,
				"displayOrder": null
			},
			{
				"id": 15,
				"name": "Reload",
				"prerequisite": null,
				"description": "A limited number of shots can be made with a weapon that has the reload property. A character must then reload it using an action or a bonus action (the character’s choice).",
				"requiredLevel": null,
				"displayOrder": null
			}
		],
		"portraits": [
			{
				"id": 2,
				"name": null,
				"avatarId": 10064,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/64/150/150/636339379309450725.png",
				"raceId": 16,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 3,
				"name": null,
				"avatarId": 10065,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/65/150/150/636339379413013817.png",
				"raceId": 16,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 4,
				"name": null,
				"avatarId": 10066,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/66/150/150/636339379511585674.png",
				"raceId": 16,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 5,
				"name": null,
				"avatarId": 10067,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/67/150/150/636339379597405748.png",
				"raceId": 16,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 6,
				"name": null,
				"avatarId": 10068,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/68/150/150/636339379719284096.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 7,
				"name": null,
				"avatarId": 10069,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/69/150/150/636339379836386802.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 8,
				"name": null,
				"avatarId": 10070,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/70/150/150/636339380011151672.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 9,
				"name": null,
				"avatarId": 10071,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/71/150/150/636339380148524382.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 10,
				"name": null,
				"avatarId": 10072,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/72/150/150/636339380273407155.png",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 11,
				"name": null,
				"avatarId": 10073,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/73/150/150/636339380410900455.png",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 12,
				"name": null,
				"avatarId": 10074,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/74/150/150/636339380514834583.png",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 13,
				"name": null,
				"avatarId": 10075,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/75/150/150/636339380609392876.png",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 14,
				"name": null,
				"avatarId": 10076,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/76/150/150/636339380803463036.png",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 15,
				"name": null,
				"avatarId": 10077,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/77/150/150/636339380906111121.png",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 16,
				"name": null,
				"avatarId": 10078,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/78/150/150/636339381000380903.png",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 17,
				"name": null,
				"avatarId": 10079,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/79/150/150/636339381135015635.png",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 18,
				"name": null,
				"avatarId": 10080,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/80/150/150/636339381240957080.png",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 19,
				"name": null,
				"avatarId": 10081,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/81/150/150/636339381350287866.png",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 20,
				"name": null,
				"avatarId": 10082,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/82/150/150/636339381446749204.png",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 21,
				"name": null,
				"avatarId": 10083,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/83/150/150/636339381554374819.png",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 22,
				"name": null,
				"avatarId": 10084,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/84/150/150/636339381635861851.png",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 23,
				"name": null,
				"avatarId": 10085,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/85/150/150/636339381754406274.png",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 24,
				"name": null,
				"avatarId": 10086,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/86/150/150/636339381849352911.png",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 25,
				"name": null,
				"avatarId": 10087,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/87/150/150/636339381984960966.png",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 26,
				"name": null,
				"avatarId": 10088,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/88/150/150/636339382078092479.png",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 27,
				"name": null,
				"avatarId": 10089,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/89/150/150/636339382189764523.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 28,
				"name": null,
				"avatarId": 10090,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/90/150/150/636339382313449109.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 29,
				"name": null,
				"avatarId": 10091,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/91/150/150/636339382406329447.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 30,
				"name": null,
				"avatarId": 10092,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/92/150/150/636339382508535391.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 31,
				"name": null,
				"avatarId": 10093,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/93/150/150/636339382612972808.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 32,
				"name": null,
				"avatarId": 10094,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/94/150/150/636339382701412358.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 33,
				"name": null,
				"avatarId": 10615,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/615/150/150/636344362224477726.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 34,
				"name": null,
				"avatarId": 10622,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/622/150/150/636344368141119831.png",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 35,
				"name": null,
				"avatarId": 10625,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/625/150/150/636344369279195008.png",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 36,
				"name": null,
				"avatarId": 10628,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/628/150/150/636344370776687347.png",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 37,
				"name": null,
				"avatarId": 10629,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/629/150/150/636344371217342714.png",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 38,
				"name": null,
				"avatarId": 10630,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/630/150/150/636344371840983463.png",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 39,
				"name": null,
				"avatarId": 10633,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/633/150/150/636344373213808272.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 40,
				"name": null,
				"avatarId": 10635,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/635/150/150/636344374342888622.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 41,
				"name": null,
				"avatarId": 10636,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/636/150/150/636344374486383481.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 42,
				"name": null,
				"avatarId": 10638,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/638/150/150/636344374784085840.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 43,
				"name": null,
				"avatarId": 10640,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/640/150/150/636344375263661139.png",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 44,
				"name": null,
				"avatarId": 10641,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/10/641/150/150/636344375495562561.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 45,
				"name": null,
				"avatarId": 17154,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/154/150/150/636377825624852932.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 46,
				"name": null,
				"avatarId": 17155,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/155/150/150/636377825909803976.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 47,
				"name": null,
				"avatarId": 17156,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/156/150/150/636377826331197781.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 48,
				"name": null,
				"avatarId": 17157,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/157/150/150/636377826514551742.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 51,
				"name": null,
				"avatarId": 17160,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/160/150/150/636377827176444845.jpeg",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 52,
				"name": null,
				"avatarId": 17161,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/161/150/150/636377827302419864.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 53,
				"name": null,
				"avatarId": 17162,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/162/150/150/636377827378716316.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 54,
				"name": null,
				"avatarId": 17163,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/163/150/150/636377827546987333.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 55,
				"name": null,
				"avatarId": 17164,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/164/150/150/636377828005034092.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 56,
				"name": null,
				"avatarId": 17165,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/165/150/150/636377828655941359.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 57,
				"name": null,
				"avatarId": 17166,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/166/150/150/636377828756485888.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 58,
				"name": null,
				"avatarId": 17167,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/167/150/150/636377830021620371.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 59,
				"name": null,
				"avatarId": 17168,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/168/150/150/636377830157310678.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 60,
				"name": null,
				"avatarId": 17169,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/169/150/150/636377830312671244.jpeg",
				"raceId": 23,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 61,
				"name": null,
				"avatarId": 17170,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/170/150/150/636377831239912223.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 62,
				"name": null,
				"avatarId": 17171,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/171/150/150/636377831882950286.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 63,
				"name": null,
				"avatarId": 17172,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/172/150/150/636377831982121416.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 64,
				"name": null,
				"avatarId": 17173,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/173/150/150/636377832941024571.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 65,
				"name": null,
				"avatarId": 17174,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/174/150/150/636377833703616218.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 66,
				"name": null,
				"avatarId": 17175,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/175/150/150/636377833949480548.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 67,
				"name": null,
				"avatarId": 17176,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/176/150/150/636377834442382599.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 68,
				"name": null,
				"avatarId": 17177,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/177/150/150/636377835377765964.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 69,
				"name": null,
				"avatarId": 17178,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/178/150/150/636377835492897814.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 70,
				"name": null,
				"avatarId": 17179,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/179/150/150/636377835623886578.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 71,
				"name": null,
				"avatarId": 17180,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/180/150/150/636377835862891583.jpeg",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 72,
				"name": null,
				"avatarId": 17181,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/181/150/150/636377836214378109.jpeg",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 73,
				"name": null,
				"avatarId": 17182,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/182/150/150/636377836425529683.jpeg",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 74,
				"name": null,
				"avatarId": 17183,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/183/150/150/636377836711568219.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 75,
				"name": null,
				"avatarId": 17184,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/184/150/150/636377836834995016.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 76,
				"name": null,
				"avatarId": 17185,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/185/150/150/636377836954914067.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 77,
				"name": null,
				"avatarId": 17186,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/186/150/150/636377837087207872.jpeg",
				"raceId": 23,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 78,
				"name": null,
				"avatarId": 17187,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/187/150/150/636377837448314180.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 79,
				"name": null,
				"avatarId": 17188,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/188/150/150/636377837533739746.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 80,
				"name": null,
				"avatarId": 17189,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/189/150/150/636377837695498416.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 81,
				"name": null,
				"avatarId": 17190,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/190/150/150/636377837826960328.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 82,
				"name": null,
				"avatarId": 17192,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/192/150/150/636377837925620302.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 83,
				"name": null,
				"avatarId": 17193,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/193/150/150/636377838017798855.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 84,
				"name": null,
				"avatarId": 17194,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/194/150/150/636377838109963932.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 85,
				"name": null,
				"avatarId": 17196,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/196/150/150/636377838221407838.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 86,
				"name": null,
				"avatarId": 17198,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/198/150/150/636377838389204588.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 87,
				"name": null,
				"avatarId": 17199,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/199/150/150/636377838754393483.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 88,
				"name": null,
				"avatarId": 17200,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/200/150/150/636377838913420704.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 89,
				"name": null,
				"avatarId": 17201,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/201/150/150/636377839117243491.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 90,
				"name": null,
				"avatarId": 17202,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/202/150/150/636377839265520516.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 91,
				"name": null,
				"avatarId": 18022,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/22/150/150/636378979102191003.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 92,
				"name": null,
				"avatarId": 17204,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/204/150/150/636377839475886288.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 93,
				"name": null,
				"avatarId": 17205,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/205/150/150/636377839599106511.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 94,
				"name": null,
				"avatarId": 17206,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/206/150/150/636377840142917038.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 95,
				"name": null,
				"avatarId": 17207,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/207/150/150/636377840259813844.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 96,
				"name": null,
				"avatarId": 17208,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/208/150/150/636377840332911633.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 97,
				"name": null,
				"avatarId": 17209,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/209/150/150/636377840545349096.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 98,
				"name": null,
				"avatarId": 17210,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/210/150/150/636377840688795532.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 99,
				"name": null,
				"avatarId": 17212,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/212/150/150/636377840850178381.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 100,
				"name": null,
				"avatarId": 17213,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/213/150/150/636377840974085948.jpeg",
				"raceId": 16,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 101,
				"name": null,
				"avatarId": 17214,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/214/150/150/636377841114911601.jpeg",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 102,
				"name": null,
				"avatarId": 17215,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/215/150/150/636377841293013108.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 103,
				"name": null,
				"avatarId": 17216,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/216/150/150/636377841385140656.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 104,
				"name": null,
				"avatarId": 17217,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/217/150/150/636377841562510149.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 106,
				"name": null,
				"avatarId": 17219,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/219/150/150/636377841831944014.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 107,
				"name": null,
				"avatarId": 17220,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/220/150/150/636377841966070845.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 108,
				"name": null,
				"avatarId": 17221,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/221/150/150/636377842071269252.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 109,
				"name": null,
				"avatarId": 17224,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/224/150/150/636377842242565913.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 110,
				"name": null,
				"avatarId": 17225,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/225/150/150/636377843761000977.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 111,
				"name": null,
				"avatarId": 17226,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/226/150/150/636377843851038040.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 112,
				"name": null,
				"avatarId": 17227,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/227/150/150/636377844011580383.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 113,
				"name": null,
				"avatarId": 17228,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/228/150/150/636377844121446562.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 114,
				"name": null,
				"avatarId": 17229,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/229/150/150/636377844200136303.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 115,
				"name": null,
				"avatarId": 17230,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/230/150/150/636377844267563561.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 116,
				"name": null,
				"avatarId": 17231,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/231/150/150/636377844520908906.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 117,
				"name": null,
				"avatarId": 17232,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/232/150/150/636377844649658867.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 118,
				"name": null,
				"avatarId": 17238,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/238/150/150/636377856402505661.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 120,
				"name": null,
				"avatarId": 17240,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/240/150/150/636377856650860903.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 121,
				"name": null,
				"avatarId": 17241,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/241/150/150/636377856728563803.jpeg",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 122,
				"name": null,
				"avatarId": 17242,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/242/150/150/636377856793765562.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 123,
				"name": null,
				"avatarId": 17243,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/243/150/150/636377856865606298.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 124,
				"name": null,
				"avatarId": 17244,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/244/150/150/636377856934903605.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 125,
				"name": null,
				"avatarId": 17245,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/245/150/150/636377857024611889.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 126,
				"name": null,
				"avatarId": 17246,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/246/150/150/636377857106904174.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 127,
				"name": null,
				"avatarId": 17247,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/247/150/150/636377857203269808.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 128,
				"name": null,
				"avatarId": 17248,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/248/150/150/636377857362202006.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 129,
				"name": null,
				"avatarId": 17249,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/249/150/150/636377857469194789.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 130,
				"name": null,
				"avatarId": 17250,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/250/150/150/636377857619825795.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 131,
				"name": null,
				"avatarId": 17251,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/251/150/150/636377857915951259.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 132,
				"name": null,
				"avatarId": 17252,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/252/150/150/636377858260870422.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 133,
				"name": null,
				"avatarId": 17253,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/253/150/150/636377858378679911.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 134,
				"name": null,
				"avatarId": 17254,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/254/150/150/636377858453352344.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 135,
				"name": null,
				"avatarId": 17255,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/255/150/150/636377858541332848.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 136,
				"name": null,
				"avatarId": 17256,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/256/150/150/636377858616647759.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 137,
				"name": null,
				"avatarId": 17261,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/261/150/150/636377862226103644.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 138,
				"name": null,
				"avatarId": 17262,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/262/150/150/636377862352187412.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 139,
				"name": null,
				"avatarId": 17263,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/263/150/150/636377862436361057.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 140,
				"name": null,
				"avatarId": 17264,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/264/150/150/636377862686251217.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 141,
				"name": null,
				"avatarId": 17265,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/265/150/150/636377862807704534.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 142,
				"name": null,
				"avatarId": 17266,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/266/150/150/636377862896258254.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 143,
				"name": null,
				"avatarId": 17267,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/267/150/150/636377862992026097.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 144,
				"name": null,
				"avatarId": 17268,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/268/150/150/636377863156871634.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 145,
				"name": null,
				"avatarId": 17270,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/270/150/150/636377863286470360.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 148,
				"name": null,
				"avatarId": 17273,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/273/150/150/636377863597456516.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 149,
				"name": null,
				"avatarId": 17274,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/274/150/150/636377863880121523.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 150,
				"name": null,
				"avatarId": 17275,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/275/150/150/636377864043890834.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 151,
				"name": null,
				"avatarId": 17276,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/276/150/150/636377864295335580.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 153,
				"name": null,
				"avatarId": 17279,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/279/150/150/636377866163278249.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 154,
				"name": null,
				"avatarId": 17280,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/280/150/150/636377866301720734.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 155,
				"name": null,
				"avatarId": 17281,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/281/150/150/636377866413361374.jpeg",
				"raceId": 23,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 156,
				"name": null,
				"avatarId": 17282,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/282/150/150/636377866607613603.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 157,
				"name": null,
				"avatarId": 17283,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/283/150/150/636377866770497623.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 158,
				"name": null,
				"avatarId": 17284,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/284/150/150/636377866877491733.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 159,
				"name": null,
				"avatarId": 17285,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/285/150/150/636377867001757468.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 160,
				"name": null,
				"avatarId": 17286,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/286/150/150/636377867106935196.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 161,
				"name": null,
				"avatarId": 17287,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/287/150/150/636377867384281406.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 162,
				"name": null,
				"avatarId": 18034,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/34/150/150/636378997160492198.jpeg",
				"raceId": 36,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 163,
				"name": null,
				"avatarId": 17289,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/289/150/150/636377867593518386.jpeg",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 164,
				"name": null,
				"avatarId": 17290,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/290/150/150/636377867769707565.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 165,
				"name": null,
				"avatarId": 17291,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/291/150/150/636377867867167584.jpeg",
				"raceId": 33,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 166,
				"name": null,
				"avatarId": 17292,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/292/150/150/636377867957118136.jpeg",
				"raceId": 33,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 167,
				"name": null,
				"avatarId": 17293,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/293/150/150/636377868039540605.jpeg",
				"raceId": 33,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 168,
				"name": null,
				"avatarId": 17294,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/294/150/150/636377868265924122.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 169,
				"name": null,
				"avatarId": 17295,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/295/150/150/636377868391760750.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 170,
				"name": null,
				"avatarId": 17296,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/296/150/150/636377868492965726.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 171,
				"name": null,
				"avatarId": 17297,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/297/150/150/636377868633724878.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 172,
				"name": null,
				"avatarId": 17298,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/298/150/150/636377868797717426.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 173,
				"name": null,
				"avatarId": 17299,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/299/150/150/636377868942178238.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 174,
				"name": null,
				"avatarId": 17300,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/300/150/150/636377869105748733.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 175,
				"name": null,
				"avatarId": 17301,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/301/150/150/636377869208654940.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 176,
				"name": null,
				"avatarId": 17302,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/302/150/150/636377869312904057.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 177,
				"name": null,
				"avatarId": 17303,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/303/150/150/636377869594200239.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 178,
				"name": null,
				"avatarId": 17304,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/304/150/150/636377869796580051.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 179,
				"name": null,
				"avatarId": 17305,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/305/150/150/636377869899500880.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 180,
				"name": null,
				"avatarId": 17307,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/307/150/150/636377870339158532.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 181,
				"name": null,
				"avatarId": 17308,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/308/150/150/636377870599038830.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 182,
				"name": null,
				"avatarId": 17309,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/309/150/150/636377870690850049.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 183,
				"name": null,
				"avatarId": 17310,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/310/150/150/636377871028699922.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 184,
				"name": null,
				"avatarId": 17311,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/311/150/150/636377871242800383.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 185,
				"name": null,
				"avatarId": 17312,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/312/150/150/636377871350331474.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 186,
				"name": null,
				"avatarId": 17313,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/313/150/150/636377871467914716.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 188,
				"name": null,
				"avatarId": 17316,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/316/150/150/636377871943393080.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 190,
				"name": null,
				"avatarId": 17317,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/317/150/150/636377872155285027.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 191,
				"name": null,
				"avatarId": 17318,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/318/150/150/636377872286962737.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 192,
				"name": null,
				"avatarId": 17319,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/319/150/150/636377872388142144.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 193,
				"name": null,
				"avatarId": 17320,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/320/150/150/636377872467733878.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 194,
				"name": null,
				"avatarId": 17321,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/321/150/150/636377872554389391.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 195,
				"name": null,
				"avatarId": 17322,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/322/150/150/636377872706744240.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 196,
				"name": null,
				"avatarId": 17323,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/323/150/150/636377872802000561.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 197,
				"name": null,
				"avatarId": 17324,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/324/150/150/636377872898619539.jpeg",
				"raceId": 23,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 198,
				"name": null,
				"avatarId": 17325,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/325/150/150/636377872983373773.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 199,
				"name": null,
				"avatarId": 17326,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/326/150/150/636377873061440109.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 200,
				"name": null,
				"avatarId": 17327,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/327/150/150/636377873136670897.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 201,
				"name": null,
				"avatarId": 17328,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/328/150/150/636377873275440677.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 202,
				"name": null,
				"avatarId": 17329,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/329/150/150/636377873347549985.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 203,
				"name": null,
				"avatarId": 17330,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/330/150/150/636377873416924125.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 204,
				"name": null,
				"avatarId": 17331,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/331/150/150/636377873487476899.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 205,
				"name": null,
				"avatarId": 17332,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/332/150/150/636377873604711384.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 206,
				"name": null,
				"avatarId": 17333,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/333/150/150/636377873745786207.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 207,
				"name": null,
				"avatarId": 17334,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/334/150/150/636377873921745739.jpeg",
				"raceId": 33,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 208,
				"name": null,
				"avatarId": 17335,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/335/150/150/636377873997756608.jpeg",
				"raceId": 33,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 209,
				"name": null,
				"avatarId": 17336,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/336/150/150/636377874101155021.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 210,
				"name": null,
				"avatarId": 17337,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/337/150/150/636377874172770886.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 211,
				"name": null,
				"avatarId": 17338,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/338/150/150/636377874264854196.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 212,
				"name": null,
				"avatarId": 17339,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/339/150/150/636377874584772849.jpeg",
				"raceId": 23,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 213,
				"name": null,
				"avatarId": 17340,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/340/150/150/636377874717950950.jpeg",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 214,
				"name": null,
				"avatarId": 17341,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/341/150/150/636377874854563919.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 215,
				"name": null,
				"avatarId": 17342,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/342/150/150/636377874944041516.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 216,
				"name": null,
				"avatarId": 17343,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/343/150/150/636377875235979746.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 217,
				"name": null,
				"avatarId": 17344,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/344/150/150/636377875391231501.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 218,
				"name": null,
				"avatarId": 17345,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/345/150/150/636377875534113610.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 219,
				"name": null,
				"avatarId": 17346,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/346/150/150/636377875636872891.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 220,
				"name": null,
				"avatarId": 17347,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/347/150/150/636377875718460109.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 221,
				"name": null,
				"avatarId": 17349,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/349/150/150/636377875979979669.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 222,
				"name": null,
				"avatarId": 17350,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/350/150/150/636377876065310602.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 223,
				"name": null,
				"avatarId": 17351,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/351/150/150/636377876176703006.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 224,
				"name": null,
				"avatarId": 17352,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/352/150/150/636377876336478789.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 225,
				"name": null,
				"avatarId": 17353,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/353/150/150/636377876459510783.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 226,
				"name": null,
				"avatarId": 17354,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/354/150/150/636377876666593924.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 227,
				"name": null,
				"avatarId": 17355,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/355/150/150/636377876777142226.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 228,
				"name": null,
				"avatarId": 17356,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/356/150/150/636377876890901493.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 229,
				"name": null,
				"avatarId": 17357,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/357/150/150/636377876990013694.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 230,
				"name": null,
				"avatarId": 17358,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/358/150/150/636377877072436893.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 231,
				"name": null,
				"avatarId": 17359,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/359/150/150/636377877143602076.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 232,
				"name": null,
				"avatarId": 17360,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/360/150/150/636377877222554737.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 233,
				"name": null,
				"avatarId": 17361,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/361/150/150/636377877306566003.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 234,
				"name": null,
				"avatarId": 17362,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/362/150/150/636377877385104878.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 235,
				"name": null,
				"avatarId": 17363,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/363/150/150/636377877456196384.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 236,
				"name": null,
				"avatarId": 17364,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/364/150/150/636377877582054386.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 237,
				"name": null,
				"avatarId": 17365,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/365/150/150/636377877674410295.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 238,
				"name": null,
				"avatarId": 17366,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/366/150/150/636377877759190874.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 239,
				"name": null,
				"avatarId": 17367,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/367/150/150/636377877865944857.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 240,
				"name": null,
				"avatarId": 17368,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/368/150/150/636377878055945748.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 241,
				"name": null,
				"avatarId": 17369,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/369/150/150/636377878213343631.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 242,
				"name": null,
				"avatarId": 17371,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/371/150/150/636377878343327954.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 244,
				"name": null,
				"avatarId": 17373,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/373/150/150/636377878542751730.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 245,
				"name": null,
				"avatarId": 17375,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/375/150/150/636377878996638946.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 246,
				"name": null,
				"avatarId": 17376,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/376/150/150/636377879102297434.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 247,
				"name": null,
				"avatarId": 17377,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/377/150/150/636377879243335638.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 248,
				"name": null,
				"avatarId": 17378,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/378/150/150/636377879351118141.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 249,
				"name": null,
				"avatarId": 17379,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/379/150/150/636377879493212911.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 250,
				"name": null,
				"avatarId": 17380,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/380/150/150/636377879578607062.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 251,
				"name": null,
				"avatarId": 17381,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/381/150/150/636377879665129323.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 252,
				"name": null,
				"avatarId": 17382,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/382/150/150/636377879833597857.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 253,
				"name": null,
				"avatarId": 17383,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/383/150/150/636377879921332854.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 254,
				"name": null,
				"avatarId": 17384,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/384/150/150/636377880395281033.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 255,
				"name": null,
				"avatarId": 17386,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/386/150/150/636377880520023014.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 256,
				"name": null,
				"avatarId": 17387,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/387/150/150/636377880647312249.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 257,
				"name": null,
				"avatarId": 17388,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/388/150/150/636377880727048181.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 258,
				"name": null,
				"avatarId": 17389,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/389/150/150/636377880805807604.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 259,
				"name": null,
				"avatarId": 17390,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/390/150/150/636377880886891259.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 260,
				"name": null,
				"avatarId": 17391,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/391/150/150/636377881066685244.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 261,
				"name": null,
				"avatarId": 17393,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/393/150/150/636377881175914659.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 262,
				"name": null,
				"avatarId": 17394,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/394/150/150/636377881340243539.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 263,
				"name": null,
				"avatarId": 17395,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/395/150/150/636377882521764962.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 264,
				"name": null,
				"avatarId": 17396,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/396/150/150/636377882615605894.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 265,
				"name": null,
				"avatarId": 17397,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/397/150/150/636377882729451787.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 266,
				"name": null,
				"avatarId": 17398,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/398/150/150/636377882830319720.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 267,
				"name": null,
				"avatarId": 17399,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/399/150/150/636377882943847193.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 268,
				"name": null,
				"avatarId": 17400,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/400/150/150/636377883039596116.jpeg",
				"raceId": 16,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 269,
				"name": null,
				"avatarId": 17401,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/401/150/150/636377883151893598.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 270,
				"name": null,
				"avatarId": 17402,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/402/150/150/636377883228142187.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 271,
				"name": null,
				"avatarId": 17403,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/403/150/150/636377883294983260.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 272,
				"name": null,
				"avatarId": 17404,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/404/150/150/636377883412350271.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 273,
				"name": null,
				"avatarId": 17405,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/405/150/150/636377883493713531.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 274,
				"name": null,
				"avatarId": 17406,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/406/150/150/636377883592392855.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 275,
				"name": null,
				"avatarId": 17407,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/407/150/150/636377883694580108.jpeg",
				"raceId": 16,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 276,
				"name": null,
				"avatarId": 17408,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/408/150/150/636377883799264590.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 277,
				"name": null,
				"avatarId": 17410,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/410/150/150/636377884211403806.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 278,
				"name": null,
				"avatarId": 17411,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/411/150/150/636377884405408224.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 279,
				"name": null,
				"avatarId": 17412,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/412/150/150/636377884501123819.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 280,
				"name": null,
				"avatarId": 17413,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/413/150/150/636377884703064507.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 281,
				"name": null,
				"avatarId": 17414,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/414/150/150/636377884818638186.jpeg",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 282,
				"name": null,
				"avatarId": 17415,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/415/150/150/636377885173419481.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 283,
				"name": null,
				"avatarId": 17416,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/416/150/150/636377885263619822.jpeg",
				"raceId": 4,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 284,
				"name": null,
				"avatarId": 17417,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/417/150/150/636377885835403037.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 285,
				"name": null,
				"avatarId": 17418,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/418/150/150/636377885915774563.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 286,
				"name": null,
				"avatarId": 17419,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/419/150/150/636377886134378166.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 287,
				"name": null,
				"avatarId": 17420,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/420/150/150/636377886265995342.jpeg",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 288,
				"name": null,
				"avatarId": 17421,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/421/150/150/636377886358134178.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 289,
				"name": null,
				"avatarId": 17422,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/422/150/150/636377886571004913.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 290,
				"name": null,
				"avatarId": 17423,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/423/150/150/636377886669727372.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 291,
				"name": null,
				"avatarId": 17424,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/424/150/150/636377886749285983.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 292,
				"name": null,
				"avatarId": 17426,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/426/150/150/636377886835250599.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 293,
				"name": null,
				"avatarId": 17428,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/428/150/150/636377886920052559.jpeg",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 294,
				"name": null,
				"avatarId": 17429,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/429/150/150/636377887024636048.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 295,
				"name": null,
				"avatarId": 17430,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/430/150/150/636377887161624746.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 296,
				"name": null,
				"avatarId": 17432,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/432/150/150/636377887237084927.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 297,
				"name": null,
				"avatarId": 17433,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/433/150/150/636377887327568601.jpeg",
				"raceId": 31,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 298,
				"name": null,
				"avatarId": 17434,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/434/150/150/636377887423439666.jpeg",
				"raceId": 30,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 299,
				"name": null,
				"avatarId": 17435,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/435/150/150/636377887500737585.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 300,
				"name": null,
				"avatarId": 17436,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/436/150/150/636377887578062153.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 301,
				"name": null,
				"avatarId": 17437,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/437/150/150/636377887660746070.jpeg",
				"raceId": 25,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 302,
				"name": null,
				"avatarId": 17438,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/438/150/150/636377887741450723.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 303,
				"name": null,
				"avatarId": 17439,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/439/150/150/636377887825063894.jpeg",
				"raceId": 29,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 304,
				"name": null,
				"avatarId": 17440,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/440/150/150/636377887942240212.jpeg",
				"raceId": 35,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 305,
				"name": null,
				"avatarId": 17441,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/441/150/150/636377888040937007.jpeg",
				"raceId": 35,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 306,
				"name": null,
				"avatarId": 17443,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/443/150/150/636377888108346149.jpeg",
				"raceId": 35,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 307,
				"name": null,
				"avatarId": 17444,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/444/150/150/636377888514060153.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 308,
				"name": null,
				"avatarId": 17445,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/445/150/150/636377888642793044.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 309,
				"name": null,
				"avatarId": 17446,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/446/150/150/636377888754099915.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 310,
				"name": null,
				"avatarId": 17448,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/448/150/150/636377889607106256.jpeg",
				"raceId": 34,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 311,
				"name": null,
				"avatarId": 17449,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/449/150/150/636377889693945829.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 312,
				"name": null,
				"avatarId": 17450,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/450/150/150/636377889875824453.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 313,
				"name": null,
				"avatarId": 17451,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/451/150/150/636377889944252849.jpeg",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 314,
				"name": null,
				"avatarId": 17452,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/452/150/150/636377890039744108.jpeg",
				"raceId": 22,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 315,
				"name": null,
				"avatarId": 17453,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/453/150/150/636377890130493730.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 316,
				"name": null,
				"avatarId": 17455,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/455/150/150/636377890240600960.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 317,
				"name": null,
				"avatarId": 17456,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/456/150/150/636377890325250045.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 318,
				"name": null,
				"avatarId": 17457,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/457/150/150/636377890403638417.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 319,
				"name": null,
				"avatarId": 17458,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/458/150/150/636377890518639622.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 320,
				"name": null,
				"avatarId": 17459,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/459/150/150/636377890582757359.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 321,
				"name": null,
				"avatarId": 17460,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/460/150/150/636377890745985870.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 322,
				"name": null,
				"avatarId": 17461,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/461/150/150/636377890881769341.jpeg",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 323,
				"name": null,
				"avatarId": 17462,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/462/150/150/636377890984555900.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 324,
				"name": null,
				"avatarId": 17463,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/463/150/150/636377891051966547.jpeg",
				"raceId": 24,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 325,
				"name": null,
				"avatarId": 17464,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/464/150/150/636377891128895915.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 326,
				"name": null,
				"avatarId": 17465,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/465/150/150/636377891214338261.jpeg",
				"raceId": 28,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 327,
				"name": null,
				"avatarId": 17466,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/466/150/150/636377891294116113.jpeg",
				"raceId": 3,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 328,
				"name": null,
				"avatarId": 17467,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/467/150/150/636377891399337253.jpeg",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 329,
				"name": null,
				"avatarId": 17468,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/468/150/150/636377891490355427.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 330,
				"name": null,
				"avatarId": 17469,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/469/150/150/636377891555184520.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 331,
				"name": null,
				"avatarId": 17470,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/470/150/150/636377891653936633.jpeg",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 332,
				"name": null,
				"avatarId": 17471,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/471/150/150/636377891726301741.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 333,
				"name": null,
				"avatarId": 17472,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/472/150/150/636377891803152540.jpeg",
				"raceId": 1,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 334,
				"name": null,
				"avatarId": 17473,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/473/150/150/636377891886150983.jpeg",
				"raceId": 32,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 335,
				"name": null,
				"avatarId": 17474,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/474/150/150/636377891990759431.jpeg",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 336,
				"name": null,
				"avatarId": 17475,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/475/150/150/636377892081117154.jpeg",
				"raceId": 2,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 337,
				"name": null,
				"avatarId": 17476,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/476/150/150/636377892149045562.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 338,
				"name": null,
				"avatarId": 17733,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/733/150/150/636378312343935370.jpeg",
				"raceId": 4,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 339,
				"name": null,
				"avatarId": 17734,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/734/150/150/636378312672050440.jpeg",
				"raceId": 32,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 340,
				"name": null,
				"avatarId": 17744,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/744/150/150/636378330799769607.jpeg",
				"raceId": 34,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 341,
				"name": null,
				"avatarId": 17745,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/745/150/150/636378330950560976.jpeg",
				"raceId": 34,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 342,
				"name": null,
				"avatarId": 17746,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/746/150/150/636378331319294770.jpeg",
				"raceId": 34,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 343,
				"name": null,
				"avatarId": 17747,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/747/150/150/636378331895705713.jpeg",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 344,
				"name": "",
				"avatarId": 17921,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/921/150/150/636378851716447403.jpeg",
				"raceId": 4,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 345,
				"name": null,
				"avatarId": 17922,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/922/150/150/636378852318124592.jpeg",
				"raceId": 30,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 346,
				"name": null,
				"avatarId": 17923,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/923/150/150/636378852453503201.jpeg",
				"raceId": 30,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 347,
				"name": null,
				"avatarId": 17924,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/924/150/150/636378852753221520.jpeg",
				"raceId": 30,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 348,
				"name": null,
				"avatarId": 17925,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/925/150/150/636378853066085526.png",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 349,
				"name": null,
				"avatarId": 17926,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/926/150/150/636378853242581695.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 350,
				"name": null,
				"avatarId": 17927,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/927/150/150/636378853439963263.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 351,
				"name": null,
				"avatarId": 17930,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/930/150/150/636378855296814599.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 352,
				"name": null,
				"avatarId": 17931,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/931/150/150/636378855466216266.png",
				"raceId": 7,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 353,
				"name": null,
				"avatarId": 17932,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/932/150/150/636378855806248172.png",
				"raceId": 20,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 354,
				"name": null,
				"avatarId": 17964,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/964/150/150/636378921629110868.jpeg",
				"raceId": 24,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 355,
				"name": null,
				"avatarId": 17965,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/965/150/150/636378921768973657.jpeg",
				"raceId": 24,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 356,
				"name": null,
				"avatarId": 17967,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/967/150/150/636378922847680252.jpeg",
				"raceId": 24,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 357,
				"name": null,
				"avatarId": 17969,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/969/150/150/636378926856690034.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 358,
				"name": null,
				"avatarId": 17970,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/970/150/150/636378927804412295.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 359,
				"name": null,
				"avatarId": 17971,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/971/150/150/636378927902947937.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 360,
				"name": null,
				"avatarId": 17972,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/972/150/150/636378928384605480.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 361,
				"name": null,
				"avatarId": 17974,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/974/150/150/636378928531490132.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 362,
				"name": null,
				"avatarId": 17975,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/975/150/150/636378928657502388.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 363,
				"name": null,
				"avatarId": 17976,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/976/150/150/636378928774630258.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 364,
				"name": null,
				"avatarId": 17977,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/977/150/150/636378930275004249.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 365,
				"name": null,
				"avatarId": 17978,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/978/150/150/636378930429294917.png",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 368,
				"name": null,
				"avatarId": 17986,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/986/150/150/636378942824116263.jpeg",
				"raceId": 32,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 369,
				"name": null,
				"avatarId": 17987,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/987/150/150/636378943121228376.jpeg",
				"raceId": 32,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 370,
				"name": null,
				"avatarId": 17988,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/17/988/150/150/636378944641601219.jpeg",
				"raceId": 13,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 372,
				"name": null,
				"avatarId": 18001,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/1/150/150/636378959867257160.jpeg",
				"raceId": 18,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 373,
				"name": null,
				"avatarId": 18002,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/2/150/150/636378960438136837.jpeg",
				"raceId": 33,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 374,
				"name": null,
				"avatarId": 18010,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/10/150/150/636378969777703827.jpeg",
				"raceId": 22,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 375,
				"name": null,
				"avatarId": 18018,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/18/150/150/636378975214214687.jpeg",
				"raceId": 22,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 376,
				"name": null,
				"avatarId": 18019,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/19/150/150/636378975313015155.jpeg",
				"raceId": 22,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 377,
				"name": null,
				"avatarId": 18021,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/21/150/150/636378978367624758.jpeg",
				"raceId": 14,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 378,
				"name": null,
				"avatarId": 18023,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/23/150/150/636378982095199332.jpeg",
				"raceId": 28,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 379,
				"name": null,
				"avatarId": 18026,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/26/150/150/636378983856406265.jpeg",
				"raceId": 28,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 380,
				"name": null,
				"avatarId": 18027,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/27/150/150/636378992694935628.jpeg",
				"raceId": 35,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 381,
				"name": null,
				"avatarId": 18028,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/28/150/150/636378992802537396.jpeg",
				"raceId": 35,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 382,
				"name": null,
				"avatarId": 18029,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/29/150/150/636378992909330982.jpeg",
				"raceId": 35,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 383,
				"name": null,
				"avatarId": 18030,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/30/150/150/636378993401914969.jpeg",
				"raceId": 29,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 384,
				"name": null,
				"avatarId": 18031,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/31/150/150/636378995461728075.jpeg",
				"raceId": 29,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 385,
				"name": null,
				"avatarId": 18032,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/18/32/150/150/636378995571550994.jpeg",
				"raceId": 29,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 386,
				"name": null,
				"avatarId": 43518,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/43/518/150/150/636419457094681703.jpeg",
				"raceId": 41,
				"subRaceId": null,
				"classId": null,
				"tags": []
			},
			{
				"id": 388,
				"name": "Titobolg",
				"avatarId": 60904,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/60/904/150/150/636452239812291887.png",
				"raceId": 25,
				"subRaceId": null,
				"classId": null,
				"tags": []
			}
		],
		"frames": [],
		"backdrops": [
			{
				"id": 389,
				"name": "Barbarian",
				"backdropAvatarId": 61471,
				"smallBackdropAvatarId": 61472,
				"largeBackdropAvatarId": 61473,
				"thumbnailBackdropAvatarId": 61474,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/471/636453122222914252.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/472/636453122223383028.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/473/636453122224164304.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/474/150/150/636453122224476777.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 9,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 390,
				"name": "Bard",
				"backdropAvatarId": 61475,
				"smallBackdropAvatarId": 61476,
				"largeBackdropAvatarId": 61477,
				"thumbnailBackdropAvatarId": 61478,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/475/636453123635897181.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/476/636453123636366109.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/477/636453123637147253.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/478/150/150/636453123637459681.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 1,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 391,
				"name": "Cleric",
				"backdropAvatarId": 61484,
				"smallBackdropAvatarId": 61485,
				"largeBackdropAvatarId": 61486,
				"thumbnailBackdropAvatarId": 61487,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/484/636453131399186965.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/485/636453131399655733.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/486/636453131400280753.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/487/150/150/636453131400749482.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 2,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 392,
				"name": "Druid",
				"backdropAvatarId": 61510,
				"smallBackdropAvatarId": 61511,
				"largeBackdropAvatarId": 61512,
				"thumbnailBackdropAvatarId": 61513,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/510/636453152253102859.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/511/636453152253727927.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/512/636453152254352893.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/513/150/150/636453152254665392.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 3,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 393,
				"name": "Fighter",
				"backdropAvatarId": 61514,
				"smallBackdropAvatarId": 61515,
				"largeBackdropAvatarId": 61516,
				"thumbnailBackdropAvatarId": 61517,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/514/636453152540608423.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/515/636453152541077230.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/516/636453152541702237.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/517/150/150/636453152542014800.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 10,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 394,
				"name": "Monk",
				"backdropAvatarId": 61522,
				"smallBackdropAvatarId": 61523,
				"largeBackdropAvatarId": 61524,
				"thumbnailBackdropAvatarId": 61525,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/522/636453154644283609.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/523/636453154644752281.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/524/636453154645377290.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/525/150/150/636453154645689772.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 11,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 395,
				"name": "Paladin",
				"backdropAvatarId": 61527,
				"smallBackdropAvatarId": 61528,
				"largeBackdropAvatarId": 61529,
				"thumbnailBackdropAvatarId": 61530,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/527/636453155878618486.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/528/636453155879087248.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/529/636453155879712283.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/530/150/150/636453155880181287.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 4,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 396,
				"name": "Ranger",
				"backdropAvatarId": 61532,
				"smallBackdropAvatarId": 61533,
				"largeBackdropAvatarId": 61534,
				"thumbnailBackdropAvatarId": 61535,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/532/636453156970671727.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/533/636453156971140546.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/534/636453156971765566.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/535/150/150/636453156972234347.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 5,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 397,
				"name": "Rogue",
				"backdropAvatarId": 61544,
				"smallBackdropAvatarId": 61545,
				"largeBackdropAvatarId": 61546,
				"thumbnailBackdropAvatarId": 61547,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/544/636453167791328397.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/545/636453167792109644.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/546/636453167793515953.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/547/150/150/636453167794140909.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 12,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 398,
				"name": "Sorcerer",
				"backdropAvatarId": 61548,
				"smallBackdropAvatarId": 61549,
				"largeBackdropAvatarId": 61550,
				"thumbnailBackdropAvatarId": 61551,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/548/636453168590672370.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/549/636453168591609640.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/550/636453168592234629.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/551/150/150/636453168592547146.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 6,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 399,
				"name": "Warlock",
				"backdropAvatarId": 61552,
				"smallBackdropAvatarId": 61553,
				"largeBackdropAvatarId": 61554,
				"thumbnailBackdropAvatarId": 61555,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/552/636453168936963231.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/553/636453168937588266.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/554/636453168938213283.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/555/150/150/636453168938525788.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 7,
				"tags": [
					"Class Backdrops"
				]
			},
			{
				"id": 400,
				"name": "Wizard",
				"backdropAvatarId": 61556,
				"smallBackdropAvatarId": 61557,
				"largeBackdropAvatarId": 61558,
				"thumbnailBackdropAvatarId": 61559,
				"backdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/556/636453169376650613.jpeg",
				"smallBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/557/636453169376963233.jpeg",
				"largeBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/61/558/636453169377593443.jpeg",
				"thumbnailBackdropAvatarUrl": "https://media-waterdeep.cursecdn.com/avatars/thumbnails/61/559/150/150/636453169378067426.jpeg",
				"raceId": null,
				"subRaceId": null,
				"classId": 8,
				"tags": [
					"Class Backdrops"
				]
			}
		]
	},
	"configData": {
		"conditions": [
			{
				"id": 1,
				"name": "Blinded",
				"description": "<ul>\r\n<li>A blinded creature can't see and automatically fails any ability check that requires sight.</li>\r\n<li>Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.</li>\r\n</ul>",
				"slug": "blinded"
			},
			{
				"id": 2,
				"name": "Charmed",
				"description": "<ul>\r\n<li>A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.</li>\r\n<li>The charmer has advantage on any ability check to interact socially with the creature.</li>\r\n</ul>",
				"slug": "charmed"
			},
			{
				"id": 3,
				"name": "Deafened",
				"description": "<ul>\r\n<li>A deafened creature can't hear and automatically fails any ability check that requires hearing.</li>\r\n</ul>",
				"slug": "deafened"
			},
			{
				"id": 4,
				"name": "Exhaustion",
				"description": "<p>Some special abilities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion. Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion, as specified in the effect's description.</p>\r\n<table>\r\n<thead>\r\n<tr>\r\n<th class=\"exhaustionlevel\">Level</th>\r\n<th>Effect</th>\r\n</tr>\r\n</thead>\r\n<tbody>\r\n<tr>\r\n<td>1</td>\r\n<td style=\"text-align: left;\">Disadvantage on ability checks</td>\r\n</tr>\r\n<tr>\r\n<td>2</td>\r\n<td style=\"text-align: left;\">Speed halved</td>\r\n</tr>\r\n<tr>\r\n<td>3</td>\r\n<td style=\"text-align: left;\">Disadvantage on attack rolls and saving throws</td>\r\n</tr>\r\n<tr>\r\n<td>4</td>\r\n<td style=\"text-align: left;\">Hit point maximum halved</td>\r\n</tr>\r\n<tr>\r\n<td>5</td>\r\n<td style=\"text-align: left;\">Speed reduced to 0</td>\r\n</tr>\r\n<tr>\r\n<td>6</td>\r\n<td style=\"text-align: left;\">Death</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<p><br />If an already exhausted creature suffers another effect that causes exhaustion, its current level of exhaustion increases by the amount specified in the effect's description.</p>\r\n<p>A creature suffers the effect of its current level of exhaustion as well as all lower levels. For example, a creature suffering level 2 exhaustion has its speed halved and has disadvantage on ability checks.</p>\r\n<p>An effect that removes exhaustion reduces its level as specified in the effect's description, with all exhaustion effects ending if a creature's exhaustion level is reduced below 1. <br /> Finishing a long rest reduces a creature's exhaustion level by 1, provided that the creature has also ingested some food and drink.</p>",
				"slug": "exhaustion"
			},
			{
				"id": 5,
				"name": "Frightened",
				"description": "<ul>\r\n<li>A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.</li>\r\n<li>The creature can't willingly move closer to the source of its fear.</li>\r\n</ul>",
				"slug": "frightened"
			},
			{
				"id": 6,
				"name": "Grappled",
				"description": "<ul>\r\n<li>A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.</li>\r\n<li>The condition ends if the grappler is incapacitated (see the condition).</li>\r\n<li>The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect, such as when a creature is hurled away by the <strong>thunder-wave</strong> spell.</li>\r\n</ul>",
				"slug": "grappled"
			},
			{
				"id": 7,
				"name": "Incapacitated",
				"description": "<ul>\r\n<li>An incapacitated creature can't take actions or reactions.</li>\r\n</ul>",
				"slug": "incapacitated"
			},
			{
				"id": 8,
				"name": "Invisible",
				"description": "<ul>\r\n<li>An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves.</li>\r\n<li>Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.</li>\r\n</ul>",
				"slug": "invisible"
			},
			{
				"id": 9,
				"name": "Paralyzed",
				"description": "<ul>\r\n<li>A paralyzed creature is incapacitated (see the condition) and can't move or speak.</li>\r\n<li>The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.</li>\r\n<li>Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</li>\r\n</ul>",
				"slug": "paralyzed"
			},
			{
				"id": 10,
				"name": "Petrified",
				"description": "<ul>\r\n<li>A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.</li>\r\n<li>The creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings.</li>\r\n<li>Attack rolls against the creature have advantage.</li>\r\n<li>The creature automatically fails Strength and Dexterity saving throws.</li>\r\n<li>The creature has resistance to all damage.</li>\r\n<li>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.</li>\r\n</ul>",
				"slug": "petrified"
			},
			{
				"id": 11,
				"name": "Poisoned",
				"description": "<ul>\r\n<li>A poisoned creature has disadvantage on attack rolls and ability checks.</li>\r\n</ul>",
				"slug": "poisoned"
			},
			{
				"id": 12,
				"name": "Prone",
				"description": "<ul>\r\n<li>A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.</li>\r\n<li>The creature has disadvantage on attack rolls.</li>\r\n<li>An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.</li>\r\n</ul>",
				"slug": "prone"
			},
			{
				"id": 13,
				"name": "Restrained",
				"description": "<ul>\r\n<li>A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.</li>\r\n<li>Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.</li>\r\n<li>The creature has disadvantage on Dexterity saving throws.</li>\r\n</ul>",
				"slug": "restrained"
			},
			{
				"id": 14,
				"name": "Stunned",
				"description": "<ul>\r\n<li>A stunned creature is incapacitated (see the condition), can't move, and can speak only falteringly.</li>\r\n<li>The creature automatically fails Strength and Dexterity saving throws.</li>\r\n<li>Attack rolls against the creature have advantage.</li>\r\n</ul>",
				"slug": "stunned"
			},
			{
				"id": 15,
				"name": "Unconscious",
				"description": "<ul>\r\n<li>An unconscious creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings</li>\r\n<li>The creature drops whatever it's holding and falls prone.</li>\r\n<li>The creature automatically fails Strength and Dexterity saving throws.</li>\r\n<li>Attack rolls against the creature have advantage.</li>\r\n<li>Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</li>\r\n</ul>",
				"slug": "unconscious"
			}
		],
		"damageAdjustments": [
			{
				"id": 1,
				"name": "Bludgeoning",
				"type": 1,
				"slug": "bludgeoning"
			},
			{
				"id": 2,
				"name": "Piercing",
				"type": 1,
				"slug": "piercing"
			},
			{
				"id": 3,
				"name": "Slashing",
				"type": 1,
				"slug": "slashing"
			},
			{
				"id": 4,
				"name": "Lightning",
				"type": 1,
				"slug": "lightning"
			},
			{
				"id": 5,
				"name": "Thunder",
				"type": 1,
				"slug": "thunder"
			},
			{
				"id": 6,
				"name": "Poison",
				"type": 1,
				"slug": "poison"
			},
			{
				"id": 7,
				"name": "Cold",
				"type": 1,
				"slug": "cold"
			},
			{
				"id": 8,
				"name": "Radiant",
				"type": 1,
				"slug": "radiant"
			},
			{
				"id": 9,
				"name": "Fire",
				"type": 1,
				"slug": "fire"
			},
			{
				"id": 10,
				"name": "Necrotic",
				"type": 1,
				"slug": "necrotic"
			},
			{
				"id": 11,
				"name": "Acid",
				"type": 1,
				"slug": "acid"
			},
			{
				"id": 12,
				"name": "Psychic",
				"type": 1,
				"slug": "psychic"
			},
			{
				"id": 17,
				"name": "Bludgeoning",
				"type": 2,
				"slug": "bludgeoning"
			},
			{
				"id": 18,
				"name": "Piercing",
				"type": 2,
				"slug": "piercing"
			},
			{
				"id": 19,
				"name": "Slashing",
				"type": 2,
				"slug": "slashing"
			},
			{
				"id": 20,
				"name": "Lightning",
				"type": 2,
				"slug": "lightning"
			},
			{
				"id": 21,
				"name": "Thunder",
				"type": 2,
				"slug": "thunder"
			},
			{
				"id": 22,
				"name": "Poison",
				"type": 2,
				"slug": "poison"
			},
			{
				"id": 23,
				"name": "Cold",
				"type": 2,
				"slug": "cold"
			},
			{
				"id": 24,
				"name": "Radiant",
				"type": 2,
				"slug": "radiant"
			},
			{
				"id": 25,
				"name": "Fire",
				"type": 2,
				"slug": "fire"
			},
			{
				"id": 26,
				"name": "Necrotic",
				"type": 2,
				"slug": "necrotic"
			},
			{
				"id": 27,
				"name": "Acid",
				"type": 2,
				"slug": "acid"
			},
			{
				"id": 28,
				"name": "Psychic",
				"type": 2,
				"slug": "psychic"
			},
			{
				"id": 33,
				"name": "Bludgeoning",
				"type": 3,
				"slug": "bludgeoning"
			},
			{
				"id": 34,
				"name": "Piercing",
				"type": 3,
				"slug": "piercing"
			},
			{
				"id": 35,
				"name": "Slashing",
				"type": 3,
				"slug": "slashing"
			},
			{
				"id": 36,
				"name": "Lightning",
				"type": 3,
				"slug": "lightning"
			},
			{
				"id": 37,
				"name": "Thunder",
				"type": 3,
				"slug": "thunder"
			},
			{
				"id": 38,
				"name": "Poison",
				"type": 3,
				"slug": "poison"
			},
			{
				"id": 39,
				"name": "Cold",
				"type": 3,
				"slug": "cold"
			},
			{
				"id": 40,
				"name": "Radiant",
				"type": 3,
				"slug": "radiant"
			},
			{
				"id": 41,
				"name": "Fire",
				"type": 3,
				"slug": "fire"
			},
			{
				"id": 42,
				"name": "Necrotic",
				"type": 3,
				"slug": "necrotic"
			},
			{
				"id": 43,
				"name": "Acid",
				"type": 3,
				"slug": "acid"
			},
			{
				"id": 44,
				"name": "Psychic",
				"type": 3,
				"slug": "psychic"
			},
			{
				"id": 47,
				"name": "Force",
				"type": 1,
				"slug": "force"
			},
			{
				"id": 48,
				"name": "Force",
				"type": 2,
				"slug": "force"
			},
			{
				"id": 49,
				"name": "Force",
				"type": 3,
				"slug": "force"
			},
			{
				"id": 51,
				"name": "Ranged Attacks",
				"type": 1,
				"slug": "ranged-attacks"
			},
			{
				"id": 52,
				"name": "Damage Dealt By Traps",
				"type": 1,
				"slug": "damage-dealt-by-traps"
			},
			{
				"id": 54,
				"name": "Bludgeoning from non magical attacks",
				"type": 1,
				"slug": "bludgeoning-from-non-magical-attacks"
			}
		],
		"classConfigurations": [
			{
				"id": 1,
				"name": "Bard",
				"spellRules": {
					"multiClassSpellSlotDivisor": 1,
					"levelCantripsKnownMaxes": [
						0,
						2,
						2,
						2,
						3,
						3,
						3,
						3,
						3,
						3,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4
					],
					"levelSpellKnownMaxes": [
						0,
						4,
						5,
						6,
						7,
						8,
						9,
						10,
						11,
						12,
						14,
						15,
						15,
						16,
						18,
						19,
						19,
						20,
						22,
						22,
						22
					],
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							2,
							1,
							1
						]
					]
				}
			},
			{
				"id": 2,
				"name": "Cleric",
				"spellRules": {
					"multiClassSpellSlotDivisor": 1,
					"levelCantripsKnownMaxes": [
						0,
						3,
						3,
						3,
						4,
						4,
						4,
						4,
						4,
						4,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5
					],
					"levelSpellKnownMaxes": null,
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							2,
							1,
							1
						]
					]
				}
			},
			{
				"id": 3,
				"name": "Druid",
				"spellRules": {
					"multiClassSpellSlotDivisor": 1,
					"levelCantripsKnownMaxes": [
						0,
						2,
						2,
						2,
						3,
						3,
						3,
						3,
						3,
						3,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4
					],
					"levelSpellKnownMaxes": null,
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							2,
							1,
							1
						]
					]
				}
			},
			{
				"id": 4,
				"name": "Paladin",
				"spellRules": {
					"multiClassSpellSlotDivisor": 2,
					"levelCantripsKnownMaxes": [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0
					],
					"levelSpellKnownMaxes": null,
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						]
					]
				}
			},
			{
				"id": 5,
				"name": "Ranger",
				"spellRules": {
					"multiClassSpellSlotDivisor": 2,
					"levelCantripsKnownMaxes": [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0
					],
					"levelSpellKnownMaxes": [
						0,
						0,
						2,
						3,
						3,
						4,
						4,
						5,
						5,
						6,
						6,
						7,
						7,
						8,
						8,
						9,
						9,
						10,
						10,
						11,
						11
					],
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						]
					]
				}
			},
			{
				"id": 6,
				"name": "Sorcerer",
				"spellRules": {
					"multiClassSpellSlotDivisor": 1,
					"levelCantripsKnownMaxes": [
						0,
						4,
						4,
						4,
						5,
						5,
						5,
						5,
						5,
						5,
						6,
						6,
						6,
						6,
						6,
						6,
						6,
						6,
						6,
						6,
						6
					],
					"levelSpellKnownMaxes": [
						0,
						2,
						3,
						4,
						5,
						6,
						7,
						8,
						9,
						10,
						11,
						12,
						12,
						13,
						13,
						14,
						14,
						15,
						15,
						15,
						15
					],
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							2,
							1,
							1
						]
					]
				}
			},
			{
				"id": 7,
				"name": "Warlock",
				"spellRules": {
					"multiClassSpellSlotDivisor": 1,
					"levelCantripsKnownMaxes": [
						0,
						2,
						2,
						2,
						3,
						3,
						3,
						3,
						3,
						3,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4
					],
					"levelSpellKnownMaxes": [
						0,
						2,
						3,
						4,
						5,
						6,
						7,
						8,
						9,
						10,
						10,
						11,
						11,
						12,
						12,
						13,
						13,
						14,
						14,
						15,
						15
					],
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							1,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							2,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							2,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							4,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							4,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							4,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							4,
							0,
							0,
							0,
							0
						]
					]
				}
			},
			{
				"id": 8,
				"name": "Wizard",
				"spellRules": {
					"multiClassSpellSlotDivisor": 1,
					"levelCantripsKnownMaxes": [
						0,
						3,
						3,
						3,
						4,
						4,
						4,
						4,
						4,
						4,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5,
						5
					],
					"levelSpellKnownMaxes": null,
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							2,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							1,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							0,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							0
						],
						[
							4,
							3,
							3,
							3,
							2,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							1,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							1,
							1,
							1
						],
						[
							4,
							3,
							3,
							3,
							3,
							2,
							2,
							1,
							1
						]
					]
				}
			},
			{
				"id": 9,
				"name": "Barbarian",
				"spellRules": null
			},
			{
				"id": 10,
				"name": "Fighter",
				"spellRules": {
					"multiClassSpellSlotDivisor": 3,
					"levelCantripsKnownMaxes": [
						0,
						0,
						0,
						2,
						2,
						2,
						2,
						2,
						2,
						2,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						3
					],
					"levelSpellKnownMaxes": [
						0,
						0,
						0,
						3,
						4,
						4,
						4,
						5,
						6,
						6,
						7,
						8,
						8,
						9,
						10,
						10,
						11,
						11,
						11,
						12,
						13
					],
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						]
					]
				}
			},
			{
				"id": 11,
				"name": "Monk",
				"spellRules": null
			},
			{
				"id": 12,
				"name": "Rogue",
				"spellRules": {
					"multiClassSpellSlotDivisor": 3,
					"levelCantripsKnownMaxes": [
						0,
						0,
						0,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4,
						4
					],
					"levelSpellKnownMaxes": [
						0,
						0,
						0,
						3,
						4,
						4,
						4,
						5,
						6,
						6,
						7,
						8,
						8,
						9,
						10,
						10,
						11,
						11,
						11,
						12,
						13
					],
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						],
						[
							4,
							3,
							3,
							1,
							0,
							0,
							0,
							0,
							0
						]
					]
				}
			},
			{
				"id": 117,
				"name": "Blood Hunter",
				"spellRules": {
					"multiClassSpellSlotDivisor": 3,
					"levelCantripsKnownMaxes": [
						0,
						0,
						0,
						2,
						2,
						2,
						2,
						2,
						2,
						2,
						2,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						3,
						3
					],
					"levelSpellKnownMaxes": [
						0,
						0,
						0,
						2,
						2,
						3,
						3,
						4,
						4,
						5,
						5,
						6,
						6,
						7,
						7,
						8,
						8,
						9,
						9,
						10,
						11
					],
					"levelSpellSlots": [
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							1,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							1,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							2,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							3,
							0,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0,
							0
						],
						[
							0,
							0,
							0,
							3,
							0,
							0,
							0,
							0,
							0
						]
					]
				}
			}
		],
		"sourceCategories": [
			{
				"id": 1,
				"name": "Core D&D",
				"description": null,
				"isHideable": false,
				"isEnabledByDefault": true,
				"isToggleable": false,
				"avatarUrl": ""
			},
			{
				"id": 2,
				"name": "Critical Role",
				"description": "<p>The material here can be seen on Critical Role. These game mechanics aren&rsquo;t officially part of the game and aren&rsquo;t permitted in D&amp;D Adventurers League events.</p>",
				"isHideable": true,
				"isEnabledByDefault": false,
				"isToggleable": true,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/105/174/636512853628516966.png"
			},
			{
				"id": 3,
				"name": "Playtest",
				"description": "<p><span style=\"color: #ff0000;\"><strong>THIS IS UNOFFICIAL MATERIAL</strong></span></p>\r\n<p>The material here is presented for playtesting and to spark your imagination. These game mechanics are in draft form, usable in your campaign but not refined by final game design and editing. They aren&rsquo;t officially part of the game and aren&rsquo;t permitted in D&amp;D Adventurers League events.</p>\r\n<p>If this material is made official, it will be refined based on your feedback, and then it will appear in a D&amp;D product that you can unlock on DDB.</p>\r\n<p>If this material is not made official, it will be removed from DDB following the playtest period and you will need to replace it with another option.</p>",
				"isHideable": true,
				"isEnabledByDefault": false,
				"isToggleable": true,
				"avatarUrl": "https://media-waterdeep.cursecdn.com/avatars/110/171/636516074887091041.png"
			}
		]
	}
};
import Character from './Character';

import chai from 'chai';
import spellStore from './spellStore';
import SpellcastingList from './Spellcasting';
import characterStore from './characterStore';

const should = chai.should();

var char = {
      "name": "",
      "player": "Katie",
      "classes": [
        {
          "knownSpells": {
            "notes": {},
            "spells": [
              "Alarm",
              "Detect Magic",
              "Hunter's Mark"
            ]
          },
          "label": "Ranger",
          "level": 3,
          "name": "Ranger (Revised)",
          "subclasses": {
            "Favored Enemy": "Humanoids",
            "Fighting Style": "Archery",
            "Ranger Conclave": "Beast Master",
            "Animal Companion": "Thestral"
          }
        }
      ],
      "abilities": {
        "Charisma": {
          "base": 10
        },
        "Constitution": {
          "base": 8
        },
        "Dexterity": {
          "base": 12
        },
        "Intelligence": {
          "base": 16
        },
        "Strength": {
          "base": 8
        },
        "Wisdom": {
          "base": 17
        }
      },
      "advantages": [],
      "background": {
        "alignment": "Chaotic Neutral",
        "bond": "I suffer awful visions of a coming disaster and will do anything to prevent it.",
        "flaw": "I remember every insult I’ve received and nurse a silent resentment toward anyone who’s ever wronged me.",
        "ideal": "The natural world is more important than all the constructs of civilization.",
        "name": "Outlander",
        "personality": "I have a lesson for every situation, drawn from observing nature. I once ran twenty-five miles without stopping to warn to my clan of an approaching horde. I’d do it again if I had to.",
        "specialty": "",
        "startingCoin": "100g"
      },
      "body": {
        "eyes": "",
        "hair": "",
        "height": "",
        "skin": "",
        "weight": ""
      },
      "equipment": {
        "armor": "Leather Armor",
        "containers": [
          {
            "content": [
              "A troll's necklace worn as a belt"
            ]
          },
          {
            "content": [
              "bedroll, mess kit, tinderbox, 10 torches, rations (10 days), water skin, hempen rope (50 feet), 1 essence of dittany"
            ],
            "name": "Backpack",
            "notes": [
              "Explorer's"
            ]
          }
        ],
        "items": [
          "shortsword",
          "longbow",
          "potion of healing"
        ],
        "weapons": "2 Shortswords, Longbow"
      },
      "features": [],
      "proficiencies": {
        "armor": {
          "list": [],
          "notes": []
        },
        "languages": {
          "list": [
            "Common",
            "Gnoll"
          ],
          "notes": []
        },
        "skills": {
          "list": [
            "Investigation",
            "Stealth",
            "Insight"
          ],
          "notes": []
        },
        "tools": {
          "list": [
            ""
          ],
          "notes": []
        },
        "weapons": {
          "list": [],
          "notes": []
        }
      },
      "race": {
        "name": "Half-Orc"
      }
    }
var char2 = {
      "name": "Charbrava",
      "player": "Joan",
      "race": {
        "name": "Half-Elf"
      },
      "classes": [
        {
          "name": "Sorcerer",
          "level": 2,
          "subclasses": {
            "Dragon Ancestor": "Gold",
            "Sorcerous Origin": "Draconic Bloodline"
          },
          "knownSpells": {
            "spells": [
              "Fire Bolt",
              "Minor Illusion",
              "Mage Hand",
              "Blade Ward",
              "Sleep",
              "Chromatic Orb",
              "Disguise Self"
            ]
          }
        }
      ],
      "abilities": {
        "Strength": {
          "base": 9,
          "adjust": [
            {
              "value": 1,
              "level": 1
            }
          ]
        },
        "Dexterity": {
          "base": 11
        },
        "Constitution": {
          "base": 15,
          "adjust": [
            {
              "value": 1,
              "level": 1
            }
          ]
        },
        "Intelligence": {
          "base": 13
        },
        "Wisdom": {
          "base": 13
        },
        "Charisma": {
          "base": 15
        }
      },
      "background": {
        "name": "Folk Hero",
        "specialty": "I broke into a tyrant's castle and stole weapons to arm the people",
        "startingCoin": "59g 7s",
        "personality": "If someone is in trouble, I'm always ready to lend help. I have a strong sense of fair play and always try to find the most equitable solution to arguments",
        "ideal": "People deserve to be treated with dignity and respect",
        "bond": "My sister is the most important person to me and I will do anything to protect her. I am loyal to the people of my village.",
        "flaw": "I'm convinced of the significance of my destiny, and blind to my shortcomings and the risk of failure."
      },
      "proficiencies": {
        "skills": {
          "list": [
            "Acrobatics",
            "Animal Handling",
            "Survival",
            "Deception",
            "Insight",
            "Persuasion"
          ],
          "notes": [
            "Acrobatics, Deception from Half-Elf",
            "Insight, Persuasion from Sorcerer",
            "Animal Handling, Survival from Folk Hero"
          ]
        }
      },
      "equipment": {
        "weapons": "Light crossbow and bolts, 2 daggers",
        "containers": [
          {
            "name": "Backpack",
            "content": [
              "crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days of rations, waterskin, 50 ft of rope",
              "shovel, iron pot, set of common clothes, portable alchemist's kit, 1 silver goblet"
            ],
            "notes": [
              "Dungeoneer's",
              "Folk Hero"
            ]
          },
          {
            "name": "Component Pouch",
            "content": [
              "a pouch of fine sand",
              "a bit of fleece"
            ]
          }
        ],
        "items": [
          "light crossbow",
          "dagger"
        ]
      },
      "body": {
        "age": 30,
        "height": "5'5\"",
        "skin": "Light",
        "weight": "132 lb."
      }
    }
describe('Character',()=>{

	it('should load',()=>{
		var v = new Character(char);
		var v2 = new Character(char2);
		should.exist(v);
		should.exist(v2);

	})

	describe('spellStore', ()=>{

		it('should add',()=>{
			spellStore.addAll({'hi':{}});
			spellStore.getAll();
			spellStore.get('hi');
			spellStore.exists('');
			spellStore.getNames();
			spellStore.getClassSpells('Ranger',1);
		});

	});

	describe('Spellcasting', ()=>{
		var s = new SpellcastingList();
		s.add('hi':{
			name: 'hi'
		},
		"Cleric", 8, 1, [2,3,5])
		s.getCasterLevels();
		s.getSlots();

		var Spellcasting = s.list[0].spellcasting;
		Spellcasting.knowSpell('');
		Spellcasting.learnSpells({
			spells: ['test']
		});
		Spellcasting.printAbility()
		Spellcasting.spellsByLevel()
	})

	describe('characterStore', ()=>{
		characterStore.addAll([char, char2]);
		characterStore.getAll();
		characterStore.getRaw();
		characterStore.update(0, char)
	})

});
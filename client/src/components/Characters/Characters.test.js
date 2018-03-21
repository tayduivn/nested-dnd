import React from 'react';
import chai from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';

import Characters from "./Characters";
import Character from "../../stores/Character";

spy(Characters.prototype, 'selectDeselect');

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


var c = new Character(char);

describe('<Characters />', ()=>{

	it('should mount',()=>{
		var wrapper = mount(<Characters />)
		wrapper.setState({characters: [c]})
		wrapper.update();
		wrapper.find('ul.characterList.list-group > SidebarItem > ul.list-group').simulate('click');
		
	});

})
function createMirrorPlane(instance, Instance, Thing, name){
	var thing = Thing.get(name);

	instance.children.forEach(function(child){
		if(typeof child !== "number") return;
		child = Instance.get(child);
		child.background = thing.background;
		child.textColor = thing.textColor;
		if(child.cssClass.indexOf(thing.background) === -1)
			child.cssClass+=" "+thing.background;
		if(child.data.mirrors !== undefined && Instance.get(child.data.mirrors).thing.contains){
			child.thing = styleAThing(child.thing,name,Thing);
		}
	});
}

function styleAThing(thing, styleName, Thing){
	var prefix = styleName.split(" ")[0]+" ";
	if(thing.isa && thing.isa.startsWith(styleName)){
		return thing;
	}

	var originalThing = thing.name;
	if(!originalThing) originalThing = "";
	if(Thing.exists(prefix+originalThing)){
		return Thing.get(prefix+originalThing);
	}

	thing = Thing.add({
		"name": prefix+originalThing,
		"isa": originalThing
	});
	thing.isa = styleName;

  return thing;
}

module.exports = {
  "name": "dnd",
  "version": "0.0.0",
  "description": "",
  "author": "Cattegy",
  "dependencies": [],
  "defaultSeed": "Great Wheel",
  "things": {
    "cosmology": {
      "background": "wheat",
      "namegen": "Dungeons & Dragons Universe"
    },
    "material plane": {
      "contains": [
        "crystal sphere,1-5"
      ],
      "icon": "fa flaticon-nature-4",
      "background": "black",
      "textColor": "white"
    },
    "air plane": {
      "contains": [
        "citadel,0-3",
        "gaseous bubble,3-7",
        "floating liquid sphere,3-7",
        "asteroid,0-2"
      ],
      "icon": "gi gi-fluffy-cloud",
      "background": "aliceBlue"
    },
    "mirror plane":{
    	"contains": ["fake"],
    	beforeRender:function(instance, Instance, Thing){
    		if(typeof instance.data.mirrors === "undefined") return;

    		if(typeof instance.data.mirrors === "string"){
    			var index = Thing.get(instance.data.mirrors).uniqueInstance;
    			if(typeof index==='number'){
    				instance.data.mirrors = index;
    			}else return;
    		}

    		var mirrorInstance = Instance.get(instance.data.mirrors);
    		if(!mirrorInstance.grown) 
    			mirrorInstance.grow();

    		if(instance.data.mirrorChildrenCopy === JSON.stringify(mirrorInstance.children)){
    			return;
    		}

    		//TODO: copy contents of children and transform
    		instance.children = [];
    		mirrorInstance.children.forEach(function(mirrorChild){
    			if(typeof mirrorChild==="number"){
    				mirrorChild = Instance.get(mirrorChild);

    				//create a new mirror plane thing
    				var mirrorThing = mirrorChild.thing;
    				var childThing = styleAThing(mirrorChild.thing,"mirror plane",Thing);

    				//create new child and copy mirror
	    			var child = new Instance(childThing);
	    			var newId = child.id;
	    			Object.assign(child,mirrorChild);
	    			child.id = newId;
	    			child.parent = instance.id;
	    			child.thing = childThing;
	    			child.data.mirrors = mirrorChild.id;

	    			instance.children.push(child.id);
    			}
    			if(typeof mirrorChild==="string"){
    				instance.children.push(mirrorChild);
    			}
    		});

    		instance.data.mirrorChildrenCopy = JSON.stringify(mirrorInstance.children);
    	}
    },
    "earth plane": {
      "contains": [
        "mountain,1-6",
        "wizard tower,0-3",
        "mine,0-3",
        "city,2-5",
        "town,2-5"
      ],
      "icon": "gi gi-rock",
      "background": "sienna"
    },
    "fire plane": {
      "contains": [
        "tower,1-10",
        "city,1-2",
        "volcano,1-3",
        "castle,1-2",
        "palace,2-3"
      ],
      "icon": "gi gi-flamed-leaf gi-rotate-45",
      "background": "darkRed"
    },
    "water plane": {
      "contains": [
        "ocean",
        "tower,1-10",
        "city,1-2",
        "castle,1-2",
        "palace,2-3"
      ],
      "icon": "gi gi-at-sea",
      "background": "darkblue"
    },
    "Astral Plane": {
      "contains": [
        "silver astral pool",
        ".astral color pool,3-10"
      ],
      "background": "rainbow",
      "icon": "gi gi-circle-claws"
    },
    "celestial plane": {
      "contains": [
        "citadel,1-3",
        "palace,1-3",
        "temple,1-5"
      ],
      "icon": "fa flaticon-religion-cross",
      "background": "gold"
    },
    "fiendish plane": {
      "contains": [
        "hostile citadel,1-3",
        "hostile palace,1-3",
        "hostile temple,1-5"
      ],
      "background": "darkred",
      "icon": "gi gi-daemon-skull"
    },
    "undead mirror plane": { 
    	"isa":"mirror plane",
    	beforeRender:function(instance, Instance, Thing){
    		createMirrorPlane(instance, Instance, Thing, "undead mirror plane");
    	},
    	"background":"gray",
    	"textColor":null
    },
    "abyssal plane": {
      "contains": [
        "hostile citadel,1-3",
        "hostile palace,1-3",
        "hostile temple,1-5"
      ],
      "icon": "fa flaticon-black-hole fa-spin",
      "background": "black"
    },
    "fey plane": [
      "citadel,1-3",
      "palace,1-3",
      "temple,1-5"
    ],
    "fey mirror plane":{
    	"isa":"mirror plane",
    	beforeRender:function(instance, Instance, Thing){
    		createMirrorPlane(instance, Instance, Thing, "fey mirror plane");
    	},
    	"background":"lavenderblush",
    	"textColor":"purple"
    },
    "astral color pool": [
      "*COLORS*| astral pool"
    ],
    "silver astral pool": {
      "namegen": "silver astral pool (portal to material plane)"
    },
    "crystal sphere": {
      "contains": [
        "star",
        "star,3%",
        "planet,2-5"
      ],
      "namegen": "*PLANET PREFIX*|*PLANET SUFFIX*|space",
      "background": "black",
      "textColor": "mediumpurple",
      "icon": "gi gi-crystal-shine pulse animated infinite"
    },
    "star": {
      "icon": "fa flaticon-sun fa-spin",
      "background": "black",
      "textColor": "gold"
    },
    "planet": {
      "contains": [
        "continent,1-5",
        "underdark,90%"
      ],
      "icon": [
        "fa fa-globe fa-spin",
        "gi gi-earth-asia-oceania gi-spin",
        "gi gi-earth-africa-europe gi-spin",
        "gi gi-earth-america gi-spin"
      ],
      "background": "black",
      "textColor": "DodgerBlue"
    },
    "gaseous bubble": {
      "namegen": "*COLORS*| gaseous bubble"
    },
    "Great Wheel": {
      "contains": [
        "Prime Material Plane",
        "Mirror Planes",
        "Transitive Planes",
        "Inner Planes",
        "Outer Planes"
      ],
      "isa": "cosmology"
    },
    "World Axis": {
      "contains": [
        "Prime Material Plane",
        "Shadowfell",
        "Feywild",
        "Astral Sea",
        "Elemental Chaos"
      ],
      "isa": "cosmology"
    },
    "World Tree": {
      "contains": [
        "Prime Material Plane",
        "Inner Planes",
        "Coterminous Planes",
        "Outer Planes (Tree)",
        "Cynosure",
        "Fugue Plane"
      ],
      "isa": "cosmology"
    },
    "Inner Planes": {
      "contains": [
        "Elemental Plane of Air",
        "Elemental Plane of Earth",
        "Elemental Plane of Fire",
        "Elemental Plane of Water",
        "Positive Energy Plane",
        "Negative Energy Plane"
      ],
      "icon": "gi gi-at-sea",
      "background": "wheat"
    },
    "Outer Planes": {
      "contains": [
        "The Abyss",
        "Acheron",
        "Arcadia",
        "Concordant Opposition/Outlands",
        "Elysium",
        "Gehenna",
        "Gladsheim/Ysgard",
        "Hades/The Gray Waste",
        "Happy Hunting Grounds/Beastlands",
        "Limbo",
        "The Nine Hells",
        "Nirvana/Mechanus",
        "Arvandor",
        "Pandemonium",
        "Seven Heavens/Mount Celestia",
        "Tarterus/Carceri",
        "Twin Paradises/Bytopia"
      ],
      "icon": "gi gi-cartwheel",
      "background": "wheat"
    },
    "Outer Planes (Tree)": {
      "contains": [
        "Celestial Planes",
        "Fiendish Planes",
        "Neutral Planes"
      ],
      "namegen": "Outer Planes",
      "icon": "gi gi-tree-branch",
      "background": "wheat"
    },
    "Astral Sea": [
      "Acheron",
      "Arcadia",
      "Concordant Opposition/Outlands",
      "Elysium",
      "Gehenna",
      "Gladsheim/Ysgard",
      "Hades/The Gray Waste",
      "Happy Hunting Grounds/Beastlands",
      "The Nine Hells",
      "Nirvana/Mechanus",
      "Arvandor",
      "Pandemonium",
      "Seven Heavens/Mount Celestia",
      "Tarterus/Carceri",
      "Twin Paradises/Bytopia"
    ],
    "Coterminous Planes": [
      "Ethereal Plane",
      "Astral Plane",
      "Plane of Shadow"
    ],
    "Elemental Chaos": [
      ".Inner Planes",
      "Limbo",
      "The Abyss"
    ],
    "Mirror Planes": {
      "contains": [
        "Shadowfell",
        "Feywild"
      ],
      "icon": "fa flaticon-nature-4 fa-rotate-90",
      "background": "white",
      "textColor": "black"
    },
    "Transitive Planes": {
      "contains": [
        "Ethereal Plane",
        "Astral Plane"
      ],
      "background": "wheat",
      "icon": "gi gi-dust-cloud"
    },
    "Celestial Planes": {
      "contains": [
        "Arvandor",
        "Brightwater",
        "Dwarfhome",
        "Dweomerheart",
        "The Gates of the Moon",
        "Golden Hills",
        "Green Fields",
        "The House of Knowledge",
        "The House of the Triad"
      ],
      "background": "gold",
      "icon": "gi gi-hand-of-god"
    },
    "Fiendish Planes": [
      "River of Blood",
      "The Abyss",
      "The Barrens of Doom and Despair",
      "Blood Rift",
      "Clangor",
      "Deep Caverns",
      "The Demonweb Pits",
      "Fated Depths",
      "Fury's Heart",
      "Hammergrim",
      "The Nine Hells",
      "Nishrek",
      "The Supreme Throne"
    ],
    "Neutral Planes": [
      "Dragon Eyrie",
      "Heliopolis",
      "House of Nature",
      "Jotunheim",
      "Warrior's Rest"
    ],
    "ethereal plane": {
      "icon": "gi gi-cloud-ring gi-spin",
      "background":"whitesmoke"
    },
    "Ethereal Plane": {
      "isa": "ethereal plane",
      "contains": [
        "Border Ethereal",
        "Deep Ethereal",
        "Ravenloft"
      ]
    },
    "Border Ethereal": {
      "isa": "ethereal plane",
      "contains": [
        {
          "namegen": "Prime Material Plane",
          "isa":"ethereal mirror plane",
          "data": {
            "mirrors": "Prime Material Plane"
          },
          "icon": "fa flaticon-nature-4 fa-rotate-90",
        },
        {
        	"namegen": "Inner Planes",
        	"isa":"ethereal mirror plane",
          "data": {
            "mirrors": "Inner Planes"
          },
          "icon": "gi gi-at-sea"
        }
      ]
    },
    "ethereal mirror plane":{
    	"isa":"mirror plane",
    	beforeRender:function(i, I, T){
    		createMirrorPlane(i,I,T,"ethereal mirror plane");
    	},
    	"background":"whitesmoke",
    	"textColor":null
    },
    "The Abyss": {
      "isa": "abyssal plane"
    },
    "Limbo": {
      "contains": [
        "*RANDOM*"
      ],
      "icon": "gi gi-time-trap",
      "background": "gray"
    },
    "Prime Material Plane": {
      "isa": "material plane",
      "contains": [
        "crystal sphere,1-5"
      ]
    },
    "Elemental Plane of Air": {
      "isa": "air plane",
      "contains": [
        "Borealis",
        "Citadel of Ice and Steel",
        "Taifun: Palace of Tempests",
        "Elemental Foundation of Air",
        "."
      ]
    },
    "Elemental Plane of Water": {
      "isa": "water plane",
      "contains": [
        "Elemental Foundation of Water"
      ]
    },
    "Elemental Plane of Earth": {
      "isa": "earth plane",
      "contains": [
        "The Great Dismal Delve",
        "The Sevenfold Mazework",
        "The Pale River",
        "The Iron Crucible",
        "The Aviary",
        "Elemental Foundation of Earth"
      ]
    },
    "Elemental Plane of Fire": {
      "isa": "fire plane",
      "contains": [
        "City of Brass",
        "Elemental Foundation of Fire"
      ]
    },
    "Positive Energy Plane": {
      "icon": "fa fa-plus",
      "background": "lightgreen"
    },
    "Negative Energy Plane": {
      "icon": "fa fa-minus",
      "background": "gray"
    },
    "Arvandor": {
      "isa": "celestial plane",
      "namegen": "Arvandor (also known as Arborea or Olympus)"
    },
    "Shadowfell": {
      "isa": "undead mirror plane",
      "data": {
        "mirrors": "Prime Material Plane"
      },
      "icon": "fa flaticon-nature-4 fa-rotate-90",
    },
    "Plane of Shadow": {
      "isa": "Shadowfell"
    },
    "Feywild": {
      "isa": "fey mirror plane",
      "data": {
        "mirrors": "Prime Material Plane"
      },
      "icon": "fa flaticon-nature-4 fa-rotate-90"
    },
    "Ravenloft": {
      "contains": [
        "Barovia",
        ".demiplane"
      ],
      "namegen": "Demiplane of Dread (Ravenloft)"
    },
    "Seven Heavens/Mount Celestia": {
      "isa": "celestial plane"
    },
    "Brightwater": {
      "isa": "celestial plane"
    },
    "Dwarfhome": {
      "isa": "celestial plane"
    },
    "Dweomerheart": {
      "isa": "celestial plane"
    },
    "Gladsheim/Ysgard": {
      "isa": "celestial plane"
    },
    "The Gates of the Moon": {
      "isa": "celestial plane"
    },
    "Golden Hills": {
      "isa": "celestial plane"
    },
    "Green Fields": {
      "isa": "celestial plane"
    },
    "The House of Knowledge": {
      "isa": "celestial plane"
    },
    "The House of the Triad": {
      "isa": "celestial plane"
    },
    "Arcadia": {
      "isa": "celestial plane"
    },
    "Twin Paradises/Bytopia": {
      "isa": "celestial plane"
    },
    "Elysium": {
      "isa": "celestial plane"
    },
    "Happy Hunting Grounds/Beastlands": {
      "isa": "celestial plane"
    },
    "River of Blood": {
      "isa": "fiendish plane"
    },
    "The Barrens of Doom and Despair": {
      "isa": "fiendish plane"
    },
    "Blood Rift": {
      "isa": "fiendish plane"
    },
    "Deep Caverns": {
      "isa": "fiendish plane"
    },
    "Clangor": {
      "isa": "fiendish plane"
    },
    "The Demonweb Pits": {
      "isa": "fiendish plane"
    },
    "Fated Depths": {
      "isa": "fiendish plane"
    },
    "Fury's Heart": {
      "isa": "fiendish plane"
    },
    "Hammergrim": {
      "isa": "fiendish plane"
    },
    "The Nine Hells": {
      "isa": "fiendish plane"
    },
    "Nishrek": {
      "isa": "fiendish plane"
    },
    "The Supreme Throne": {
      "isa": "fiendish plane"
    },
    "Acheron": {
      "isa": "fiendish plane"
    },
    "Concordant Opposition/Outlands": {
      "isa": "fiendish plane"
    },
    "Gehenna": {
      "isa": "fiendish plane"
    },
    "Hades/The Gray Waste": {
      "isa": "fiendish plane",
      "background": "gray"
    },
    "Nirvana/Mechanus": {
      "isa": "fiendish plane"
    },
    "Pandemonium": {
      "isa": "fiendish plane"
    },
    "Tarterus/Carceri": {
      "isa": "fiendish plane"
    },
    "The Iron Crucible": {
      "namegen": "The Iron Crucible: portal to |*ELEMENTS*| plane"
    },
    "The Pale River": {
      "namegen": "The Pale River: portal to |*ELEMENTS*| plane"
    },
    "The Great Dismal Delve": [
      "The Sevenfold Mazework",
      ".continent"
    ],
    "The Aviary": [
      ".cavern"
    ]
  },
  "tables": {
    "ELEMENTS": [
      "air",
      "earth",
      "fire",
      "water"
    ],
    "COLORS": [
      "silver",
      "silver",
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "black"
    ],
    "PLANET PREFIX": [
      "Kry",
      "Tor",
      "Ath",
      "Eb",
      "Aeb",
      "Myst",
      "Col",
      "And",
      "Kar",
      "Chan",
      "Gly",
      "Kul",
      "Raen",
      "Ed",
      "Gni",
      "Con",
      "Gin",
      "Bor",
      "Ter",
      "Plu",
      "Jup",
      "Merc",
      "Ven",
      "Tar",
      "Tur"
    ],
    "PLANET SUFFIX": [
      "ril",
      "nei",
      "pri",
      "ill",
      "atha",
      "sel",
      "ka",
      "en",
      "ra",
      "la",
      "myth",
      "lyn",
      "ion",
      "ynn",
      "to",
      "iter",
      "us",
      "ury",
      "lea",
      "nov",
      "omia",
      "tera",
      "ilia"
    ]
  }
};
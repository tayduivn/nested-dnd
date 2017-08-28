var pack = {
  "author": "Cattegy",
  "defaultSeed": "Great Wheel > Prime Material Plane > crystal sphere > planet > continent > region > village > tavern",
  "dependencies": ["nested-dnd-data"],
  "description": "",
  "name": "dnd",
  "tables": {
    "COLORS": ["silver", "silver", "red", "orange", "yellow", "green", "blue", "black"],
    "DINNER": {
      "concatenate": true,
      "rows": [
        ["Stewed", "Roasted", "Fried", "Boiled", "Baked", "Grilled", "Seared", "Steamed", "Salted", "Pickled"],
        " ",
        ["Rabbit", "Chicken", "Duck", "Mutton", "Pork", "Beef", "Pheasant", "Goose", "Trout", "Clams", "Pork sausage", "Duck sausage"],
        " with ",
        ["Dumplings", "Red cabbage", "White cabbage", "Shredded cabbage", "Leeks", "Lentils", "Broccoli", "Peas", "Cauliflower", "Kidney beans", "String beans", "White beans", "Turnip mash", "Sliced turnips", "Asparagus", "Sprouts", "Sweet peppers", "Red potatoes", "Golden potatoes", "Yams", ""],
        " and ",
        ["Carrots", "Apples", "Cherries", "Tomatoes", "Blueberries", "Strawberries", "Beets", "Mushrooms", "Radishes", "Squash", "Sweet onions", "Red onions"]
      ]
    },
    "DRINK": ["beer", "wine", "tea"],
    "DRINK SPECIAL": {
      "rows": [
        "Tonight's special cocktail: Pixiewine. Each glass of this crisp, floral-scented wine is served with a pixie.",
        "Tonight's special cocktail: Suckerpunch. Each glass of this potent purple-red punch has several small writhing tentacles that reach out of the glass to attach to your face with their suckers. It actually feels kind of nice.",
        "Tonight's special: Bring-Your-Own-Horn. Bring the horn of your favorite beast or monstrous humanoid (any size!), and we'll fill it with cheap ale or wine for 2 cp.",
        "Tonight's special cocktail: Mindbomb. It's made with absinthe and explosive powder.",
        "Tonight's special cocktail: Fireball. Served by wizards of 5th level or higher.",
        "Tonight's special cocktail: Stonebones. A powerful rum cocktail made with powder gorgon horn and basilisk eye. It's only partial paralysis."
      ],
      "source": "BTT"
    },
    "ELEMENTS": ["air", "earth", "fire", "water"],
    "FEMALE NAME": {
      "concatenate": true,
      "rows": [
        ["Millicent", "Alinor", "Eleanor", "Agnes", "Alice", "Avice", "Beatrice", "Cecily", "Emma", "Isabella", "Joan", "Juliana", "Margery", "Matilda", "Roh", "Morgan", "Elizabeth", "Kethleen"],
        " ",
        "*LASTNAME*"
      ]
    },
    "LASTNAME": {
      "concatenate": true,
      "rows": [
        ["Strong", "Tall", "Grand", "Bold", "Big", "Small", "Fine", "Good", "Glad", "Green", "Blue", "Red", "Black", "White", "Pale", "Gray", "Gold", "Silver", "Dark", "Light", "Brave", "Sly"],
        ["ington", "son", "house", "door", "castle", "forest", "tree", "leaf", "wind", "rain", "snow", "rock", "stone", "river", "sea", "ship", "smith", "craft", "cook", "worth", "might", "wolf", "bear", "sheep", "pig", "fox", "hunt", "dragon"]
      ]
    },
    "MALE NAME": {
      "concatenate": true,
      "rows": [
        ["Adam", "Geoffrey", "Gilbert", "Henry", "Hugh", "John", "Nicholas", "Peter", "Ralf", "Richard", "Robert", "Roger", "Simon", "Thomas", "Walter", "William", "Robin", "Albin", "Bayard", "Erwin"],
        " ",
        "*LASTNAME*"
      ]
    },
    "NAME": ["*MALE NAME*", "*FEMALE NAME*"],
    "PERSON": ["man", "woman"],
    "PLANET PREFIX": ["Kry", "Tor", "Ath", "Eb", "Aeb", "Myst", "Col", "And", "Kar", "Chan", "Gly", "Kul", "Raen", "Ed", "Gni", "Con", "Gin", "Bor", "Ter", "Plu", "Jup", "Merc", "Ven", "Tar", "Tur"],
    "PLANET SUFFIX": ["ril", "nei", "pri", "ill", "atha", "sel", "ka", "en", "ra", "la", "myth", "lyn", "ion", "ynn", "to", "iter", "us", "ury", "lea", "nov", "omia", "tera", "ilia"],
    "TAVERN TABLE": ["table", "seated table"]
  },
  "things": {
    "Acheron": {
      "isa": "fiendish plane"
    },
    "Arcadia": {
      "isa": "celestial plane"
    },
    "Arvandor": {
      "isa": "celestial plane",
      "namegen": "Arvandor (also known as Arborea or Olympus)"
    },
    "Astral Plane": {
      "background": "rainbow",
      "contains": ["silver astral pool", ".astral color pool, 3-10"],
      "icon": "gi gi-circle-claws"
    },
    "Astral Sea": ["Acheron", "Arcadia", "Concordant Opposition/Outlands", "Elysium", "Gehenna", "Gladsheim/Ysgard", "Hades/The Gray Waste", "Happy Hunting Grounds/Beastlands", "The Nine Hells", "Nirvana/Mechanus", "Arvandor", "Pandemonium", "Seven Heavens/Mount Celestia", "Tarterus/Carceri", "Twin Paradises/Bytopia"],
    "Blood Rift": {
      "isa": "fiendish plane"
    },
    "Border Ethereal": {
      "contains": [
        {
          "data": {
            "mirrors": "Prime Material Plane"
          },
          "icon": "fa flaticon-nature-4 fa-rotate-90",
          "isa": "ethereal mirror plane",
          "namegen": "Prime Material Plane"
        },
        {
          "data": {
            "mirrors": "Inner Planes"
          },
          "icon": "gi gi-at-sea",
          "isa": "ethereal mirror plane",
          "namegen": "Inner Planes"
        }
      ],
      "isa": "ethereal plane"
    },
    "Brightwater": {
      "isa": "celestial plane"
    },
    "Celestial Planes": {
      "background": "gold",
      "contains": ["Arvandor", "Brightwater", "Dwarfhome", "Dweomerheart", "The Gates of the Moon", "Golden Hills", "Green Fields", "The House of Knowledge", "The House of the Triad"],
      "icon": "gi gi-hand-of-god"
    },
    "Clangor": {
      "isa": "fiendish plane"
    },
    "Concordant Opposition/Outlands": {
      "isa": "fiendish plane"
    },
    "Coterminous Planes": ["Ethereal Plane", "Astral Plane", "Plane of Shadow"],
    "Deep Caverns": {
      "isa": "fiendish plane"
    },
    "Dwarfhome": {
      "isa": "celestial plane"
    },
    "Dweomerheart": {
      "isa": "celestial plane"
    },
    "Elemental Chaos": [".Inner Planes", "Limbo", "The Abyss"],
    "Elemental Plane of Air": {
      "contains": ["Borealis", "Citadel of Ice and Steel", "Taifun: Palace of Tempests", "Elemental Foundation of Air", ".air plane"],
      "isa": "air plane"
    },
    "Elemental Plane of Earth": {
      "contains": ["The Great Dismal Delve", "The Sevenfold Mazework", "The Pale River", "The Iron Crucible", "The Aviary", "Elemental Foundation of Earth"],
      "isa": "earth plane"
    },
    "Elemental Plane of Fire": {
      "contains": ["City of Brass", "Elemental Foundation of Fire"],
      "isa": "fire plane"
    },
    "Elemental Plane of Water": {
      "contains": ["Elemental Foundation of Water"],
      "isa": "water plane"
    },
    "Elysium": {
      "isa": "celestial plane"
    },
    "Ethereal Plane": {
      "contains": ["Border Ethereal", "Deep Ethereal", "Ravenloft"],
      "isa": "ethereal plane"
    },
    "Fated Depths": {
      "isa": "fiendish plane"
    },
    "Feywild": {
      "data": {
        "mirrors": "Prime Material Plane"
      },
      "icon": "fa flaticon-nature-4 fa-rotate-90",
      "isa": "fey mirror plane"
    },
    "Fiendish Planes": ["River of Blood", "The Abyss", "The Barrens of Doom and Despair", "Blood Rift", "Clangor", "Deep Caverns", "The Demonweb Pits", "Fated Depths", "Fury's Heart", "Hammergrim", "The Nine Hells", "Nishrek", "The Supreme Throne"],
    "Fury's Heart": {
      "isa": "fiendish plane"
    },
    "Gehenna": {
      "isa": "fiendish plane"
    },
    "Gladsheim/Ysgard": {
      "isa": "celestial plane"
    },
    "Golden Hills": {
      "isa": "celestial plane"
    },
    "Great Wheel": {
      "contains": ["Prime Material Plane", "Mirror Planes", "Transitive Planes", "Inner Planes", "Outer Planes"],
      "isa": "cosmology"
    },
    "Green Fields": {
      "isa": "celestial plane"
    },
    "Hades/The Gray Waste": {
      "background": "gray",
      "isa": "fiendish plane"
    },
    "Hammergrim": {
      "isa": "fiendish plane"
    },
    "Happy Hunting Grounds/Beastlands": {
      "isa": "celestial plane"
    },
    "Inner Planes": {
      "background": "wheat",
      "contains": ["Elemental Plane of Air", "Elemental Plane of Earth", "Elemental Plane of Fire", "Elemental Plane of Water", "Positive Energy Plane", "Negative Energy Plane"],
      "icon": "gi gi-at-sea"
    },
    "Limbo": {
      "background": "gray",
      "contains": ["*RANDOM*"],
      "icon": "gi gi-time-trap"
    },
    "Mirror Planes": {
      "background": "white",
      "contains": ["Shadowfell", "Feywild"],
      "icon": "fa flaticon-nature-4 fa-rotate-90",
      "textColor": "black"
    },
    "Negative Energy Plane": {
      "background": "gray",
      "icon": "fa fa-minus"
    },
    "Neutral Planes": ["Dragon Eyrie", "Heliopolis", "House of Nature", "Jotunheim", "Warrior's Rest"],
    "Nirvana/Mechanus": {
      "isa": "fiendish plane"
    },
    "Nishrek": {
      "isa": "fiendish plane"
    },
    "Outer Planes": {
      "background": "wheat",
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
      "icon": "gi gi-cartwheel"
    },
    "Outer Planes (Tree)": {
      "background": "wheat",
      "contains": ["Celestial Planes", "Fiendish Planes", "Neutral Planes"],
      "icon": "gi gi-tree-branch",
      "namegen": "Outer Planes"
    },
    "Pandemonium": {
      "isa": "fiendish plane"
    },
    "Plane of Shadow": {
      "isa": "Shadowfell"
    },
    "Positive Energy Plane": {
      "background": "lightgreen",
      "icon": "fa fa-plus"
    },
    "Prime Material Plane": {
      "contains": ["crystal sphere, 1-5"],
      "isa": "material plane"
    },
    "Ravenloft": {
      "contains": ["Barovia", ".demiplane"],
      "namegen": "Demiplane of Dread (Ravenloft)"
    },
    "River of Blood": {
      "isa": "fiendish plane"
    },
    "Seven Heavens/Mount Celestia": {
      "isa": "celestial plane"
    },
    "Shadowfell": {
      "data": {
        "mirrors": "Prime Material Plane"
      },
      "icon": "fa flaticon-nature-4 fa-rotate-90",
      "isa": "undead mirror plane"
    },
    "Tarterus/Carceri": {
      "isa": "fiendish plane"
    },
    "The Abyss": {
      "isa": "abyssal plane"
    },
    "The Aviary": [".cavern"],
    "The Barrens of Doom and Despair": {
      "isa": "fiendish plane"
    },
    "The Demonweb Pits": {
      "isa": "fiendish plane"
    },
    "The Gates of the Moon": {
      "isa": "celestial plane"
    },
    "The Great Dismal Delve": ["The Sevenfold Mazework", ".continent"],
    "The House of Knowledge": {
      "isa": "celestial plane"
    },
    "The House of the Triad": {
      "isa": "celestial plane"
    },
    "The Iron Crucible": {
      "namegen": "The Iron Crucible: portal to |*ELEMENTS*| plane"
    },
    "The Nine Hells": {
      "isa": "fiendish plane"
    },
    "The Pale River": {
      "namegen": "The Pale River: portal to |*ELEMENTS*| plane"
    },
    "The Supreme Throne": {
      "isa": "fiendish plane"
    },
    "Transitive Planes": {
      "background": "wheat",
      "contains": ["Ethereal Plane", "Astral Plane"],
      "icon": "gi gi-dust-cloud"
    },
    "Twin Paradises/Bytopia": {
      "isa": "celestial plane"
    },
    "World Axis": {
      "contains": ["Prime Material Plane", "Shadowfell", "Feywild", "Astral Sea", "Elemental Chaos"],
      "isa": "cosmology"
    },
    "World Tree": {
      "contains": ["Prime Material Plane", "Inner Planes", "Coterminous Planes", "Outer Planes (Tree)", "Cynosure", "Fugue Plane"],
      "isa": "cosmology"
    },
    "abyssal plane": {
      "background": "black",
      "contains": ["hostile citadel, 1-3", "hostile palace, 1-3", "hostile temple, 1-5"],
      "icon": "fa flaticon-black-hole fa-spin"
    },
    "acid": {
      "icon": "gi gi-acid"
    },
    "acid weapon": {
      "background": "limegreen",
      "icon": ["gi gi-acid"]
    },
    "adamantine armor": {
      "isa": "armor"
    },
    "adult black dragon": {
      "isa": "dragon"
    },
    "adult blue dragon": {
      "isa": "dragon"
    },
    "adult brass dragon": {
      "isa": "dragon"
    },
    "adult bronze dragon": {
      "isa": "dragon"
    },
    "adult copper dragon": {
      "isa": "dragon"
    },
    "adult gold dragon": {
      "isa": "dragon"
    },
    "adult green dragon": {
      "isa": "dragon"
    },
    "adult red dragon": {
      "isa": "dragon"
    },
    "adult silver dragon": {
      "isa": "dragon"
    },
    "adult white dragon": {
      "isa": "dragon"
    },
    "air plane": {
      "background": "aliceBlue",
      "contains": ["citadel, 0-3", "gaseous bubble, 3-7", "floating liquid sphere, 3-7", "asteroid, 0-2"],
      "icon": "gi gi-fluffy-cloud"
    },
    "ammunition": {
      "icon": ["gi gi-quiver"]
    },
    "amulet": {
      "background": "indigo",
      "icon": ["gi gi-gem-necklace", "gi gi-necklace"],
      "textColor": "gold"
    },
    "amulet of health": {
      "isa": "amulet"
    },
    "amulet of proof against detection and location": {
      "isa": "amulet"
    },
    "amulet of the planes": {
      "isa": "amulet"
    },
    "ancient black dragon": {
      "isa": "dragon"
    },
    "ancient blue dragon": {
      "isa": "dragon"
    },
    "ancient brass dragon": {
      "isa": "dragon"
    },
    "ancient bronze dragon": {
      "isa": "dragon"
    },
    "ancient copper dragon": {
      "isa": "dragon"
    },
    "ancient gold dragon": {
      "isa": "dragon"
    },
    "ancient green dragon": {
      "isa": "dragon"
    },
    "ancient red dragon": {
      "isa": "dragon"
    },
    "ancient silver dragon": {
      "isa": "dragon"
    },
    "ancient white dragon": {
      "isa": "dragon"
    },
    "ape": {
      "icon": "gi gi-monkey"
    },
    "armor": {
      "icon": "gi gi-armor-vest"
    },
    "arrows": {
      "icon": "gi gi-target-arrows"
    },
    "assassin": {
      "icon": "gi gi-assassin-pocket"
    },
    "astral color pool": ["*COLORS*| astral pool"],
    "backpack": {
      "icon": "gi gi-backpack"
    },
    "bar": {
      "background": "blanchedalmond",
      "contains": ["barkeep", "keg"],
      "icon": ["gi gi-beer-stein"],
      "name": "bar",
      "textColor": "goldenrod"
    },
    "bard": {
      "background": "mintcream",
      "icon": ["gi gi-lyre", "gi gi-pan-flute"],
      "isa": "person",
      "name": "bard",
      "textColor": "gold"
    },
    "barkeep": {
      "isa": "person",
      "name": "barkeep"
    },
    "barrel": {
      "icon": "gi gi-barrel"
    },
    "barren planet": {
      "background": "black",
      "icon": "fa flaticon-big-moon"
    },
    "basket": {
      "icon": "fa fa-shopping-basket"
    },
    "bat": {
      "icon": ["gi gi-bat", "gi gi-bat-wing", "gi gi-evil-bat"]
    },
    "battlefield": {
      "background": "darkred",
      "icon": "gi gi-bloody-sword"
    },
    "beach": {
      "background": "navajowhite",
      "icon": "fa flaticon-palm-trees",
      "textColor": "darkblue"
    },
    "beast": {
      "icon": "gi gi-beast-eye"
    },
    "bed": {
      "background": "floralwhite",
      "icon": "gi gi-bed",
      "name": "bed",
      "textColor": "firebrick"
    },
    "bedroll": {
      "icon": ["gi gi-bandage-roll"],
      "isa": "adventuring gear",
      "name": "bedroll"
    },
    "bedroom": {
      "background": "floralwhite",
      "icon": ["gi gi-wooden-door"],
      "name": "bedroom",
      "textColor": "burlywood"
    },
    "beer": {
      "background": "black",
      "icon": [
        "fa fa-beer",
        "gi gi-beer-bottle","gi gi-beer-stein"],
      "name": "beer",
      "textColor": "goldenrod"
    },
    "bell": {
      "icon": ["gi gi-ringing-bell", "fa fa-bell", "fa fa-bell-o"]
    },
    "black dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "block and tackle": {
      "background": "khaki",
      "icon": ["gi gi-rope-coil"]
    },
    "bludgeoning weapon": {
      "icon": ["gi gi-flanged-mace", "gi gi-mace-head", "gi gi-wood-club", "gi gi-spiked-mace", "gi gi-hammer-drop"]
    },
    "blue dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "boar": {
      "icon": "gi gi-boar-tusks"
    },
    "bones": {
      "background": "oldlace",
      "icon": "gi gi-jawbone"
    },
    "book": {
      "icon": ["gi gi-book-cover", "gi gi-evil-book", "gi gi-open-book", "gi gi-black-book", "gi gi-white-book", "fa fa-book"]
    },
    "boots": {
      "background": "tan",
      "icon": ["gi gi-boots", "gi gi-steeltoe-boots", "gi gi-walking-boot"],
      "textColor": "saddlebrown"
    },
    "boots of elvenkind": {
      "isa": "boots"
    },
    "boots of levitation": {
      "isa": "boots"
    },
    "boots of speed": {
      "isa": "boots"
    },
    "boots of striding and springing": {
      "isa": "boots"
    },
    "boots of the winterlands": {
      "isa": "boots"
    },
    "bowl of commanding water elementals": {
      "icon": ["gi gi-water-splash"]
    },
    "bracers": {},
    "brass dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "breastplate": {
      "icon": "gi gi-breastplate"
    },
    "breastplate +1": {
      "isa": "breastplate"
    },
    "breastplate +2": {
      "isa": "breastplate"
    },
    "breastplate +3": {
      "isa": "breastplate"
    },
    "breastplate of acid resistance": {
      "isa": "breastplate"
    },
    "breastplate of cold resistance": {
      "isa": "breastplate"
    },
    "breastplate of fire resistance": {
      "isa": "breastplate"
    },
    "breastplate of force resistance": {
      "isa": "breastplate"
    },
    "breastplate of lightning resistance": {
      "isa": "breastplate"
    },
    "breastplate of necrotic resistance": {
      "isa": "breastplate"
    },
    "breastplate of poison resistance": {
      "isa": "breastplate"
    },
    "breastplate of psychic resistance": {
      "isa": "breastplate"
    },
    "breastplate of radiant resistance": {
      "isa": "breastplate"
    },
    "bronze dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "bucket": {
      "icon": "fa fa-bitbucket"
    },
    "camel": {
      "icon": "gi gi-camel-head"
    },
    "campfire": {
      "icon": "gi gi-campfire"
    },
    "candle": {
      "icon": ["gi gi-candle-flame", "gi gi-candle-holder", "gi gi-candle-light"]
    },
    "castle": {
      "icon": "fa flaticon-castle"
    },
    "cat": {
      "icon": ["gi gi-black-cat", "gi gi-white-cat"]
    },
    "cave": {
      "background": "saddlebrown",
      "icon": "gi gi-mountain-cave"
    },
    "celestial plane": {
      "background": "gold",
      "contains": ["citadel, 1-3", "palace, 1-3", "temple, 1-5"],
      "icon": "fa flaticon-religion-cross"
    },
    "cemetery": {
      "background": "gray",
      "icon": "gi gi-graveyard"
    },
    "chain": {
      "icon": "fa fa-chain"
    },
    "chest": {
      "icon": ["gi gi-chest", "gi gi-locked-chest", "gi gi-open-chest"]
    },
    "city": {
      "icon": "fa flaticon-castle"
    },
    "city district": {
      "icon": "fa flaticon-suburb"
    },
    "club": {
      "icon": ["gi gi-wood-club"]
    },
    "continent": {
      "contains": ["region, 2-7", "sea, 1-2", "wasteland, 50%"]
    },
    "copper dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "cosmology": {
      "background": "antiquewhite",
      "contains": [
        [".Great Wheel", ".World Axis", ".World Tree"]
      ],
      "name": "cosmology"
    },
    "crab": {
      "icon": ["gi gi-crab-claw", "gi gi-crab", "gi gi-sad-crab"]
    },
    "crowbar": {
      "icon": "gi gi-crowbar"
    },
    "crystal": {
      "icon": "gi gi-floating-crystal"
    },
    "crystal sphere": {
      "background": "black",
      "contains": ["star", "star, 3%", "planet, 2-5"],
      "icon": "gi gi-crystal-shine pulse animated infinite",
      "namegen": "*PLANET PREFIX*|*PLANET SUFFIX*|space",
      "textColor": "mediumpurple"
    },
    "cultist": {
      "icon": "gi gi-cultist"
    },
    "dagger": {
      "icon": ["gi gi-broad-dagger", "gi gi-plain-dagger", "gi gi-sacrificial-dagger"]
    },
    "diamond": {
      "icon": "gi gi-cut-diamond"
    },
    "dragon": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "dragon scale mail": {
      "icon": "gi-spiked-armor"
    },
    "dragon slayer": {
      "icon": "gi-winged-sword"
    },
    "dragon turtle": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "drum": {
      "icon": "gi-music-spell"
    },
    "eagle": {
      "icon": "gi gi-eagle-emblem"
    },
    "earth plane": {
      "background": "sienna",
      "contains": ["mountain, 1-6", "wizard tower, 0-3", "mine, 0-3", "city, 2-5", "town, 2-5"],
      "icon": "gi gi-rock"
    },
    "elephant": {
      "icon": "gi gi-elephant-head"
    },
    "emblem": {
      "icon": "gi gi-condor-emblem"
    },
    "ethereal mirror plane": {
      "background": "whitesmoke",
      "isa": "mirror plane",
      "textColor": null
    },
    "ethereal plane": {
      "background": "whitesmoke",
      "icon": "gi gi-cloud-ring gi-spin"
    },
    "farm": {
      "background": "wheat",
      "icon": "fa flaticon-hay-rolls"
    },
    "fey mirror plane": {
      "background": "lavenderblush",
      "isa": "mirror plane",
      "textColor": "purple"
    },
    "fey plane": ["citadel, 1-3", "palace, 1-3", "temple, 1-5"],
    "fiendish plane": {
      "background": "darkred",
      "contains": ["hostile citadel, 1-3", "hostile palace, 1-3", "hostile temple, 1-5"],
      "icon": "gi gi-daemon-skull"
    },
    "fire plane": {
      "background": "darkRed",
      "contains": ["tower, 1-10", "city, 1-2", "volcano, 1-3", "castle, 1-2", "palace, 2-3"],
      "icon": "gi gi-flamed-leaf gi-rotate-45"
    },
    "fire weapon": {
      "background": "firebrick",
      "icon": ["gi gi-flaming-arrow"]
    },
    "fireplace": {
      "background": "firebrick",
      "icon": ["gi gi-campfire"],
      "name": "fireplace",
      "textColor": "gold"
    },
    "flask": {
      "icon": ["gi gi-bubbling-flask", "gi gi-fizzing-flask", "gi gi-round-bottom-flask", "fa fa-flask"]
    },
    "flute": {
      "icon": "gi gi-pan-flute"
    },
    "forest": {
      "background": "LIGHTGREEN",
      "icon": ["fa flaticon-forest", "fa flaticon-nature-2"]
    },
    "frog": {
      "icon": "gi gi-frog"
    },
    "gas giant": {
      "background": "black",
      "icon": "fa flaticon-moon",
      "textColor": "papayawhip"
    },
    "gaseous bubble": {
      "namegen": "*COLORS*| gaseous bubble"
    },
    "ghost": {
      "icon": "gi gi-ghost"
    },
    "gold dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "grave": {
      "icon": "gi gi-pirate-grave"
    },
    "green dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "guard": {
      "icon": ["gi gi-guards", "gi gi-guarded-tower"]
    },
    "halberd": {
      "icon": ["gi gi-sharp-halberd", "gi gi-halberd"]
    },
    "half-red dragon veteran": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "hammer": {
      "icon": "gi gi-stake-hammer"
    },
    "harpy": {
      "icon": "gi gi-harpy"
    },
    "hat": {
      "icon": "gi gi-robin-hood-hat"
    },
    "horn": {
      "icon": "gi gi-hunting-horn"
    },
    "hourglass": {
      "icon": ["gi gi-empty-hourglass", "gi gi-hourglass"]
    },
    "house": {
      "icon": "gi gi-house"
    },
    "hydra": {
      "icon": "gi gi-hydra"
    },
    "imp": {
      "icon": ["gi gi-imp-laugh", "gi gi-imp"]
    },
    "ink": {
      "icon": ["gi gi-quill-ink"]
    },
    "jug": {
      "icon": "gi gi-jug"
    },
    "keg": {
      "background": "blanchedalmond",
      "icon": ["gi gi-barrel"],
      "name": "keg",
      "textColor": "saddlebrown"
    },
    "kingdom": {
      "icon": "fa flaticon-castle"
    },
    "knight": {
      "icon": ["gi gi-black-knight-helm", "gi gi-mounted-knight"]
    },
    "ladder": {
      "icon": ["gi gi-ladder"]
    },
    "lamp": {
      "icon": "gi-lantern-flame"
    },
    "library": {
      "icon": "gi gi-bookshelf"
    },
    "lion": {
      "icon": "gi gi-lion"
    },
    "lizard": {
      "icon": "gi gi-lizard-tongue"
    },
    "lock": {
      "icon": ["fa fa-lock"]
    },
    "lyre": {
      "icon": "gi gi-lyre"
    },
    "mace": {
      "icon": ["gi gi-flanged-mace", "gi gi-spiked-mace"]
    },
    "man": {
      "icon": ["fa fa-male", "gi gi-pikeman", "gi gi-dwarf-face", "gi gi-monk-face"],
      "isa": "person",
      "name": "man",
      "namegen": "*MALE NAME* "
    },
    "manacles": {
      "icon": "gi gi-manacles"
    },
    "material plane": {
      "background": "black",
      "contains": ["crystal sphere, 1-5"],
      "icon": "fa flaticon-nature-4",
      "textColor": "white"
    },
    "medallion of thoughts": {
      "icon": "gi-necklace"
    },
    "menu": {
      "background": "brown",
      "contains": ["*DRINK SPECIAL*", "food, 1-5", ".*DRINK*"],
      "icon": ["gi gi-folded-paper"],
      "name": "menu",
      "textColor": "antiquewhite"
    },
    "minotaur": {
      "icon": "gi gi-minotaur"
    },
    "mirror plane": {
      "contains": ["fake"]
    },
    "monster": {
      "icon": "gi gi-monster-grasp"
    },
    "monument": {
      "icon": ["gi gi-water-fountain", "gi gi-ionic-column"]
    },
    "moon": {
      "background": "black",
      "icon": "fa flaticon-big-moon fa-spin"
    },
    "mountain": {
      "background": "saddlebrown",
      "icon": ["fa flaticon-hills", "gi gi-mountain-cave", "gi gi-mountains", "gi gi-mountaintop"]
    },
    "net": {
      "icon": "gi gi-fishing-net"
    },
    "octopus": {
      "icon": "gi gi-octopus"
    },
    "oil": {
      "icon": "fa fa-tint"
    },
    "orb": {
      "icon": "gi gi-orb-wand"
    },
    "orb of dragonkind": {
      "icon": ["gi-orb-wand"]
    },
    "orc": {
      "icon": "gi gi-orc-head"
    },
    "owl": {
      "icon": "gi gi-owl"
    },
    "paper": {
      "icon": "gi gi-folded-paper"
    },
    "pegasus": {
      "icon": "gi gi-pegasus"
    },
    "perfume": {
      "icon": "gi gi-perfume-bottle"
    },
    "person": {
      "background": "saddlebrown",
      "icon": ["fa fa-male", "fa fa-female", "gi gi-pikeman", "gi gi-dwarf-face", "gi gi-monk-face", "gi gi-woman-elf-face"],
      "name": "person",
      "namegen": "*NAME*",
      "textColor": "navajowhite"
    },
    "planet": {
      "background": "black",
      "contains": ["continent, 1-5", "underdark, 90%"],
      "icon": ["fa fa-globe fa-spin", "gi gi-earth-asia-oceania gi-spin", "gi gi-earth-africa-europe gi-spin", "gi gi-earth-america gi-spin"],
      "textColor": "DodgerBlue"
    },
    "plant": {
      "icon": "gi gi-carnivorous-plant"
    },
    "pole": {
      "icon": "gi gi-fishing-pole"
    },
    "potion": {
      "icon": ["gi gi-magic-potion", "gi gi-potion-ball", "gi gi-standing-potion"]
    },
    "pseudodragon": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "quiver": {
      "icon": "gi gi-quiver"
    },
    "rat": {
      "icon": "gi-mouse"
    },
    "raven": {
      "icon": "gi gi-raven"
    },
    "realm": {},
    "red dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "region": {
      "contains": ["city, 1-3", "village, 2-5"]
    },
    "rhinoceros": {
      "icon": "gi gi-rhinoceros-horn"
    },
    "ring": {
      "icon": ["gi gi-diamond-ring", "gi gi-ring"]
    },
    "sack": {
      "icon": "gi gi-knapsack"
    },
    "salamander": {
      "icon": "gi gi-salamander"
    },
    "scorpion": {
      "icon": ["gi gi-scorpion-tail", "gi gi-scorpion"]
    },
    "scroll": {
      "icon": ["gi gi-scroll-unfurled", "gi gi-tied-scroll"]
    },
    "seated table": {
      "contains": ["*PERSON*, 1-6", "*DRINK*, 0-4", "*DINNER*, 50%"],
      "icon": ["gi gi-tabletop-players"],
      "isa": "table",
      "name": "seated table",
      "namegen": ""
    },
    "shadow": {
      "icon": ["gi gi-shadow-follower", "gi gi-two-shadows"]
    },
    "shield": {
      "icon": [
        "gi gi-american-shield",
        "gi gi-attached-shield",
        "gi gi-roman-shield",
        "gi gi-templar-shield",
        "gi gi-viking-shield",
        "gi gi-bordered-shield",
        "gi gi-broken-shield",
        "gi gi-checked-shield",
        "gi gi-cracked-shield",
        "gi gi-crenulated-shield",
        "gi gi-edged-shield",
        "gi gi-eye-shield",
        "gi gi-fire-shield",
        "gi gi-ice-shield",
        "gi gi-lightning-shield",
        "gi gi-magic-shield",
        "gi gi-rosa-shield",
        "gi gi-skull-shield",
        "gi gi-slashed-shield",
        "gi gi-winged-shield",
        "gi gi-zebra-shield",
        "gi gi-shield",
        "gi gi-round-shield",
        "fa fa-shield"
      ]
    },
    "shirt": {
      "icon": "gi gi-shirt"
    },
    "shop": {
      "icon": "gi gi-shop"
    },
    "sickle": {
      "icon": ["gi gi-sickle"]
    },
    "silver astral pool": {
      "namegen": "silver astral pool (portal to material plane)"
    },
    "silver dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "skeleton": {
      "icon": "gi-skeletal-hand"
    },
    "sling": {
      "icon": "gi gi-slingshot"
    },
    "smithy": {
      "icon": "gi gi-sword-smithing"
    },
    "soap": {
      "icon": "gi-bubbles"
    },
    "solar": {
      "icon": "gi gi-solar-system"
    },
    "spear": {
      "icon": ["gi gi-spear-feather", "gi gi-stone-spear"]
    },
    "spider": {
      "icon": ["gi gi-spider-alt", "gi gi-spider-face", "gi gi-spider-bot", "gi gi-angular-spider", "gi gi-hanging-spider", "gi gi-masked-spider", "gi gi-spider-web"]
    },
    "spy": {
      "icon": "gi gi-lock-spy"
    },
    "spyglass": {
      "icon": "gi gi-spyglass"
    },
    "staff": {
      "icon": "gi gi-wizard-staff"
    },
    "star": {
      "background": "black",
      "icon": "fa flaticon-sun fa-spin",
      "textColor": "gold"
    },
    "sword": {
      "icon": ["gi gi-croc-sword", "gi gi-energy-sword", "gi gi-fragmented-sword", "gi gi-rune-sword", "gi gi-shard-sword", "gi gi-shining-sword", "gi gi-spinning-sword", "gi gi-sword-array", "gi gi-sword-spade", "gi gi-sword-spin", "gi gi-winged-sword", "gi gi-zeus-sword"]
    },
    "table": {
      "background": "blanchedalmond",
      "icon": ["gi gi-table"],
      "name": "table"
    },
    "tavern": {
      "background": "antiquewhite",
      "contains": ["*TAVERN TABLE*, 2-5", "bar", "fireplace", "bedroom, 1-6", "menu", "bard, 0-4"],
      "isa": "shop",
      "name": "tavern"
    },
    "tea": {
      "background": "saddlebrown",
      "icon": ["fa fa-coffee", "gi gi-coffee-mug", "gi gi-coffee-cup"],
      "name": "tea",
      "textColor": "floralwhite"
    },
    "temple": {
      "icon": "gi gi-church"
    },
    "tiger": {
      "icon": "gi gi-tiger"
    },
    "tome of clear thought": {
      "icon": "gi gi-book-cover"
    },
    "torch": {
      "icon": "gi gi-torch"
    },
    "totem": {
      "icon": ["gi gi-totem", "gi gi-snake-totem", "gi gi-totem-head"]
    },
    "townhall": {
      "contains": ["jail"]
    },
    "trident": {
      "icon": ["gi gi-magic-trident", "gi gi-harpoon-trident", "gi gi-trident"]
    },
    "troll": {
      "icon": "gi gi-troll"
    },
    "undead mirror plane": {
      "background": "gray",
      "isa": "mirror plane",
      "textColor": null
    },
    "unicorn": {
      "icon": "gi gi-unicorn"
    },
    "vial": {
      "icon": "gi gi-vial"
    },
    "village": {
      "contains": ["tavern, 1-3", "house, 3-15", "graveyard", "townhall"]
    },
    "vulture": {
      "icon": "gi gi-vulture"
    },
    "wand": {
      "icon": ["gi gi-lunar-wand", "gi gi-crystal-wand", "gi gi-fairy-wand", "gi gi-orb-wand"]
    },
    "water plane": {
      "background": "darkblue",
      "contains": ["ocean", "tower, 1-10", "city, 1-2", "castle, 1-2", "palace, 2-3"],
      "icon": "gi gi-at-sea"
    },
    "wave": {
      "icon": ["gi gi-wave-strike"]
    },
    "whip": {
      "icon": "gi gi-whip"
    },
    "white dragon wyrmling": {
      "icon": ["gi gi-dragon-head", "gi gi-double-dragon"]
    },
    "wine": {
      "background": "rosybrown",
      "icon": ["fa fa-glass", "gi gi-wine-glass"],
      "name": "wine",
      "textColor": "brown"
    },
    "wolf": {
      "icon": ["gi gi-wolf-head", "gi gi-wolf-howl"]
    },
    "woman": {
      "icon": ["fa fa-female", "gi gi-woman-elf-face"],
      "isa": "person",
      "name": "woman",
      "namegen": "*FEMALE NAME* "
    },
    "wyvern": {
      "icon": "gi gi-wyvern"
    },
    "young black dragon": {
      "isa": "dragon"
    },
    "young blue dragon": {
      "isa": "dragon"
    },
    "young brass dragon": {
      "isa": "dragon"
    },
    "young bronze dragon": {
      "isa": "dragon"
    },
    "young copper dragon": {
      "isa": "dragon"
    },
    "young gold dragon": {
      "isa": "dragon"
    },
    "young green dragon": {
      "isa": "dragon"
    },
    "young red dragon": {
      "isa": "dragon"
    },
    "young silver dragon": {
      "isa": "dragon"
    },
    "young white dragon": {
      "isa": "dragon"
    },
    "zombie": {
      "icon": ["gi gi-shambling-zombie", "gi gi-raise-zombie"]
    },
    "menu":{"name":"menu","background":"brown","contains":["*DRINK SPECIAL*","*DINNER*, 1-2","beer","wine","tea"],"icon":["gi gi-folded-paper"],"textColor":"antiquewhite"},
    "food":{"name":"food","namegen":"*DINNER*","icon":["gi gi-roast-chicken","gi gi-meat"]},"menu":{"name":"menu","background":"brown","contains":["*DRINK SPECIAL*","food, 1-2","beer","wine","tea"],"icon":["gi gi-folded-paper"],"textColor":"antiquewhite"},
    "Great Wheel":{"name":"Great Wheel","contains":["Prime Material Plane","Mirror Planes","Transitive Planes","Inner Planes","Outer Planes"],"isa":"cosmology","icon":["gi gi-ship-wheel"]}
  },
  "version": "0.0.0"
};

function createMirrorPlane(instance, name){
	var instanceStore = instance.instanceStore;
	var thingStore = instance.thing.thingStore;
	var thing = thingStore.get(name);

	instance.children.forEach(function(child){
		if(typeof child !== "number") return;
		child = instanceStore.get(child);
		child.background = thing.background;
		child.textColor = thing.textColor;
		if(child.cssClass.indexOf(thing.background) === -1)
			child.cssClass = " "+thing.background;
		if(child.data.mirrors !== undefined && instanceStore.get(child.data.mirrors).thing.contains){
			child.thing = styleAThing(child.thing,name);
		}
	});
}

function styleAThing(thing, styleName){
	var prefix = styleName.split(" ")[0]+" ";
	if(thing.isa && thing.isa.startsWith(styleName)){
		return thing;
	}
	var thingStore = thing.thingStore;

	var originalThing = thing.name;
	if(!originalThing) originalThing = "";
	if(thingStore.exists(prefix+originalThing)){
		return thingStore.get(prefix+originalThing);
	}

	thing = thingStore.add({
		"name": prefix+originalThing,
		"isa": originalThing
	});
	thing.isa = styleName;

	return thing;
}

pack.things["mirror plane"].beforeRender = function(instance){
	if(typeof instance.data.mirrors === "undefined") return;

	var instanceStore = instance.instanceStore;
	var thingStore = instance.thing.thingStore;

	if(typeof instance.data.mirrors === "string"){
		var index = thingStore.get(instance.data.mirrors).uniqueInstance;
		if(typeof index==='number'){
			instance.data.mirrors = index;
		}else return;
	}

	var mirrorInstance = instanceStore.get(instance.data.mirrors);
	if(!mirrorInstance.grown) 
		mirrorInstance.grow();

	if(instance.data.mirrorChildrenCopy === JSON.stringify(mirrorInstance.children)){
		return;
	}

	//TODO: copy contents of children and transform
	instance.children = [];
	mirrorInstance.children.forEach(function(mirrorChild){
		if(typeof mirrorChild==="number"){
			mirrorChild = instanceStore.get(mirrorChild);

			//create a new mirror plane thing
			var mirrorThing = mirrorChild.thing;
			var childThing = styleAThing(mirrorChild.thing,"mirror plane");

			//create new child and copy mirror
			var child = instanceStore.add(childThing);
			var newId = child.id;
			Object.assign(child,mirrorChild);
			child.id = newId;
			child.parent = instance.id;
			child.thing = childThing;
			child.data.mirrors = mirrorChild.id;
			child.data.mirrorChildrenCopy = null;

			instance.children.push(child.id);
			return;
		}

		instance.children.push(mirrorChild);
		return;
	});
	if(instance.children.length != mirrorInstance.children.length){
		console.error("Error while mirroring an instance: ended up with "+instance.children.length+" children when there need to be "+mirrorInstance.children.length);
	}

	instance.data.mirrorChildrenCopy = JSON.stringify(mirrorInstance.children);
}


pack.things["undead mirror plane"].beforeRender = function(instance){
	createMirrorPlane(instance, "undead mirror plane");
};

pack.things["fey mirror plane"].beforeRender = function(instance){
	createMirrorPlane(instance, "fey mirror plane");
};

pack.things["ethereal mirror plane"].beforeRender = function(i){
	createMirrorPlane(i,"ethereal mirror plane");
};

module.exports = pack;
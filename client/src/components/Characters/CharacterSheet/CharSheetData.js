import React from "react";

import { Item } from './CharSheetShowWork';

export const RolePlay = ({race, body, abilities, background, profBonus, proficiencies, col}) => (
	<div className={`close-col col-${col}`}>
		<div className="row">
			<Item
				xs={12}
				label="Race"
				value={
					race.label && race.label.length
						? race.label
						: race.name
				}
			/>
			<Item
				xs={12}
				label="Background"
				value={
					background.name +
					" " +
					background.specialty
				}
			/>
			<Item
				xs={8}
				label="Start Coin"
				value={background.startingCoin}
			/>

			<Item xs={4} label="Speed" value={body.speed+" ft."} />
			<Item
				xs={8}
				label="Proficiency Bonus"
				value={profBonus}
			/>
			<Item xs={4} label="Size" value={race.size} />
		</div>
		<div className="row">
			<Item xs={4} label="Eyes" value={body.eyes} />
			<Item xs={4} label="Skin" value={body.skin} />
			<Item xs={4} label="Hair" value={body.hair} />
		</div>
		<div className="row">
			<Item xs={4} label="Age" value={body.age} />
			<Item
				xs={4}
				label="Height"
				value={body.height}
			/>
			<Item
				xs={4}
				label="Weight"
				value={body.weight}
			/>
		</div>
		<BaseAbilityScores abilities={abilities} />
		<p>&nbsp;</p>
		<div className="row">
			<ProficienciesList
				proficiencies={proficiencies}
				profBonus={profBonus}
			/>
		</div>
	</div>
);

// abilties are Abilities
const BaseAbilityScores = ({abilities}) => (
	<div className="row">
		<div xs={6} className="col no-padding">
			<Item
				xs={4}
				label="STR"
				value={abilities.Strength.getScore()}
			/>
			<Item
				xs={4}
				label="DEX"
				value={abilities.Dexterity.getScore()}
			/>
			<Item
				xs={4}
				label="CON"
				value={abilities.Constitution.getScore()}
			/>
		</div>
		<div xs={6} className="col no-padding">
			<Item
				xs={4}
				label="INT"
				value={abilities.Intelligence.getScore()}
			/>
			<Item
				xs={4}
				label="WIS"
				value={abilities.Wisdom.getScore()}
			/>
			<Item
				xs={4}
				label="CHA"
				value={abilities.Charisma.getScore()}
			/>
		</div>
	</div>
);

const ProficienciesList = ({ proficiencies, profBonus }) => (
	<div className="description">
		<p className="title-sm">Proficiencies</p>
		<p>
			<em>Languages: </em>
			{proficiencies.languages.list.join(", ")}
		</p>
		<p>
			{proficiencies.armor.list.length
				? <em>Armor: </em>
				: ""}
			{proficiencies.armor.list.join(", ")}
		</p>
		<p>
			{proficiencies.weapons.list.length
				? <em>Weapons: </em>
				: ""}
			{proficiencies.weapons.list.join(", ")}
		</p>
		<p>
			{proficiencies.tools.list.length
				? <em>Tools: </em>
				: ""}
			{toolsToString(proficiencies.tools, profBonus)}
		</p>
	</div>
);

function toolsToString(tools, profBonus){
	let toolsStr = "";
	tools.list.forEach((tool, i) => {
		if(!tool.length) return;
		
		toolsStr+= tool+" ";
		if(tools.double_proficiency.includes(tool))
			toolsStr += "+"+parseInt(profBonus,10)*2;
		else
			toolsStr += profBonus;
		if(i !== tools.list.length-1) toolsStr+=", ";
	});
	return toolsStr;
}

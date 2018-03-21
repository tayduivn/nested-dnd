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
			<Item label="Speed" value={body.speed+" ft."} />
			<Item
				xs={8}
				label="Proficiency Bonus"
				value={profBonus}
			/>
			<Item label="Size" value={race.size} />
		</div>
		<div className="row">
			<Item label="Eyes" value={body.eyes} />
			<Item label="Skin" value={body.skin} />
			<Item label="Hair" value={body.hair} />
		</div>
		<div className="row">
			<Item label="Age" value={body.age} />
			<Item label="Height" value={body.height} />
			<Item label="Weight" value={body.weight} />
		</div>
		<BaseAbilityScores {...abilities} />
		<p>&nbsp;</p>
		<div className="row">
			<ProficienciesList {...proficiencies} profBonus={profBonus} />
		</div>
	</div>
);

// abilties are Abilities
const Ability = ({label, score}) => <Item label={label} value={score.getScore()} />;

const BaseAbilityScores = ({Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma}) => (
	<div className="row">
		<div xs={6} className="col no-padding">
			<Ability label="STR" score={Strength} />
			<Ability label="DEX" score={Dexterity} />
			<Ability label="CON" score={Constitution} />
			<Ability label="INT" score={Intelligence} />
			<Ability label="WIS" score={Wisdom} />
			<Ability label="CHA" score={Charisma} />
		</div>
	</div>
);

const ProfParagraph = ({list, label}) => (
	<p>
		<em>{list.length ? label : ''} </em>
		{list}
	</p>
)

const ProficienciesList = ({ languages, armor, weapons, tools, profBonus }) => (
	<div className="description">
		<p className="title-sm">Proficiencies</p>
		<ProfParagraph label="Languages" list={languages.list.join(", ")} />
		<ProfParagraph label="Armor" list={armor.list.join(", ")} />
		<ProfParagraph label="Weapons" list={weapons.list.join(", ")} />
		<ProfParagraph label="Tools" list={toolsToString(tools, profBonus)} />
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

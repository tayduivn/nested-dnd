import React from "react";

import { Item } from './CharSheetShowWork';

export const RolePlay = ({race = {}, body = {}, abilities, background = {}, profBonus, proficiencies, col}) => (
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
				xs={8}
				label="Background"
				value={
					background.name +
					(background.specialty ? " " +background.specialty : '')
				}
			/>
			<Item
				xs={4}
				label="Coin"
				value={background.startingCoin}
			/>
			<Item xs={4} label="Speed" value={((body.speeds && body.speeds.walk+" ft.") || "")} />
			<Item xs={4} label="Size" value={race.size.charAt(0)} />
			<Item
				xs={4}
				label="Proficient"
				value={profBonus}
			/>
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
		<ProficienciesList {...proficiencies} profBonus={profBonus} />
	</div>
);

// abilties are Abilities

const ProfParagraph = ({list, label}) => (
	<p>
		<em>{list.length ? label : ''} </em>
		{(typeof list === 'object') ? list.toString() : list}
	</p>
)

const ProficienciesList = ({ languages = [], armor = [], weapons = [], tools = [], profBonus, doubleTools = []  }) => (
	<div className="description">
		<p className="title-sm">Proficiencies</p>
		<ProfParagraph label="Languages" list={languages.join ? languages.join(", ") : languages} />
		<ProfParagraph label="Armor" list={armor.join ? armor.join(", ") : armor} />
		<ProfParagraph label="Weapons" list={weapons.join ?  weapons.join(", ") :  weapons} />
		<ProfParagraph label="Tools" list={toolsToString(tools, doubleTools, profBonus)} />
	</div>
);

function toolsToString(tools = [], doubleTools = [], profBonus){
	if(!tools.forEach) return tools.toString();

	let toolsStr = "";
	tools.forEach((tool, i) => {
		if(!tool.length) return;
		
		toolsStr+= tool+" ";
		if(doubleTools.includes(tool))
			toolsStr += "+"+parseInt(profBonus,10)*2;
		else
			toolsStr += profBonus;
		if(i !== tools.length-1) toolsStr+=", ";
	});
	return toolsStr;
}

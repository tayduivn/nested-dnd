import React from "react";

function getSkillList(arr = []) {
	if(!arr.map) return null;
	
	return arr.map(function(skill) {
		return (
			<tr key={skill.name}>
				<td>
					{skill.printMod}
				</td>
				<td>
					{skill.name} {skill.proficient ? "   ●" : ""}{skill.double ? "●" : ""}
				</td>
			</tr>
		);
	});
}

const Skills = ({skills, initiative}) => (
	<div className="">
		<div className="passives">
			<div className="item">
				{initiative}
				<label>Initiative</label>
			</div>
		</div>
		<table id="abilityScores">
			<tbody>
				{getSkillList(skills)}
			</tbody>
		</table>
	</div>
);

const Abilities = ({ abilities: a = {} }) => (
	<div className="row no-padding" id="stats">
		<Ability {...a.str} label="Strength" />
		<Ability {...a.dex} label="Dexterity" />
		<Ability {...a.con} className="constitution"  label="Constitution" />
		<Ability {...a.int} label="Intelligence" />
		<Ability {...a.wis} label="Wisdom" />
		<Ability {...a.cha} label="Charisma" />
	</div>
);


const Ability = ({printMod, saveProficient, printSave, className, label}) => (
	<div className={"col stat-wrap "+className}>
		<div className="stat">
			<label>{label}</label>
			<h1>
				{printMod}
			</h1>
			<p>
				{saveProficient ? "save " + printSave : <br />}
			</p>
		</div>
	</div>
);

const HitDice = ({value, count}) => (
	<div>
		<label>hit dice </label>&nbsp;&nbsp;
		<strong>d{value}</strong>
		<span className="circles">
			&nbsp;{"❍".repeat(count)}
		</span>
	</div>
);

const Health = ({hitDice = [], hp}) => (
	<div className="row" id="health">
		<div className="col-8">
			<div className="row" id="hp">
				<div className="col-8 no-padding">
					<label>
						<i className="fa fa-heart" /> Current HP
					</label>
				</div>
				<div className="col-4">
					<label>Max</label>
					<h1>
						{hp}
					</h1>
				</div>
			</div>
			<div id="hit-dice">
				{hitDice.map((hd, i) =>
					<HitDice key={i} {...hd} />
				)}
			</div>
		</div>
		<div className="col-4" id="death-saves">
			<label>Death Saves</label>
			<p>
				success<br />
				<span className="circles">❍❍❍</span>
			</p>
			<p>
				fail<br />
				<span className="circles">❍❍❍</span>
			</p>
		</div>
	</div>
);

export { Skills, Abilities, Health };
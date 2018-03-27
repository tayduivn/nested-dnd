import React, { Component } from "react";
import PropTypes from "prop-types";


function getSkillList(arr) {
	return arr.map(function(skill) {
		return (
			<tr key={skill.name}>
				<td>
					{skill.getMod()}
				</td>
				<td>
					{skill.name} {skill.proficient ? "   ●" : ""}
				</td>
			</tr>
		);
	});
}

const Skills = ({skills}) => (
	<div className="">
		<div className="passives">
			<div className="item">
				{skills.getInitiative()}
				<label>Initiative</label>
			</div>
		</div>
		<table id="abilityScores">
			<tbody>
				{getSkillList(skills.getList())}
			</tbody>
		</table>
	</div>
);

const Abilities = ({ abilities: a }) => (
	<div className="row" id="stats">
		<div className="col no-padding">
			<Ability ability={a.Strength} label="Strength" />
			<Ability ability={a.Dexterity} label="Dexterity" />
			<Ability className="constitution" ability={a.Constitution} label="Constitution" />
		</div>
		<div className="col no-padding">
			<Ability ability={a.Intelligence} label="Intelligence" />
			<Ability ability={a.Wisdom} label="Wisdom" />
			<Ability ability={a.Charisma} label="Charisma" />
		</div>
	</div>
);


const Ability = ({ability: a, className, label}) => (
	<div className={"col-4 stat-wrap "+className}>
		<div className="stat">
			<label>{label}</label>
			<h1>
				{a.printMod()}
			</h1>
			<p>
				{a.save.proficient ? "save " + a.printSave() : <br />}
			</p>
		</div>
	</div>
);

const HitDice = ({dice, level}) => (
	<div>
		<label>hit dice </label>&nbsp;&nbsp;
		<strong>d{dice}</strong>
		<span className="circles">
			&nbsp;{"❍".repeat(level)}
		</span>
	</div>
);

const Health = ({hitDice, hp}) => (
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
				{hitDice.map(({ dice, level }, i) =>
					<HitDice key={i} dice={dice} level={level} />
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
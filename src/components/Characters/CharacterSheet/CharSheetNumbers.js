import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";

export class Skills extends Component {
	getSkillList(arr) {
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
	render() {
		var skills = this.props.skills;
		return (
			<div className="">
				<div className="passives">
					<div className="item">
						{skills.getInitiative()}
						<label>Initiative</label>
					</div>
				</div>
				<table id="abilityScores">
					<tbody>
						{this.getSkillList(skills.getList())}
					</tbody>
				</table>
			</div>
		);
	}
}

export class Abilities extends Component {
	render() {
		var a = this.props.abilities;
		return (
			<Row id="stats">
				<Col xs={6} className="no-padding">
					<Ability ability={a.Strength} label="Strength" />
					<Ability ability={a.Dexterity} label="Dexterity" />
					<Ability className="constitution" ability={a.Constitution} label="Constitution" />
				</Col>
				<Col xs={6} className="no-padding">
					<Ability ability={a.Intelligence} label="Intelligence" />
					<Ability ability={a.Wisdom} label="Wisdom" />
					<Ability ability={a.Charisma} label="Charisma" />
				</Col>
			</Row>
		);
	}
}

class Ability extends Component {
	render() {
		const a = this.props.ability;
		return (
			<Col xs={4} className={"stat-wrap "+this.props.className}>
				<div className="stat">
					<label>
						{this.props.label}
					</label>
					<h1>
						{a.printMod()}
					</h1>
					<p>
						{a.save.proficient ? "save " + a.printSave() : <br />}
					</p>
				</div>
			</Col>
		);
	}
}

class HitDice extends Component {
	render() {
		return (
			<div>
				<label>hit dice </label>&nbsp;&nbsp;
				<strong>d{this.props.dice}</strong>
				<span className="circles">
					&nbsp;{"❍".repeat(this.props.level)}
				</span>
			</div>
		);
	}
}

export class Health extends Component {
	static get propTypes() {
		return {
			hitDice: PropTypes.arrayOf(
				PropTypes.shape({
					dice: PropTypes.number,
					level: PropTypes.number
				})
			),
			hp: PropTypes.number
		};
	}
	render() {
		return (
			<Row id="health">
				<Col xs={8}>
					<Row id="hp">
						<Col xs={8} className="no-padding">
							<label>
								<i className="fa fa-heart" /> Current HP
							</label>
						</Col>
						<Col xs={4}>
							<label>Max</label>
							<h1>
								{this.props.hp}
							</h1>
						</Col>
					</Row>
					<div id="hit-dice">
						{this.props.hitDice.map(({ dice, level }, i) =>
							<HitDice key={i} dice={dice} level={level} />
						)}
					</div>
				</Col>
				<Col xs={4} id="death-saves">
					<label>Death Saves</label>
					<p>
						success<br />
						<span className="circles">❍❍❍</span>
					</p>
					<p>
						fail<br />
						<span className="circles">❍❍❍</span>
					</p>
				</Col>
			</Row>
		);
	}
}

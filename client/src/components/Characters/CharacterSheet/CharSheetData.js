import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";

import {
	Body,
	Background,
	Proficiencies,
	ClassInfo
} from "../../../stores/Character";
import { Abilities } from "../../../stores/CharacterAbilities";

export class RolePlay extends Component {
	static get propTypes() {
		return {
			race: PropTypes.object, //shape is Race from classStore.js
			body: PropTypes.instanceOf(Body),
			abilities: PropTypes.instanceOf(Abilities),
			background: PropTypes.instanceOf(Background),
			profBonus: PropTypes.string,
			proficiencies: PropTypes.instanceOf(Proficiencies),
			col: PropTypes.number
		};
	}
	render() {
		return (
			<Col xs={this.props.col} className="close-col">
				<Row>
					<Item
						xs={12}
						label="Race"
						value={
							this.props.race.label && this.props.race.label.length
								? this.props.race.label
								: this.props.race.name
						}
					/>
					<Item
						xs={12}
						label="Background"
						value={
							this.props.background.name +
							" " +
							this.props.background.specialty
						}
					/>
					<Item
						xs={8}
						label="Start Coin"
						value={this.props.background.startingCoin}
					/>

					<Item xs={4} label="Speed" value={this.props.body.speed+" ft."} />
					<Item
						xs={8}
						label="Proficiency Bonus"
						value={this.props.profBonus}
					/>
					<Item xs={4} label="Size" value={this.props.race.size} />
				</Row>
				<Row>
					<Item xs={4} label="Eyes" value={this.props.body.eyes} />
					<Item xs={4} label="Skin" value={this.props.body.skin} />
					<Item xs={4} label="Hair" value={this.props.body.hair} />
				</Row>
				<Row>
					<Item xs={4} label="Age" value={this.props.body.age} />
					<Item
						xs={4}
						label="Height"
						value={this.props.body.height}
					/>
					<Item
						xs={4}
						label="Weight"
						value={this.props.body.weight}
					/>
				</Row>
				<BaseAbilityScores abilities={this.props.abilities} />
				<p>&nbsp;</p>
				<Row>
					<ProficienciesList
						proficiencies={this.props.proficiencies}
						profBonus={this.props.profBonus}
					/>
				</Row>
			</Col>
		);
	}
}

class BaseAbilityScores extends Component {
	static get propTypes() {
		return {
			abilities: PropTypes.instanceOf(Abilities)
		};
	}
	render() {
		return (
			<Row>
				<Col xs={6} className="no-padding">
					<Item
						xs={4}
						label="STR"
						value={this.props.abilities.Strength.getScore()}
					/>
					<Item
						xs={4}
						label="DEX"
						value={this.props.abilities.Dexterity.getScore()}
					/>
					<Item
						xs={4}
						label="CON"
						value={this.props.abilities.Constitution.getScore()}
					/>
				</Col>
				<Col xs={6} className="no-padding">
					<Item
						xs={4}
						label="INT"
						value={this.props.abilities.Intelligence.getScore()}
					/>
					<Item
						xs={4}
						label="WIS"
						value={this.props.abilities.Wisdom.getScore()}
					/>
					<Item
						xs={4}
						label="CHA"
						value={this.props.abilities.Charisma.getScore()}
					/>
				</Col>
			</Row>
		);
	}
}

class Subclass extends Component {
	static get propTypes() {
		return {
			subclasses: PropTypes.object
		};
	}
	render() {
		var jsx = [];
		for (var name in this.props.subclasses) {
			var list = this.props.subclasses[name];
			if (list.join) list = list.join(", ");

			jsx.push(
				<span key={name}>
					{name}: {list}
					<br />
				</span>
			);
		}
		return <p>{jsx}</p>;
	}
}

export class ShowWork extends Component {
	static get propTypes() {
		return {
			background: PropTypes.instanceOf(Background),
			classes: PropTypes.arrayOf(PropTypes.instanceOf(ClassInfo)),
			col: PropTypes.number
		};
	}
	subclasses(classes) {
		return classes.map(c => {
			var subclasses = [];
			for (var name in c.subclasses) {
				var list = c.subclasses[name];
				if (list.join) list = list.join(", ");

				subclasses.push(
					<span key={name}>
						{name}: {list}
						<br />
					</span>
				);
			}
			return subclasses;
		});
	}
	render() {
		var subclasses = this.subclasses(this.props.classes);
		return (
			<Col xs={this.props.col} className="close-col">
						<p className="title-sm">Personality Trait</p>
						<p>
							{this.props.background.personality}
						</p>
						<p className="title-sm">Ideal</p>
						<p>
							{this.props.background.ideal}
						</p>
						<p className="title-sm">Bond</p>
						<p>
							{this.props.background.bond}
						</p>
						<p className="title-sm">Flaw</p>
						<p>
							{this.props.background.flaw}
						</p>
					<Item
						className={subclasses.length ? "" : "hidden"}
						label="Subclasses"
						value={this.props.classes.map((c,i) =>
							<Subclass subclasses={c.subclasses} key={i} />
						)}
					/>
			</Col>
		);
	}
}

class ProficienciesList extends Component {
	static get propTypes() {
		return {
			proficiencies: PropTypes.instanceOf(Proficiencies),
			profBonus: PropTypes.string
		};
	}
	render() {

		// generate tools list so can include double proficiency bonus
		const TOOLS = this.props.proficiencies.tools;
		let toolsStr = "";
		TOOLS.list.forEach((tool, i) => {
			if(!tool.length) return;
			
			toolsStr+= tool+" ";
			if(TOOLS.double_proficiency.includes(tool))
				toolsStr += "+"+parseInt(this.props.profBonus,10)*2;
			else
				toolsStr += this.props.profBonus;
			if(i !== TOOLS.list.length-1) toolsStr+=", ";
		});


		return (
			<div>
				<Col xs={12} className="description">
					<p className="title-sm">Proficiencies</p>
					<p>
						<em>Languages: </em>
						{this.props.proficiencies.languages.list.join(", ")}
					</p>
					<p>
						{this.props.proficiencies.armor.list.length
							? <em>Armor: </em>
							: ""}
						{this.props.proficiencies.armor.list.join(", ")}
					</p>
					<p>
						{this.props.proficiencies.weapons.list.length
							? <em>Weapons: </em>
							: ""}
						{this.props.proficiencies.weapons.list.join(", ")}
					</p>
					<p>
						{this.props.proficiencies.tools.list.length
							? <em>Tools: </em>
							: ""}
						{toolsStr}
					</p>
				</Col>
			</div>
		);
	}
}

export class Item extends Component {
	static get propTypes() {
		return {
			xs: PropTypes.number,
			label: PropTypes.string
		};
	}
	render() {
		return (
			<Col xs={this.props.xs}>
				<p className="title-sm">
					{this.props.label}
				</p>
				<div className="item-entry">
					{this.props.value}
				</div>
			</Col>
		);
	}
}

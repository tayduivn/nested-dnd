import React, { Component } from "react";
import PropTypes from "prop-types";

import { Body, Background } from "../../../stores/CharRolePlay"
import { Proficiencies } from "../../../stores/CharMiddleCol"
import { Abilities } from "../../../stores/CharacterAbilities";
import { Item } from './CharSheetShowWork';

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
			<div className={`close-col col-${this.props.col}`}>
				<div className="row">
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
				</div>
				<div className="row">
					<Item xs={4} label="Eyes" value={this.props.body.eyes} />
					<Item xs={4} label="Skin" value={this.props.body.skin} />
					<Item xs={4} label="Hair" value={this.props.body.hair} />
				</div>
				<div className="row">
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
				</div>
				<BaseAbilityScores abilities={this.props.abilities} />
				<p>&nbsp;</p>
				<div className="row">
					<ProficienciesList
						proficiencies={this.props.proficiencies}
						profBonus={this.props.profBonus}
					/>
				</div>
			</div>
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
			<div className="row">
				<div xs={6} className="col no-padding">
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
				</div>
				<div xs={6} className="col no-padding">
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
				</div>
			</div>
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
			<div className="description">
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
			</div>
		);
	}
}



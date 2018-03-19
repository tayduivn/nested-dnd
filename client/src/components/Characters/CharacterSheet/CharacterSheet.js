import React, { Component } from "react";
import PropTypes from "prop-types";

import Spells, { SpellSlotsAndMoney } from "./CharSheetSpells.js";
import { Abilities, Skills, Health } from "./CharSheetNumbers.js";
import { AdvResist, Equipment } from "./CharSheetDesc.js";
import { RolePlay, ShowWork } from "./CharSheetData.js";

import Character from "../../../stores/Character";
import SpellcastingList from "../../../stores/Spellcasting";

import "./CharacterSheet.css";

const BREAK_TO_2COL = 18;
const BREAK_TO_2PAGE = 40;

export default class CharacterSheet extends Component {
	static get propTypes() {
		return {
			character: PropTypes.instanceOf(Character)
		};
	}
	static get defaultProps() {
		return {
			character: new Character()
		};
	}
	render() {
		return (
			<div id={this.props.character.name + "CharacterSheet"}>
				<SinglePage character={this.props.character} />
			</div>
		);
	}
}

class SinglePage extends Component {
	static get propTypes() {
		return {
			character: PropTypes.instanceOf(Character)
		};
	}
	render() {
		let char = this.props.character;
		let spellcasting = char.getSpellcasting();
		if(spellcasting.totalSpells === 0)
			spellcasting = false;

		let twoPages =
			spellcasting && spellcasting.totalSpells > BREAK_TO_2PAGE;
		return (
			<div>
				<div className="paper">
					<div className="row halfpage">
						<div className="col-4">
							<BasicInfo
								name={char.name}
								classes={char.classes}
								player={char.player}
							/>
							<Skills skills={char.getSkills()} />
						</div>
						<div className="col-8 full-height">
							<Abilities abilities={char.abilities} />
							<div className="row full-height main-content">
								<div className="col">
									<Health
										char={char}
										hitDice={char.getHitDice()}
										hp={char.getHP()}
									/>
									<AdvResist
										{...char.advResist}
										label="Advantages & Resistances"
										char={char}
									/>
									<AdvResist
										other={char.features}
										label="Features"
										char={char}
									/>
								</div>
								<div className="col top-col">
									<Equipment equipment={char.equipment} />
									<SpellSlotsAndMoney char={char} />
								</div>
							</div>
						</div>
					</div>
					<div
						className="row halfpage bottom"
						style={{ background: "url(css/img/" + char.img + ")" }}
					>
						<RolePlay
							col={spellcasting && !twoPages ? 3 : 4}
							race={char.race}
							body={char.body}
							abilities={char.abilities}
							background={char.background}
							profBonus={char.printProficiencyBonus()}
							proficiencies={char.proficiencies}
						/>
						<ShowWork
							col={spellcasting && !twoPages ? 4 : 8}
							char={char}
							background={char.background}
							classes={char.classes}
							proficiencies={char.proficiencies}
						/>
						{spellcasting && !twoPages
							? <SpellbookAllClasses
									col={5}
									spellcasting={char.getSpellcasting()}
								/>
							: ""}
					</div>
				</div>
				{spellcasting && twoPages
					? <div className="paper">
							<div className="row halfpage">
								<SpellbookAllClasses
									spellcasting={char.getSpellcasting()}
								/>
							</div>
						</div>
					: ""}
			</div>
		);
	}
}

class BasicInfo extends Component {
	static get propTypes() {
		return {
			name: PropTypes.string,
			player: PropTypes.string,
			classes: PropTypes.array
		};
	}
	static get defaultProps() {
		return {
			name: "",
			player: "",
			classes: []
		};
	}
	render() {
		return (
			<div>
				<h1 id="name">
					{this.props.name.length
						? this.props.name
						: "_______________________"}
				</h1>
				<h2 id="classLevel">
					{this.props.classes.map(
						c =>
							"Level " +
							c.level +
							" " +
							(c.label ? c.label : c.classData.name)
					)}
				</h2>
				{this.props.player.length
					? <p id="player" className="right">
							<label>Played by </label> {this.props.player}
						</p>
					: <p id="player" className="write-in">
							Player Name
						</p>}
			</div>
		);
	}
}

class SpellbookAllClasses extends Component {
	static get propTypes() {
		return {
			spellcasting: PropTypes.instanceOf(SpellcastingList).isRequired,
			col: PropTypes.number
		};
	}
	render() {
		if (!this.props.spellcasting.list.length) return null;
		const COUNT = this.props.spellcasting.totalSpells;

		return (
			<div className={`close-col col-${this.props.col} 
									${COUNT > BREAK_TO_2PAGE
																			? "fullpage"
																			: COUNT > BREAK_TO_2COL ? "long" : ""}
								`}
			>
				{this.props.spellcasting.list.map((a, i) =>
					<Spells key={i} {...a} count={COUNT} />
				)}
			</div>
		);
	}
}

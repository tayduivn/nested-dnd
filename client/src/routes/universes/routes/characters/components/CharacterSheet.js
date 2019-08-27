import React, { Component } from "react";
import PropTypes from "prop-types";

import Spells, { SpellSlotsAndMoney } from "./CharSheetSpells.js";
import { Abilities, Skills, Health } from "./CharSheetNumbers.js";
import { AdvResist, Equipment } from "./CharSheetDesc.js";
import { RolePlay } from "./CharSheetData.js";
import ShowWork from "./CharSheetShowWork";

import "./CharacterSheet.scss";

const BREAK_TO_2COL = 18;
const BREAK_TO_2PAGE = 40;

export default class CharacterSheet extends Component {
	static get propTypes() {
		return {
			character: PropTypes.object
		};
	}
	static get defaultProps() {
		return {
			character: {}
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

const TopHalf = ({ char }) => (
	<div className="row halfpage">
		<div className="col-4">
			<BasicInfo name={char.name} classes={char.classes} player={char.player} />
			<Skills skills={char.skills} initiative={char.initiative} />
		</div>
		<div className="col-8 full-height">
			<Abilities abilities={char.abilities} />
			<div className="row full-height main-content">
				<div className="col">
					<Health char={char} hitDice={char.hitDice} hp={char.hp} />
					<AdvResist {...char.advResist} label="Advantages & Resistances" char={char} />
					<AdvResist other={char.features} label="Features" char={char} />
				</div>
				<div className="col top-col">
					<Equipment {...char.equipment} />
					<SpellSlotsAndMoney {...char} />
				</div>
			</div>
		</div>
	</div>
);

const BottomHalf = ({ char, spellcasting, twoPages }) => (
	<div className="row halfpage bottom" style={{ background: "url(css/img/" + char.img + ")" }}>
		<RolePlay
			col={spellcasting && !twoPages ? 3 : 4}
			race={char.race}
			body={char.body}
			abilities={char.abilities}
			background={char.background}
			profBonus={char.printProficiencyBonus}
			proficiencies={char.proficiencies}
		/>
		<ShowWork
			col={spellcasting && !twoPages ? 4 : 8}
			char={char}
			background={char.background}
			classes={char.classes}
			proficiencies={char.proficiencies}
		/>
		{spellcasting && !twoPages ? <SpellbookAllClasses col={5} spellcasting={spellcasting} /> : ""}
	</div>
);

class SinglePage extends Component {
	static get propTypes() {
		return {
			character: PropTypes.object
		};
	}
	render() {
		let char = this.props.character;
		let spellcasting = char.spellcasting;
		if (!spellcasting || spellcasting.totalSpells === 0) spellcasting = false;

		let twoPages = spellcasting && spellcasting.totalSpells > BREAK_TO_2PAGE;
		return (
			<div>
				<div className="paper">
					<TopHalf char={char} />
					<BottomHalf char={char} spellcasting={spellcasting} twoPages={twoPages} />
				</div>
				{spellcasting && twoPages ? (
					<div className="paper">
						<div className="row halfpage">
							<SpellbookAllClasses spellcasting={char.spellcasting} />
						</div>
					</div>
				) : (
					""
				)}
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
					{this.props.name.trim().length ? this.props.name.trim() : "_____________________"}
				</h1>
				<h2 id="classLevel">
					{this.props.classes.map(c => "Level " + c.level + " " + (c.label ? c.label : c.name))}
				</h2>
				{this.props.player.length ? (
					<p id="player" className="right">
						<label>Played by </label> {this.props.player}
					</p>
				) : (
					<p id="player" className="write-in">
						Player Name
					</p>
				)}
			</div>
		);
	}
}

class SpellbookAllClasses extends Component {
	static get propTypes() {
		return {
			spellcasting: PropTypes.object.isRequired,
			col: PropTypes.number
		};
	}
	render() {
		var spellcasting = this.props.spellcasting || { list: [] };
		if (!spellcasting.list.length) return null;
		const COUNT = spellcasting.totalSpells;

		return (
			<div
				className={`close-col col-${this.props.col}
									${COUNT > BREAK_TO_2PAGE ? "fullpage" : COUNT > BREAK_TO_2COL ? "long" : ""}
								`}
			>
				{spellcasting.list.map((a, i) =>
					a.spells.length === 0 ? null : <Spells key={i} {...a} count={COUNT} />
				)}
			</div>
		);
	}
}

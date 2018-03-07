import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";


class SpellSlots extends Component {
	getSpellSlots(slots = []) {
		return slots.map(function(slots, level) {
			if (!slots || slots === 0 || level === 0) {
				return <span key={level} />;
			}
			var circ = "❍".repeat(slots);
			return (
				<p key={level}>
					level {level} &nbsp;&nbsp;<span className="circles">{circ}</span>
				</p>
			);
		});
	}
	renderDC(list){
		if(list.length !== 1)
			return <span></span>;
		return (
			<div id="dc" className="icon-container">
				<label>DC</label>
				<h1>
					{list[0].spellcasting.dc}
				</h1>
			</div>
		);
	}
	render() {
		var spellcasting = this.props.spellcasting;
		if (spellcasting.list.length === 0) return <span />;

		return (
			<div>
				<p className="title">Spell Slots</p>
				{this.renderDC(spellcasting.list)}
				<div id="spell-slots">
					{this.getSpellSlots(spellcasting.getSlots())}
				</div>
			</div>
		);
	}
}

class Ki extends Component {
	render() {
		return (
			<div>
				<p className="title">Ki Points</p>
				<div id="dc" className="icon-container">
					<label>DC</label>
					<h1>
						{this.props.dc}
					</h1>
				</div>
				<div id="spell-slots">
					<span className="circles">{"❍".repeat(this.props.count)}</span>
				</div>
			</div>
		);
	}
}

export class SpellSlotsAndMoney extends Component {
	render() {
		var char = this.props.char;

		let monk = char.getClass("Monk");
		let monkDC = 8+char.getProficiencyBonus()+char.abilities.Wisdom.getMod();

		return (
			<div id="spellsAndMoney" className="pin-bottom">
				<SpellSlots spellcasting={char.spellcasting} />
				{ (monk && monk.level >= 2) ? <Ki count={monk.level} dc={monkDC} /> : ""}
				<div id="money" className="row">
					<div className="col-xs-3">
						<label>platium</label>
					</div>
					<div className="col-xs-3">
						<label>galleon</label>
					</div>
					<div className="col-xs-3">
						<label>sickle</label>
					</div>
					<div className="col-xs-3">
						<label>knut</label>
					</div>
				</div>
			</div>
		);
	}
}

export default class Spells extends Component {
	/**
	  * @param {[KnownSpell]} spellsByLevel
	  */
	spellbook(spellsByLevel, prepares, canCastUnpreppedRituals) {
		return spellsByLevel.map(function(spellArr, i) {
			spellArr = spellArr.map(function(spell, index) {
				return (
					<li key={"spell" + index}>
						{spell.getData().namegen}
						{spell.getData().ritual && canCastUnpreppedRituals
							? <i className="i-ritual" />
							: ""}{" "}
						{spell.note}
						{prepares && spell.prepared ? "●" : ""}
					</li>
				);
			});
			return (
				<ul key={"level" + i}>
					<li>
						<strong>
							Level {i}
						</strong>
					</li>{" "}
					{spellArr}
				</ul>
			);
		});
	}
	render() {
		const spellcasting = this.props.spellcasting;

		if (spellcasting.totalSpells === 0) return <span />;

		return (
			<Row className="push-top">
				<Col
					xs={this.props.prepares ? 6 : 8}
					className="title-tag left"
				>
					<p className="title">
						{this.props.title}
					</p>
					<label>
						{spellcasting.ritual_cast
							? <span>
									<i className="i-ritual" />Ritual Casting
								</span>
							: ""}
					</label>
				</Col>
				<Col xs={2} className="title-tag">
					<p>
						{spellcasting.printAbility()}
					</p>
					<label>Ability</label>
				</Col>
				<Col xs={2} className="title-tag">
					<p className="num">
						{spellcasting.dc}
					</p>
					<label>DC</label>
				</Col>
				<Col
					xs={2}
					className={
						"title-tag " + (this.props.prepares ? "" : "hidden")
					}
				>
					<p className="num">
						{this.props.numPrepared}
					</p>
					<label>Prep ●</label>
				</Col>
				<div
					className="spellbook"
				>
					{this.spellbook(
						spellcasting.spellsByLevel(),
						this.props.prepares,
						spellcasting.source === "Wizard"
					)}
				</div>
			</Row>
		);
	}
}
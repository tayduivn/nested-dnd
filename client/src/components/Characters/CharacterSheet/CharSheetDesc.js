import React, { Component } from "react";
import PropTypes from "prop-types";

import Character, { Feature } from "../../../stores/Character";

export class AdvResist extends Component {
	static get propTypes() {
		return {
			advantages: PropTypes.arrayOf(PropTypes.string),
			resistances: PropTypes.arrayOf(PropTypes.string),
			other: PropTypes.arrayOf(PropTypes.instanceOf(Feature)),
			label: PropTypes.string
		};
	}
	static get defaultProps() {
		return {
			advantages: [],
			resistances: [],
			other: [],
			label: ""
		};
	}
	render() {
		let adv = this.props.advantages;
		let res = this.props.resistances;
		let features = this.props.other;

		if (!adv.length && !res.length && !features.length) return <span />;

		return (
			<div className="description">
				<p className="title">
					{this.props.label}
				</p>
				<p className={adv.length ? "" : "hidden"}>
					<strong>Advantage on</strong> {adv.join(", ")}
				</p>
				<p className={res.length ? "" : "hidden"}>
					<strong>Resistance to</strong> {res.join(", ")}
				</p>
				{features.map((f, i) =>
					<RenderFeature feature={f} key={i} char={this.props.char} />
				)}
			</div>
		);
	}
}

class RenderFeature extends Component {
	static get propTypes() {
		return {
			feature: PropTypes.instanceOf(Feature).isRequired,
			char: PropTypes.instanceOf(Character).isRequired
		};
	}
	render() {
		if (this.props.feature.desc === false) return <span />;
		return (
			<p>
				<strong>
					{this.props.feature.name}{" "}
				</strong>
				<span className="circles">
					{"❍".repeat(
						this.props.char.getFeatureUses(this.props.feature)
					)}
				</span>
				{this.props.char.getFeatureDesc(this.props.feature)}
			</p>
		);
	}
}

export class Equipment extends Component {
	render() {
		var e = this.props.equipment;
		return (
			<div id="equipment" className="description">
				<div id="ac" className="icon-container">
					<label>Armor</label>
					<h1>
						{e.getAC()}
					</h1>
					<h2>
						{e.hasShield ? e.getUnshieldedAC() : ""}
					</h2>
				</div>
				<p className="title">Equipment</p>
				<p>
					{e.armor ? e.armor.namegen : ''}
					{e.hasShield ? ", Shield" : ""}
				</p>
				<p>
					{e.weapons}
				</p>
				{e.containers.map((c, i) =>
					<Container key={i} container={c} />
				)}
			</div>
		);
	}
}

class Container extends Component {
	render() {
		if (typeof this.props.container === "string") {
			return (
				<p>
					{this.props.container}
				</p>
			);
		}
		return (
			<p>
				<em>{this.props.container.name ? this.props.container.name+": " : ""}</em>{" "}
				{this.props.container.content
					? this.props.container.content.join(", ")
					: ""}
			</p>
		);
	}
}

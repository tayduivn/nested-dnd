import React, { Component } from "react";
import PropTypes from "prop-types";

export class AdvResist extends Component {
	static get propTypes() {
		return {
			advantages: PropTypes.arrayOf(PropTypes.string),
			resistances: PropTypes.arrayOf(PropTypes.string),
			other: PropTypes.arrayOf(PropTypes.object),
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
				<p className="title">{this.props.label}</p>
				{adv.length ? (
					<p>
						<strong>Advantage on</strong> {adv.join(", ")}
					</p>
				) : null}
				{res.length ? (
					<p>
						<strong>Resistance on</strong> {res.join(", ")}
					</p>
				) : null}
				{features.map((f, i) => (
					<RenderFeature feature={f} key={i} char={this.props.char} />
				))}
			</div>
		);
	}
}

class RenderFeature extends Component {
	static get propTypes() {
		return {
			feature: PropTypes.object.isRequired
		};
	}
	render() {
		if (this.props.feature.desc === false) return <span />;
		return (
			<p>
				<strong>{this.props.feature.name} </strong>
				<span className="circles">{"❍".repeat(this.props.feature.uses)}</span>
				{this.props.feature.desc}
			</p>
		);
	}
}

const Equipment = ({
	ac,
	hasShield,
	unshieldedAC,
	armor = {},
	weapons,
	containers = []
}) => (
	<div id="equipment" className="description">
		<div id="ac" className="icon-container">
			<label>Armor</label>
			<h1>{ac}</h1>
			<h2>{hasShield ? unshieldedAC : ""}</h2>
		</div>
		<p className="title">Equipment</p>
		<p>
			{armor && armor.name ? armor.name + " Armor" : ""}
			{hasShield ? ", Shield" : ""}
		</p>
		<p>{weapons}</p>
		{containers.map((c, i) => (
			<Container key={i} container={c} />
		))}
	</div>
);

class Container extends Component {
	render() {
		if (!this.props.container.name) {
			return <p>{this.props.container.content.join(", ")}</p>;
		}
		return (
			<p>
				<em>
					{this.props.container.name ? this.props.container.name + ": " : ""}
				</em>{" "}
				{this.props.container.content
					? this.props.container.content.join(", ")
					: ""}
			</p>
		);
	}
}

export { Equipment };

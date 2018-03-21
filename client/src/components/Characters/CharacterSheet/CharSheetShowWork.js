import React, { Component } from "react";
import PropTypes from "prop-types";

import { ClassInfo } from "../../../stores/CharRolePlay"
import { Background } from "../../../stores/CharRolePlay"

export default class ShowWork extends Component {
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
			<div className={`close-col col-${this.props.col}`}>
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
			</div>
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

export const Item = ({ xs, label, value}) => (
	<div className={"col-"+(xs ? xs : 4)}>
		<p className="title-sm">
			{label}
		</p>
		<div className="item-entry">
			{value}
		</div>
	</div>
);
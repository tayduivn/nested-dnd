import React from "react";
import PropTypes from "prop-types";

import colors, { colorOrder } from "util/colors";

import "./ColorPicker.scss";

class ColorRow extends React.PureComponent {
	render() {
		const { name, color } = this.props;

		return (
			<div className="row no-gutters">
				{Object.keys(colors[name]).map((variant, j) => {
					const cnTransformed = "bg-" + name + "-" + variant;
					const hex2 = colors[name][variant];
					const isSelected =
						typeof color === "string"
							? hex2.toUpperCase() === (color && color.toUpperCase())
							: false;
					const selected = isSelected ? " selected" : "";
					const cls = `col sample ${cnTransformed} ${selected}`;
					return <div key={j} className={cls} data-class={cnTransformed} data-hex={hex2} />;
				})}
				{Array(15 - Object.keys(colors[name]).length)
					.fill(null)
					.map((h, k) => (
						<div key={k} className="col sample">
							&nbsp;
						</div>
					))}
			</div>
		);
	}
}

export default function ColorPicker({ color }) {
	return (
		<div className="colorPicker">
			{colorOrder.map((name, i) => (
				<ColorRow key={i} {...{ name, i, color }} />
			))}
		</div>
	);
}

ColorPicker.propTypes = {
	color: PropTypes.string
};

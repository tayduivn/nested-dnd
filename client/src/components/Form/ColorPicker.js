import React from "react";

import colors, { colorOrder } from "../../colors";

import "./ColorPicker.css";

class ColorRow extends React.PureComponent {
	render() {
		const { name, hex } = this.props;

		return (
			<div className="row no-gutters">
				{Object.keys(colors[name]).map((variant, j) => {
					const cnTransformed = "bg-" + name + "-" + variant;
					const hex2 = colors[name][variant];
					const isSelected = hex2.toUpperCase() === (hex && hex.toUpperCase());
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

class ColorPicker extends React.PureComponent {
	render() {
		const { hex } = this.props;
		return (
			<div className="colorPicker">
				{colorOrder.map((name, i) => (
					<ColorRow key={i} {...{ name, i, hex }} />
				))}
			</div>
		);
	}
}

export { ColorPicker };

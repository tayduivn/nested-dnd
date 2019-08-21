import React from "react";
import SVG from "react-inlinesvg";

class SVGWrap extends React.PureComponent {
	render() {
		const { part1, part2, inlinesvg, className } = this.props;
		return inlinesvg ? (
			<span className={`icon animated infinite ${part2} ${part1} ${className}`}>
				<SVG
					alt={`/icons/${part1}.svg`} //for debugging
					src={`/icons/${part1}.svg`}
				/>
			</span>
		) : (
			<img
				className={`icon animated infinite ${part2} ${part1} ${className}`}
				alt={`/icons/${part1}.svg`} //for debugging
				src={`/icons/${part1}.svg`}
			/>
		);
	}
}

class Icon extends React.PureComponent {
	determineCategory() {
		let name = this.props.name || "";
		let displayName = name.trim();
		let parts = displayName.split(" ");
		let category = "icon";
		let value = name;
		let animation = "";

		if (parts[0] === "svg" || displayName.startsWith("fa")) {
			category = "icon";
			value = displayName;
		} else if (parts[0] === "text") {
			category = "char";
			value = parts[1];
		} else if (displayName && displayName.length && displayName !== "undefined") {
			category = "img";
			value = displayName;
		}
		return { c: category, v: value, a: animation };
	}

	_getProps() {
		let { name = false, category, alignment = "", inlinesvg, className = "" } = this.props;
		let value = name;
		if (!category) {
			let { c, v } = this.determineCategory();
			category = c;
			value = v;
		}
		const parts = value.split(" ");
		className += ` --${category}`;
		return { name, category, alignment, inlinesvg, className, value, parts };
	}

	render() {
		const { name, category, alignment, inlinesvg, className, value, parts } = this._getProps();
		if (!name || !name.trim || !name.split) return null;

		if (category === "icon") {
			if (value.startsWith("svg"))
				return (
					<SVGWrap {...{ alignment, inlinesvg, className, part1: parts[1], part2: parts[2] }} />
				);
			else if (!value.startsWith("fa"))
				return (
					<SVGWrap {...{ alignment, inlinesvg, className, part1: parts[0], part2: parts[1] }} />
				);
			else return <i className={`icon animated infinite ${value} ${alignment} ${className}`} />;
		} else if (category === "char") {
			return <div className={`icon text ${className}`}>{value}</div>;
		} else if (category === "img") {
			return <div className={`icon ${className}`} style={{ backgroundImage: `url(${name})` }} />;
		} else if (category === "video") {
			return <i className={`icon fas fa-play-circle ${className}`} />;
		}
	}
}

export default Icon;

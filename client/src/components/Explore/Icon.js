import React from "react";
import SVG from "react-inlinesvg";

class SVGWrap extends React.PureComponent {
	render() {
		const { alignment, fadeIn, part1, part2, inlinesvg } = this.props;
		return (
			<span className={alignment + (fadeIn ? " animated fadeIn" : "")}>
				{inlinesvg ? (
					<SVG
						className={`icon animated infinite ${part2} ${part1}`}
						alt={`/icons/${part1}.svg`} //for debugging
						src={`/icons/${part1}.svg`}
					/>
				) : (
					<img
						className={`icon animated infinite ${part2} ${part1}`}
						alt={`/icons/${part1}.svg`} //for debugging
						src={`/icons/${part1}.svg`}
					/>
				)}
			</span>
		);
	}
}

class Icon extends React.PureComponent {
	determineCategory() {
		let displayName = this.props.name.trim();
		let parts = displayName.split(" ");
		let category = "icon";
		let value = this.props.name;
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
	render() {
		let { name = false, category, alignment = "", fadeIn, inlinesvg } = this.props;

		if (!name || !name.trim || !name.split) return null;

		let value = name;
		if (!category) {
			let { c, v } = this.determineCategory();
			category = c;
			value = v;
		}

		if (category === "icon") {
			if (value.startsWith("svg "))
				return (
					<SVGWrap
						{...{ alignment, fadeIn, inlinesvg }}
						part1={value.split(" ")[1]}
						part2={value.split(" ")[2]}
					/>
				);
			else return <i className={"icon animated infinite " + value + " " + alignment} />;
		} else if (category === "char") {
			return <div className="icon text">{value}</div>;
		} else if (category === "img") {
			return <div className="icon" style={{ backgroundImage: `url(${name})` }} />;
		} else return <span className="icon" />;
	}
}

export default Icon;

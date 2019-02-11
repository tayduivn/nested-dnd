import React from "react";
import SVG from "react-inlinesvg";

class SVGWrap extends React.PureComponent {
	render() {
		const { alignment, fadeIn, part1, part2 } = this.props;
		return (
			<span className={alignment + (fadeIn ? " animated fadeIn" : "")}>
				<SVG
					className={`icon animated infinite ${part2} ${part1}`}
					alt={`/icons/${part1}.svg`} //for debugging
					src={`/icons/${part1}.svg`}
					cacheGetRequests={true}
					preloader={<span />}
				/>
			</span>
		);
	}
}

class Icon extends React.PureComponent {
	render() {
		const { name = false, alignment = "", fadeIn } = this.props;

		if (!name || !name.trim || !name.split) return null;
		let displayName = name.trim();
		var parts = name.split(" ");
		if (parts[0] === "svg") {
			displayName = displayName.substr(4);
			return <SVGWrap {...{ alignment, fadeIn }} part1={parts[1]} part2={parts[2]} />;
		} else if (parts[0] === "text") {
			return <div className="icon text">{parts[1]}</div>;
		} else if (displayName.startsWith("fa")) {
			return <i className={"icon animated infinite " + displayName + " " + alignment} />;
		} else if (displayName && displayName.length && displayName !== "undefined") {
			return <div className="icon" style={{ backgroundImage: `url(${name})` }} />;
		} else return <span className="icon" />;
	}
}

export default Icon;

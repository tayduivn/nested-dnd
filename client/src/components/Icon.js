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

function Icon({ name, kind, alignment, inlinesvg, className }) {
	if (!name || !name.trim || !name.split) return null;
	const parts = name.split(" ");
	switch (kind) {
		case "icon":
			if (name.startsWith("svg"))
				return (
					<SVGWrap {...{ alignment, inlinesvg, className, part1: parts[1], part2: parts[2] }} />
				);
			else if (!name.startsWith("fa"))
				return (
					<SVGWrap {...{ alignment, inlinesvg, className, part1: parts[0], part2: parts[1] }} />
				);
			else return <i className={`icon animated infinite ${name} ${alignment} ${className}`} />;
		case "char":
			return <div className={`icon text ${className}`}>{name}</div>;
		case "img":
			return <div className={`icon ${className}`} style={{ backgroundImage: `url(${name})` }} />;
		case "video":
			return <i className={`icon fas fa-play-circle ${className}`} />;
		default:
			return null;
	}
}

export default Icon;

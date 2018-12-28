import React from "react";
import Lottie from "react-lottie";
import worldLocations from "../../assets/lottiefiles/world_locations.json";

import IsASelect from "../Form/IsASelect";
import { Icon, Isa } from "./ExplorePage";

const CHILD_CLASSES = "child col-xl-2 col-lg-3 col-md-4 col-sm-4 col-xs-6 ";
const defaultOptions = {
	loop: true,
	autoplay: true,
	animationData: worldLocations,
	rendererSettings: {
		preserveAspectRatio: "xMinYMin meet",
		className: "lottie"
	}
};

const ChildInner = ({
	name,
	isa,
	in: inArr,
	transparentBG,
	highlight,
	cssClass,
	icon,
	txt,
	isNew,
	showAdd,
	generators,
	index,
	handleClick
}) => {
	const className = `child-inner d-flex align-items-center justify-content-center link ${cssClass} ${
		icon ? "" : " no-icon"
	}`;
	var style = {
		color: txt
	};
	if (transparentBG) style.background = "transparent";
	if (inArr) style.boxShadow = "0px 0px 5px " + highlight;

	return (
		<div
			className={className + (showAdd ? " showAdd" : "")}
			style={style}
			data-index={index}
		>
			<div className="wrap">
				{!isNew || !showAdd ? (
					<Icon name={icon} txt={name ? name : isa} />
				) : null}
				<h1>{name ? name : isa}</h1>
				<Isa name={name} isa={isa} />
				{isNew && showAdd ? (
					<IsASelect
						options={generators}
						autoFocus={true}
						openOnFocus={true}
						optionHeight={30}
						onNewOptionClick={handleClick}
						onChange={handleClick}
					/>
				) : null}
			</div>
		</div>
	);
};

class Child extends React.Component {
	render() {
		var {
			transparentBG,
			handleClick,
			handleDeleteLink,
			i,
			...child
		} = this.props;

		return (
			<div
				className={CHILD_CLASSES}
				style={{ transitionDelay: 30 * i + "ms" }}
				onClick={e => {
					if (!(child.isNew && child.showAdd)) handleClick(child, e);
				}}
			>
				{this.props.isLink ? (
					<div className="badge badge-pill badge-dark linkLabel">
						<Lottie width="150%" height="150%" options={defaultOptions} />
						<span> LINK</span>
					</div>
				) : null}
				<ChildInner {...this.props} transparentBG={transparentBG} />
				{this.props.isLink ? (
					<button
						className="deleteLink btn btn-danger fadeIn animated"
						onClick={e => {
							e.stopPropagation();
							handleDeleteLink(child.index);
						}}
					>
						<i className="fa fa-trash-alt" />
					</button>
				) : null}
			</div>
		);
	}
}

export default Child;

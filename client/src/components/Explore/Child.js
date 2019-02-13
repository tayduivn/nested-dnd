import React from "react";
import Lottie from "react-lottie";
import worldLocations from "../../assets/lottiefiles/world_locations.json";

import IsASelect from "../Form/IsASelect";
import { Icon, Isa } from "./ExplorePage";

import "./Child.css";

const CHILD_CLASSES = "child col-xl-2 col-lg-3 col-md-4 col-sm-4 col-xs-6 ";

const ISA_SELECT_OPTIONS = {
	autoFocus: true,
	optionHeight: 30
};

const DEFAULT_OPTIONS = {
	loop: true,
	autoplay: true,
	animationData: worldLocations,
	rendererSettings: {
		preserveAspectRatio: "xMinYMin meet",
		className: "lottie"
	}
};

const className = (icon, showAdd, cssClass, isNew) =>
	`child-inner d-flex align-items-center justify-content-center link ${cssClass}
	 ${icon ? "" : " no-icon"} ${showAdd ? " showAdd" : ""} ${isNew ? "isNew" : ""}`;

const style = ({ in: inArr, transparentBG, highlight, txt }) => {
	var style = {
		color: txt
	};
	if (transparentBG) style.background = "transparent";
	if (inArr) style.boxShadow = "0px 0px 5px " + highlight;
	return style;
};

class ChildInner extends React.PureComponent {
	state = {
		showAdd: false
	};
	clickBox = e => {
		if (this.props.isNew) {
			e.preventDefault();
			this.setState({ showAdd: true });
		}
	};
	handleAddNew = () => {};
	hideAdd = () => {
		this.setState({ showAdd: false });
	};
	render() {
		const { name, isa, icon, isNew, index, style } = this.props;
		const { showAdd } = this.state;

		if (isNew) {
			return (
				<div className="isNew">
					<IsASelect {...ISA_SELECT_OPTIONS} hideAdd={this.hideAdd} />
				</div>
			);
		}
		return (
			<a
				className={className(icon, showAdd, this.props.cssClass, isNew)}
				style={style}
				href={`#${index}`}
				onClick={this.clickBox}
			>
				<div className="wrap">
					{!isNew && <Icon name={icon} txt={name ? name : isa} />}
					<h1>{name ? name : isa}</h1>
					<Isa name={name} isa={isa} />
				</div>
			</a>
		);
	}
}

class Child extends React.PureComponent {
	handleDeleteLink = e => {
		e.stopPropagation();
		this.props.handleDeleteLink(this.props.index);
	};
	render() {
		const { handleClick, i, isLink, highlight, generators, isNew, ...child } = this.props;
		return (
			<div
				className={CHILD_CLASSES}
				style={{ animationDelay: 50 * i + "ms" }}
				onClick={e => !(child.isNew && child.showAdd) && handleClick(child, e)}
			>
				{isLink ? (
					<a href={`#${child.index}`} className="badge badge-pill badge-dark linkLabel">
						<Lottie width="150%" height="150%" options={DEFAULT_OPTIONS} />
						<span> LINK</span>
					</a>
				) : null}
				<ChildInner
					{...{ ...child, handleClick, highlight, generators, isNew }}
					style={style(child)}
				/>
				{isLink ? (
					<button className="deleteLink btn btn-danger" onClick={this.handleDeleteLink}>
						<i className="fa fa-trash-alt" />
					</button>
				) : null}
			</div>
		);
	}
}

export default Child;

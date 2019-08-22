import React, { useCallback, useState } from "react";
import Lottie from "react-lottie";
import worldLocations from "../../assets/lottiefiles/world_locations.json";

import IsASelect from "../Form/IsASelect";
import { Icon, Isa } from "./ExplorePage";

const CHILD_CLASSES = "child col-xl-2 col-lg-3 col-md-4 col-sm-4 col-xs-6 ";

const ISA_SELECT_OPTIONS = {
	autoFocus: true,
	optionHeight: 30,
	className: "isa",
	classTextarea: "isa__addChild",
	placeholder: "✚",
	clearOnSubmit: true,
	allowCustom: true
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

const className = (icon = {}, showAdd, cssClass, isNew) =>
	`child-inner child-inner--link btn-${cssClass}
	 ${icon ? "" : " no-icon"} ${showAdd ? " showAdd" : ""} ${isNew ? "isNew" : ""}`;

const style = (hasInArr, highlight, txt, isUniverse) => {
	var style = {
		color: txt
	};
	if (hasInArr) style.boxShadow = "0px 0px 5px " + highlight;
	return style;
};

const EMPTY_OBJ = {};

const ChildInner = ({
	child: { name, isa, icon = EMPTY_OBJ, isNew, highlightColor, txt, cssClass, index, isLink },
	tweetDesc = "",
	hasInArr,
	isUniverse
}) => {
	const [showAdd, setShowAdd] = useState(false);

	const clickBox = useCallback(
		e => {
			if (isNew) {
				e.preventDefault();
				setShowAdd(true);
			}
		},
		[isNew]
	);

	const hideAdd = useCallback(() => {
		setShowAdd(false);
	}, []);

	if (isNew) {
		return (
			<div className="isNew bg-grey-50">
				<IsASelect {...ISA_SELECT_OPTIONS} hideAdd={hideAdd} />
			</div>
		);
	}
	return (
		<a
			className={className(icon, showAdd, cssClass, isNew)}
			style={style(hasInArr, highlightColor, txt, isUniverse)}
			href={`#${index}`}
			onClick={clickBox}
		>
			{!isNew && (
				<Icon
					{...{
						name: icon.value,
						category: icon.category,
						txt: name ? name : isa,
						inlinesvg: true,
						className: "child__icon"
					}}
				/>
			)}
			<div className="child__header">
				<h1 className="child__title">
					{isLink ? (
						<>
							<a href={`#${index}`} className="badge badge-pill badge-dark linkLabel">
								<Lottie width="150%" height="150%" options={DEFAULT_OPTIONS} />
								<i class="fas fa-external-link-alt"></i>
							</a>
							<span class="linkLabel__spacer"></span>
						</>
					) : null}

					{name ? name : isa}
				</h1>
				<Isa name={name} isa={isa} />
			</div>
			{tweetDesc ? <p className="child__desc">{tweetDesc.substr(0, 140)}</p> : null}
		</a>
	);
};

const Child = ({
	hasInArr,
	tweetDesc,
	handleAdd,
	handleDeleteLink: handleDeleteLinkUp,
	child,
	i
}) => {
	const handleDeleteLink = useCallback(
		e => {
			e.stopPropagation();
			handleDeleteLinkUp(child.index);
		},
		[handleDeleteLinkUp, child.index]
	);

	return (
		<div className={CHILD_CLASSES} style={{ animationDelay: 50 * i + "ms" }}>
			<ChildInner
				{...{
					hasInArr,
					tweetDesc,
					handleAdd,
					handleDeleteLink,
					child
				}}
			/>
			{child.isLink ? (
				<button className="deleteLink btn btn-danger" onClick={handleDeleteLink}>
					<i className="fa fa-trash-alt" />
				</button>
			) : null}
		</div>
	);
};

export default Child;

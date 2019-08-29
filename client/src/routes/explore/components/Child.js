import React, { useCallback } from "react";
import Lottie from "react-lottie";

import Isa from "./Isa";
import Icon from "components/Icon";
import worldLocations from "assets/lottiefiles/world_locations";
import "./Child.scss";

export const CHILD_CLASSES = "child col-xl-2 col-lg-3 col-md-4 col-sm-4 col-xs-6 ";

const DEFAULT_OPTIONS = {
	loop: true,
	autoplay: true,
	animationData: worldLocations,
	rendererSettings: {
		preserveAspectRatio: "xMinYMin meet",
		className: "lottie"
	}
};

const className = (icon = {}, cls) =>
	`child-inner child-inner--link btn-${cls} ${icon ? "" : " no-icon"}`;

const style = (hasInArr, highlight, txt) => {
	var style = {
		color: txt
	};
	if (hasInArr) style.boxShadow = "0px 0px 5px " + highlight;
	return style;
};

const EMPTY_OBJ = {};

const ChildInner = ({
	child: { name, isa, icon = EMPTY_OBJ, highlightColor, txt, cls, n: index, isLink },
	tweetDesc = "",
	hasInArr,
	isUniverse
}) => (
	<a
		className={className(icon, cls)}
		style={style(hasInArr, highlightColor, txt, isUniverse)}
		href={`#${index}`}
	>
		<Icon
			{...{
				name: icon.value,
				kind: icon.kind,
				txt: name ? name : isa,
				inlinesvg: true,
				className: "child__icon"
			}}
		/>
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
		<div className={`${CHILD_CLASSES} fadeInChild`} style={{ animationDelay: 50 * i + "ms" }}>
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

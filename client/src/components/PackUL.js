import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import PackLink from "components/PackLink";

import Link from "components/Link";
import { loadFonts } from "store/fonts";
import styles from "./PackUL.module.scss";

const PackInput = ({ _id, name, txt, font, cssClass, description, selected, url, onSelect }) => (
	<li className={`col`}>
		<div className={styles.linkGroup}>
			<button
				{...{ onClick: onSelect, _id, style: { color: txt } }}
				className={`btn col btn-${cssClass}`}
			>
				<h1 className="webfont" style={{ fontFamily: font ? `'${font}', serif` : "inherit" }}>
					<span className={`fa-stack ${selected ? "selected" : ""}`}>
						<i className="fas fa-circle fa-2x" />
						<i className="fa fa-check fa-stack-1x" />
					</span>
					{name}
				</h1>
				{description ? <p>{description}</p> : null}
			</button>
			{url ? (
				<Link to={"/explore/" + url} className={`${styles.exploreButton} btn-${cssClass}`}>
					<h2>
						<i className="fas fa-eye" />
						<small>preview</small>
					</h2>
				</Link>
			) : null}
		</div>
	</li>
);

const EMPTY_ARRAY = [];

// Just a simple list of packs
const PackUL = ({ list = EMPTY_ARRAY, isUniverse, selected, onSelect, addButton, selectable }) => {
	const dispatch = useDispatch();

	// load fonts when there are new fonts
	useEffect(() => {
		var fonts = [];
		list.forEach((pack = {}) => {
			if (!pack.font) return;
			if (!fonts.includes(pack.font)) fonts.push(pack.font);
		});

		if (fonts.length) dispatch(loadFonts(fonts));
	}, [dispatch, list]);

	const to = `${isUniverse ? "/universes" : "/packs"}/create`;

	return (
		<ul className={styles.packUL}>
			{list.map((p = {}, i) => {
				return selectable ? (
					<PackInput key={p._id || i} {...p} selected={selected === p._id} onSelect={onSelect} />
				) : (
					<PackLink key={p._id || i} {...p} isUniverse={isUniverse} />
				);
			})}
			{addButton ? (
				<Link to={to} className={styles.addButton}>
					<span>
						<i className="fas fa-plus" /> Create new
					</span>
				</Link>
			) : null}
		</ul>
	);
};
export default PackUL;

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Link from "components/Link";
import { loadFonts } from "store/fonts";

const ADD_BUTTON_CLASSNAME =
	"create col btn btn-outline-dark d-flex align-items-center justify-content-center packlink";

const EDIT_BUTTON = (
	<h2>
		<i className="fas fa-pen-square" />
		<small>Edit</small>
	</h2>
);

const EDITBTN_CLS =
	"edit btn col-xs-auto d-flex align-items-center justify-content-center packlink__btn";

class PackLink extends React.PureComponent {
	render() {
		const { _id, name, url, title, txt, font, description, isUniverse } = this.props;
		const { dependencies, lastSaw, cls = "bg-grey-900" } = this.props;
		const URL = isUniverse ? `/universe/${_id}` : `/pack/${url}`;
		const style = { color: txt };
		return (
			<li className={`col`}>
				<div className="packlink btn-group">
					<Link to={`/explore${URL}`} className={`btn col packlink__btn btn-${cls}`}>
						<h1 style={{ fontFamily: font ? `'${font}', serif` : "inherit" }}>{title || name}</h1>
						{description && <p>{description}</p>}
						{isUniverse && dependencies && dependencies.length && (
							<p>
								<strong>Packs</strong>: {dependencies.join(", ")}
							</p>
						)}
						{lastSaw && (
							<p>
								<strong>Currently viewing:</strong> {lastSaw}
							</p>
						)}
					</Link>
					<Link to={`${URL}/edit`} className={`${EDITBTN_CLS} btn-${cls}`} style={style}>
						{EDIT_BUTTON}
					</Link>
				</div>
			</li>
		);
	}
}

const PackInput = ({ _id, name, txt, font, cls, description, selected, url, onSelect }) => (
	<li className={`col`}>
		<div className="packlink btn-group">
			<button
				{...{ onClick: onSelect, _id, style: { color: txt } }}
				className={`btn col btn-${cls}`}
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
				<Link to={"/explore/" + url} className={`explore btn col-xs-auto btn-${cls}`}>
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
		<ul className="row packs">
			{list.map((p = {}, i) => {
				return selectable ? (
					<PackInput key={p._id || i} {...p} selected={selected === p._id} onSelect={onSelect} />
				) : (
					<PackLink key={p._id || i} {...p} isUniverse={isUniverse} />
				);
			})}
			{addButton ? (
				<li className="col">
					<Link to={to} className={ADD_BUTTON_CLASSNAME}>
						<span>
							<i className="fas fa-plus" /> Create new
						</span>
					</Link>
				</li>
			) : null}
		</ul>
	);
};
export default PackUL;

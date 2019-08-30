import React from "react";

import { sendPlayersPreview } from "store/actions";
import Link from "components/Link";
import StyleOptions from "../components/StyleOptions";
import Icon from "components/Icon";
import Ancestors from "../components/Ancestors";
import Isa from "../components/Isa";
import SearchBar from "../components/SearchBar";
import Description from "../components/Description";
import debounce from "debounce";

import "./Title.scss";

const NOOP = () => {};
const CENTER_ALIGN = "d-flex align-items-center justify-content-center";

const className = (isUniverse, category = "icon") =>
	`title__iconWrap ${isUniverse ? "universe " : ""} --${category} ${CENTER_ALIGN}`;

const ShowToPlayers = ({ cls, setPreview }) => (
	<button className={`btn btn-${cls} btn-sm title__showBtn`} onClick={setPreview}>
		Show to players
	</button>
);

class IconButton extends React.PureComponent {
	setPreview = e => {
		e.stopPropagation();
		e.preventDefault();
		const i = this.props.icon;
		sendPlayersPreview({
			...i,
			src: i.value,
			hueOverlay: i.doHue ? this.props.cls : ""
		});
	};
	showModal = () => {
		this.props.toggleModal("ICON");
	};
	render() {
		const { isUniverse, icon = {}, txt, cls } = this.props;
		return (
			<div className={className(isUniverse, icon.category)}>
				{isUniverse ? (
					<>
						<button
							className={`title__iconBtn ${!icon ? "addNew" : ""} ${cls}`}
							style={{ color: txt }}
							onClick={this.showModal}
						>
							<Icon
								kind={icon.kind || "icon"}
								name={icon.value || "far fa-plus-square"}
								{...{ ...icon, inlinesvg: true, className: "title__icon" }}
							/>
						</button>
						{["img", "video"].includes(icon.category) ? (
							<ShowToPlayers {...{ cls, setPreview: this.setPreview }} />
						) : null}
					</>
				) : (
					<Icon
						{...{
							...icon,
							name: icon.value,
							inlinesvg: true,
							className: `${cls} title__icon`
						}}
					/>
				)}
			</div>
		);
	}
}

const ExploreBar = ({ handleRestart, pack_id, cls }) => (
	<div className="col-xs-auto right">
		<button onClick={handleRestart} className={`title__btn ${cls}`}>
			<i className="fa fa-undo-alt" /> <small>Start over</small>
		</button>
		<Link to={"/universes/create?pack=" + pack_id} className={`title__btn ${cls}`}>
			<i className="fas fa-save" /> <small>Save</small>
		</Link>
	</div>
);

function ButtonsBar({
	pack_id,
	isUniverse,
	current,
	handleChange,
	handleRestart,
	toggleModal,
	ancestors = []
}) {
	const { cls, color, highlight, index, txt, name, isa } = current;
	const parent = ancestors[0];
	return (
		<nav className="title__bar buttons-bar row">
			<Ancestors ancestors={ancestors} pageClass={cls} highlight={highlight} color={color} />
			{!isUniverse ? (
				<ExploreBar handleRestart={handleRestart} pack_id={pack_id} />
			) : (
				<StyleOptions
					{...{ index, cls, parent, txt, name, isa, fav: current.fav, highlight, color }}
					{...{ handleChange, toggleModal, handleRestart, pack_id }}
				/>
			)}
		</nav>
	);
}

class TheTitleComponent extends React.Component {
	constructor(props) {
		super(props);
		this.textareaRef = React.createRef();
		this.state = {
			title: props.name || props.isa
		};

		this.debouncedSave = debounce(props.handleChange, 500);
	}

	componentDidMount() {
		const textarea = this.textareaRef.current;
		let lineHeight = window.getComputedStyle(textarea).lineHeight;
		this.lineHeight = parseFloat(lineHeight.substring(0, lineHeight.length - 2));
		this.setHeight();
	}

	componentDidUpdate() {
		this.setHeight();
	}

	setHeight() {
		const textarea = this.textareaRef.current;
		let rows = Math.round(textarea.scrollHeight / this.lineHeight);
		if (rows === 0) rows = 1;
		textarea.rows = rows || 1;
	}

	handleChange = e => {
		const val = e.target.value;
		this.setState({ title: val });
		// about every half a second we'll push to the global state
		// so we don't trigger a bunch of rerenders
		this.debouncedSave({ name: val });
	};

	render() {
		const { name, font, txt, isa, isEditable } = this.props;
		const style = { color: txt };
		if (font) style.fontFamily = `'${font}', sans-serif`;

		return (
			<div className="title__header" style={style}>
				<textarea
					rows="1"
					ref={this.textareaRef}
					className="title__input webfont"
					value={this.state.title}
					disabled={!isEditable}
					onChange={this.handleChange}
				/>
				<Isa name={name} isa={isa} />
			</div>
		);
	}
}

export default function Title({
	current,
	pack_id,
	isUniverse,
	universe_id,
	ancestors,
	handleChange = NOOP,
	handleRestart = NOOP,
	font,
	toggleModal,
	highlight
}) {
	const { txt, index, cls, icon, desc = [], name, isa } = current;
	return (
		<div id="Title" className="col-lg">
			<div className="name mb-2 row">
				<IconButton {...{ isUniverse, cls, icon, txt, toggleModal }} />
				<TheTitleComponent
					key={index}
					{...{
						isEditable: isUniverse,
						index,
						universe_id,
						name,
						isa,
						ancestors,
						font,
						handleChange
					}}
				/>
			</div>
			<ButtonsBar
				{...{ pack_id, isUniverse, current, handleRestart, handleChange, ancestors, toggleModal }}
			/>
			{isUniverse || desc.length ? (
				<Description {...{ desc: desc.join("\n"), ...highlight, isUniverse, handleChange }} />
			) : null}
			{isUniverse && <SearchBar index={index} />}
		</div>
	);
}

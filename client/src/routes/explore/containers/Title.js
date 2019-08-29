import React from "react";

import { sendPlayersPreview } from "store";
import Link from "components/Link";

import HexColorPicker from "components/Form/HexColorPicker";
import Icon from "components/Icon";
import Ancestors from "../components/Ancestors";
import Isa from "../components/Isa";
import SearchBar from "../components/SearchBar";
import Description from "../components/Description";
import BGSelectPopover from "../components/BGSelectPopover";

import splitClass from "util/splitClass";
import "./Title.scss";

const CENTER_ALIGN = "d-flex align-items-center justify-content-center";
const COG_BUTTON_SETTINGS = {
	type: "button",
	id: "dropdownMenuButton",
	"data-toggle": "dropdown",
	"aria-haspopup": true,
	"aria-expanded": false
};

const SettingsCog = ({ cls, toggleData, packid, name, isa }) => {
	const location = `/packs/${packid}/generators`;
	return (
		<button className={`title__btn settings dropdown  ${cls}`}>
			<div {...COG_BUTTON_SETTINGS}>
				<i className="title__btn-icon fa fa-cog" />
			</div>

			<div
				className={`settings__menu dropdown-menu dropdown-menu-right ${cls}`}
				aria-labelledby="dropdownMenuButton"
			>
				<div className={"settings__item btn dropdown-item " + cls} onClick={toggleData}>
					edit data
				</div>

				<Link to={isa ? `${location}/${isa}/edit` : `${location}/create?isa=${name}`}>
					<div className={"settings__item btn dropdown-item " + cls}>
						{isa ? <span>edit {isa} generator</span> : <span>create {name} generator</span>}
					</div>
				</Link>

				<div
					className={"settings__item btn dropdown-item " + cls}
					data-toggle="modal"
					data-target="#moveModal"
				>
					move
				</div>
			</div>
		</button>
	);
};

class DeleteButton extends React.PureComponent {
	render() {
		const { handleRestart, cls } = this.props;
		return (
			<button className={`title__btn btn ${cls}`} onClick={handleRestart}>
				<i className="title__btn-icon far fa-trash-alt" />
			</button>
		);
	}
}

class FavoriteButton extends React.PureComponent {
	render() {
		const { cls, isFavorite, toggleFavorite } = this.props;
		return (
			<button className={`title__btn ${cls}`} onClick={toggleFavorite}>
				<i className={`title__btn-icon ${(isFavorite ? "fas" : "far") + " fa-star"}`} />
			</button>
		);
	}
}

class PatternButton extends React.PureComponent {
	render() {
		const { cls = "", bg = "" } = this.props;
		return (
			<button className={`title__btn ${bg}`} data-toggle="modal" data-target="#patternSelectModal">
				<div className={`pattern swatch`}>
					{cls.split(" ").length > 1 && <i className="fa fa-check" />}
				</div>
			</button>
		);
	}
}

class StyleOptions extends React.PureComponent {
	render() {
		const { highlight, handleChange, toggleData, handleRestart, packid, color } = this.props;
		const { index, cls, parent = {}, txt, name, isa, isFavorite, toggleFavorite } = this.props;
		const resetTxt = parent.txt;
		const resetColor = parentBG(parent);
		const { bg } = splitClass(cls);
		return (
			<div id="styleOptions" className={`title__btn-collection col-xs-auto right`}>
				<BGSelectPopover {...{ index, highlight, handleChange, resetTxt, resetColor, cls }} />
				<PatternButton cls={cls} bg={bg} />
				<HexColorPicker {...{ color, index, highlight, txt, handleChange, resetTxt, cls: bg }} />
				<FavoriteButton {...{ isFavorite, toggleFavorite, cls: bg }} />
				<SettingsCog {...{ toggleData, name, isa, packid, cls: bg }} />
				<DeleteButton handleRestart={handleRestart} cls={bg} />
			</div>
		);
	}
}
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
	render() {
		const { isUniverse, icon = {}, txt, cls } = this.props;
		return (
			<div className={className(isUniverse, icon.category)}>
				{isUniverse ? (
					<>
						<button
							className={`title__iconBtn ${!icon ? "addNew" : ""} ${cls}`}
							data-toggle="modal"
							data-target="#iconSelectModal"
							style={{ color: txt }}
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

const parentBG = (parent = {}) =>
	parent.cls && parent.cls.split(" ").find(c => c.startsWith("bg-"));

const ExploreBar = ({ handleRestart, packid, cls }) => (
	<div className="col-xs-auto right">
		<button onClick={handleRestart} className={`title__btn ${cls}`}>
			<i className="fa fa-undo-alt" /> <small>Start over</small>
		</button>
		<Link to={"/universes/create?pack=" + packid} className={`title__btn ${cls}`}>
			<i className="fas fa-save" /> <small>Save</small>
		</Link>
	</div>
);

function ButtonsBar({
	packid,
	isUniverse,
	current,
	isFavorite,
	toggleFavorite,
	handleChange,
	handleRestart,
	toggleData,
	ancestors = []
}) {
	const { cls, color, highlight, index, txt, name, isa } = current;
	const parent = ancestors[0];
	return (
		<nav className="title__bar buttons-bar row">
			<Ancestors ancestors={ancestors} pageClass={cls} highlight={highlight} color={color} />
			{!isUniverse ? (
				<ExploreBar handleRestart={handleRestart} packid={packid} />
			) : (
				<StyleOptions
					{...{ index, cls, parent, txt, name, isa, isFavorite, highlight, color }}
					{...{ handleChange, toggleData, handleRestart, toggleFavorite, packid }}
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
		// todo debounce
		this.props.handleChange("name", val);
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

const NOOP = () => {};
export default function Title({
	current,
	packid,
	isUniverse,
	favorites,
	universeId,
	ancestors,
	handleChange = NOOP,
	handleRestart = NOOP,
	toggleFavorite = NOOP,
	font
}) {
	const { txt, index, cls, icon, desc = [], highlightClass: highlight, name, isa } = current;
	return (
		<div id="Title" className="col-lg">
			<div className="name mb-2 row">
				<IconButton {...{ isUniverse, cls, icon, txt }} />
				<TheTitleComponent
					key={index}
					{...{
						isEditable: isUniverse,
						index,
						universeId,
						name,
						isa,
						ancestors,
						font,
						handleChange
					}}
				/>
			</div>
			<ButtonsBar
				{...{ packid, isUniverse, current }}
				{...{ handleRestart, handleChange, toggleFavorite, ancestors }}
			/>
			{isUniverse || desc.length ? (
				<Description {...{ desc: desc.join("\n"), highlight, isUniverse, handleChange }} />
			) : null}
			{isUniverse && <SearchBar favorites={favorites} index={index} />}
		</div>
	);
}

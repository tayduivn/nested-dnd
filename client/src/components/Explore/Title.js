import React from "react";
import { connect } from "react-redux";

import { sendPlayersPreview } from "../../actions/WebSocketAction";
import { Link } from "../Util";
import Ancestors from "./Ancestors";
import { HexColorPicker } from "../Form/HexColorPicker";
import { Icon, Isa } from "./ExplorePage";
import SearchBar from "./SearchBar";
import Description from "./Description";
import BGSelectPopover from "./BGSelectPopover";

import { changeInstance } from "./actions";
import { splitClass } from "../../util";

import "./Title.css";

const CENTER_ALIGN = "d-flex align-items-center justify-content-center";
const COG_BUTTON_SETTINGS = {
	type: "button",
	id: "dropdownMenuButton",
	"data-toggle": "dropdown",
	"aria-haspopup": true,
	"aria-expanded": false
};

const SettingsCog = ({ cssClass, toggleData, packid, name, isa }) => {
	const location = `/packs/${packid}/generators`;
	return (
		<button className={`title__btn settings dropdown  ${cssClass}`}>
			<div {...COG_BUTTON_SETTINGS}>
				<i className="title__btn-icon fa fa-cog" />
			</div>

			<div
				className={`settings__menu dropdown-menu dropdown-menu-right ${cssClass}`}
				aria-labelledby="dropdownMenuButton"
			>
				<div className={"settings__item btn dropdown-item " + cssClass} onClick={toggleData}>
					edit data
				</div>

				<Link to={isa ? `${location}/${isa}/edit` : `${location}/create?isa=${name}`}>
					<div className={"settings__item btn dropdown-item " + cssClass}>
						{isa ? <span>edit {isa} generator</span> : <span>create {name} generator</span>}
					</div>
				</Link>

				<div
					className={"settings__item btn dropdown-item " + cssClass}
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
		const { handleRestart, cssClass } = this.props;
		return (
			<button className={`title__btn btn ${cssClass}`} onClick={handleRestart}>
				<i className="title__btn-icon far fa-trash-alt" />
			</button>
		);
	}
}

class FavoriteButton extends React.PureComponent {
	render() {
		const { cssClass, isFavorite, toggleFavorite } = this.props;
		return (
			<button className={`title__btn ${cssClass}`} onClick={toggleFavorite}>
				<i className={`title__btn-icon ${(isFavorite ? "fas" : "far") + " fa-star"}`} />
			</button>
		);
	}
}

class PatternButton extends React.PureComponent {
	render() {
		const { cssClass = "", bg = "" } = this.props;
		return (
			<button className={`title__btn ${bg}`} data-toggle="modal" data-target="#patternSelectModal">
				<div className={`pattern swatch`}>
					{cssClass.split(" ").length > 1 && <i className="fa fa-check" />}
				</div>
			</button>
		);
	}
}

class StyleOptions extends React.PureComponent {
	render() {
		const { highlight, handleChange, toggleData, handleRestart, packid, color } = this.props;
		const { index, cssClass, up = [], txt, name, isa, isFavorite, toggleFavorite } = this.props;
		const resetTxt = up[0] && up[0].txt;
		const resetColor = parentBG(up);
		const { bg } = splitClass(cssClass);
		return (
			<div id="styleOptions" className={`title__btn-collection col-xs-auto right`}>
				<BGSelectPopover {...{ index, highlight, handleChange, resetTxt, resetColor, cssClass }} />
				<PatternButton cssClass={cssClass} bg={bg} />
				<HexColorPicker
					{...{ color, index, highlight, txt, handleChange, resetTxt, cssClass: bg }}
				/>
				<FavoriteButton {...{ isFavorite, toggleFavorite, cssClass: bg }} />
				<SettingsCog {...{ toggleData, name, isa, packid, cssClass: bg }} />
				<DeleteButton handleRestart={handleRestart} cssClass={bg} />
			</div>
		);
	}
}
const className = (isUniverse, category = "icon") =>
	`title__iconWrap ${isUniverse ? "universe " : ""} --${category} ${CENTER_ALIGN}`;

const ShowToPlayers = ({ cssClass, setPreview }) => (
	<button className={`btn btn-${cssClass} btn-sm title__showBtn`} onClick={setPreview}>
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
			hueOverlay: i.doHue ? this.props.cssClass : ""
		});
	};
	render() {
		const { isUniverse, icon = {}, txt, cssClass } = this.props;
		return (
			<div className={className(isUniverse, icon.category)}>
				{isUniverse ? (
					<>
						<button
							className={`title__iconBtn ${!icon ? "addNew" : ""} ${cssClass}`}
							data-toggle="modal"
							data-target="#iconSelectModal"
							style={{ color: txt }}
						>
							<Icon
								name={icon.value || "far fa-plus-square"}
								{...{ ...icon, inlinesvg: true, className: "title__icon" }}
							/>
						</button>
						{["img", "video"].includes(icon.category) ? (
							<ShowToPlayers {...{ cssClass, setPreview: this.setPreview }} />
						) : null}
					</>
				) : (
					<Icon {...{ ...icon, name: icon.value, inlinesvg: true, className: cssClass }} />
				)}
			</div>
		);
	}
}

const parentBG = up =>
	up[0] && up[0].cssClass && up[0].cssClass.split(" ").find(c => c.startsWith("bg-"));

const ExploreBar = ({ handleRestart, packid, cssClass }) => (
	<div className="col-xs-auto right">
		<button onClick={handleRestart} className={`title__btn ${cssClass}`}>
			<i className="fa fa-undo-alt" /> <small>Start over</small>
		</button>
		<Link to={"/universes/create?pack=" + packid} className={`title__btn ${cssClass}`}>
			<i className="fas fa-save" /> <small>Save</small>
		</Link>
	</div>
);

class ButtonsBar extends React.Component {
	shouldComponentUpdate(nextProps) {
		return (
			JSON.stringify(this.props.current) !== JSON.stringify(nextProps.current) ||
			this.props.isFavorite !== nextProps.isFavorite ||
			this.props.packid !== nextProps.packid
		);
	}
	render() {
		const { packid, isUniverse, current, isFavorite } = this.props;
		const { toggleFavorite, handleChange, handleRestart, toggleData } = this.props;
		const { up = [], cssClass, color, highlight, index, txt, name, isa } = current;
		return (
			<nav className="title__bar buttons-bar row">
				<Ancestors ancestors={up} pageClass={cssClass} highlight={highlight} color={color} />
				{!isUniverse ? (
					<ExploreBar handleRestart={handleRestart} packid={packid} />
				) : (
					<StyleOptions
						{...{ index, cssClass, up, txt, name, isa, isFavorite, highlight, color }}
						{...{ handleChange, toggleData, handleRestart, toggleFavorite, packid }}
					/>
				)}
			</nav>
		);
	}
}
class TheTitleComponent extends React.Component {
	state = {
		title: this.props.name || this.props.isa
	};
	constructor(props) {
		super(props);
		this.textareaRef = React.createRef();
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
		this.props.handleChange(val);
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
const TheTitle = connect(
	function mapStateToProps(state, { index, universeId, isEditable }) {
		const universe = state.universes.byId[universeId] || {};
		const pack = state.packs.byId[universe.pack] || {};
		const current = (universe.array && universe.array[index]) || {};
		return {
			name: current.name,
			txt: current.txt,
			isa: current.isa,
			font: pack.font,
			fontState: pack.font ? state.fonts[pack.font] : "loaded"
		};
	},
	function mapDispatchToProps(dispatch, { index, universeId, isEditable }) {
		return {
			handleChange: val => dispatch(changeInstance(index, "name", val, universeId, dispatch))
		};
	}
)(TheTitleComponent);

class Title extends React.PureComponent {
	render() {
		const { current, pack, isUniverse, favorites, universeId, loaded, isFavorite } = this.props;
		const { handleChange, handleRestart, toggleFavorite } = this.props;
		const { txt, index, cssClass, icon, desc = [], highlightClass: highlight } = current;
		const { _id: packid } = pack;
		return (
			<div id="Title" className="col-lg">
				<div className="name mb-2 row animated fadeIn">
					<IconButton {...{ isUniverse, cssClass, icon, txt }} />
					<TheTitle key={index + loaded} {...{ isEditable: isUniverse, index, universeId }} />
				</div>
				<ButtonsBar
					{...{ packid, isUniverse, current, isFavorite }}
					{...{ handleRestart, handleChange, toggleFavorite }}
				/>
				{isUniverse || desc.length ? (
					<Description {...{ desc: desc.join("\n"), highlight, isUniverse, handleChange }} />
				) : null}
				{isUniverse && <SearchBar favorites={favorites} index={index} />}
			</div>
		);
	}
}
export default Title;

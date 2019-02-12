import React from "react";
import { connect } from "react-redux";
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
const VERTICAL_ALIGN = "d-flex align-items-center";
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
const className = isUniverse =>
	`icon-wrap col-auto col-lg-12 px-0 mb-lg-1 ${isUniverse ? "universe " : ""} ${CENTER_ALIGN}`;

class IconButton extends React.PureComponent {
	render() {
		const { isUniverse, cssClass, icon, txt } = this.props;
		return (
			<div className={className(isUniverse)}>
				{isUniverse ? (
					<button
						className={"btn btn-outline " + cssClass + " " + (!icon ? "addNew" : "")}
						data-toggle="modal"
						data-target="#iconSelectModal"
						style={{ color: txt }}
					>
						<Icon name={icon || "far fa-plus-square"} alignment={CENTER_ALIGN} />
					</button>
				) : (
					<Icon name={icon} alignment={CENTER_ALIGN} />
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
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	handleChange = e => {
		const val = e.target.value;
		this.setState({ title: val });
		// todo debounce
		this.props.handleChange(val);
		const textarea = this.textareaRef.current;
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	render() {
		const { name, font, txt, isa, isEditable } = this.props;
		return (
			<div className={"col col-lg-12 px-2 justify-content-lg-center " + VERTICAL_ALIGN}>
				<div id="name" style={{ color: txt }}>
					<textarea
						rows="1"
						ref={this.textareaRef}
						className="title__input webfont"
						value={this.state.title}
						disabled={!isEditable}
						style={font ? { fontFamily: `'${font}', sans-serif` } : {}}
						onChange={this.handleChange}
					/>
					<Isa name={name} isa={isa} />
				</div>
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
			font: pack.font
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
				<div className="name mt-3 mb-2 row animated fadeIn no-gutters">
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

import React, { useCallback } from "react";

import Link from "components/Link";
import HexColorPicker from "components/Form/HexColorPicker";
import BGSelectPopover from "./BGSelectPopover";
import splitClass from "util/splitClass";

const NOOP = () => {};
const COG_BUTTON_SETTINGS = {
	type: "button",
	id: "dropdownMenuButton",
	"data-toggle": "dropdown",
	"aria-haspopup": true,
	"aria-expanded": false
};
const parentBG = (parent = {}) =>
	parent.cls && parent.cls.split(" ").find(c => c.startsWith("bg-"));

const SettingsCog = ({ cls, toggleData, pack_id, name, isa, toggleModal }) => {
	const openMoveModal = useCallback(() => {
		toggleModal("MOVE");
	}, [toggleModal]);
	const location = `/packs/${pack_id}/generators`;
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

				<div className={"settings__item btn dropdown-item " + cls} onClick={openMoveModal}>
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

function FavoriteButton({ cls, fav, handleChange = NOOP }) {
	const toggleFavorite = useCallback(() => {
		handleChange({ fav: !fav });
	}, [fav, handleChange]);
	return (
		<button className={`title__btn ${cls}`} onClick={toggleFavorite}>
			<i className={`title__btn-icon ${(fav ? "fas" : "far") + " fa-star"}`} />
		</button>
	);
}

class PatternButton extends React.PureComponent {
	render() {
		const { cls = "", bg = "" } = this.props;
		return (
			<button className={`title__btn ${bg}`}>
				<div className={`pattern swatch`}>
					{cls.split(" ").length > 1 && <i className="fa fa-check" />}
				</div>
			</button>
		);
	}
}

export default function StyleOptions({
	highlight,
	handleChange = NOOP,
	toggleModal,
	handleRestart = NOOP,
	pack_id,
	color,
	index,
	cls,
	parent = {},
	txt,
	name,
	isa,
	fav
}) {
	const resetTxt = parent.txt;
	const resetColor = parentBG(parent);
	const { bg } = splitClass(cls);
	return (
		<div id="styleOptions" className={`title__btn-collection col-xs-auto right`}>
			<BGSelectPopover {...{ index, highlight, handleChange, resetTxt, resetColor, cls }} />
			<PatternButton cls={cls} bg={bg} toggleModal={toggleModal} />
			<HexColorPicker {...{ color, index, highlight, txt, handleChange, resetTxt, cls: bg }} />
			<FavoriteButton {...{ fav, handleChange, cls: bg }} />
			<SettingsCog {...{ toggleModal, name, isa, pack_id, cls: bg }} />
			<DeleteButton handleRestart={handleRestart} cls={bg} />
		</div>
	);
}

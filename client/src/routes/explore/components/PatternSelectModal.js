import React from "react";

import { ModalHeader } from "./ModalIconSelect";
import textures from "assets/data/textures";
import "./PatternSelectModal.scss";

const cols = "col-xl-2 col-lg-3 col-sm-4 col-xs-6";
const MODAL_OPTIONS = {
	className: "modal fade",
	"data-backdrop": false,
	id: "patternSelectModal",
	tabIndex: "-1",
	role: "dialog",
	"aria-hidden": "true"
};

class Texture extends React.PureComponent {
	render() {
		const { t, bg, ptn, handleClick } = this.props;
		return (
			<div className={cols}>
				<div
					className={`sample ptn-${t} ${bg}`}
					onClick={() => {
						handleClick(t);
					}}
				>
					{ptn === "ptn-" + t ? <i className="fa fa-check" /> : null}
					{t}
				</div>
			</div>
		);
	}
}

const PatternSelectModalComponent = ({ bg, ptn, handleClick }) => (
	<div {...MODAL_OPTIONS}>
		<div className="patterns__dialog modal-dialog" role="document">
			<div className={"patterns__content modal-content " + bg}>
				{ModalHeader}
				<div className="patterns__body modal-body row">
					<div className={cols}>
						<div
							className="sample"
							onClick={() => {
								handleClick(null);
							}}
						>
							{!ptn ? <i className="fa fa-check" /> : null}
							none
						</div>
					</div>
					{textures.map((t, i) => (
						<Texture key={i} {...{ t, bg, ptn, handleClick }} />
					))}
				</div>
			</div>
		</div>
	</div>
);

export default class PatternSelectModal extends React.PureComponent {
	handleClick = value => {
		let className = this.props.bg;
		if (value) className += " ptn-" + value;

		this.props.handleChange(this.props.index, "cssClass", className);
	};
	render() {
		var { bg, ptn } = this.props;
		const { handleClick } = this;
		return <PatternSelectModalComponent {...{ bg, ptn, handleClick }} />;
	}
}

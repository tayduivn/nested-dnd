import React from "react";

export default class InfoPanel extends React.Component {
	render() {
		return (
			<div className="info-panel">
				<i
					className={
						"fa fa-long-arrow-up " +
						(this.props.range ? "" : "hidden")
					}
				/>{" "}
				{this.props.range}
				{this.props.range ? <span>&nbsp; &nbsp;</span> : ""}
				<i
					className={
						"fa fa-clock-o " + (this.props.duration ? "" : "hidden")
					}
				/>{" "}
				{this.props.duration}
				{this.props.concentration === "Yes" ? " Concentration" : ""}
			</div>
		);
	}
}
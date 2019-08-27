import React from "react";

const InfoPanel = ({ range, longRange, duration, concentration }) => (
	<div className="info-panel">
		{range ? (
			<span>
				<i className="fas fa-long-arrow-alt-up" /> {range}
				{longRange && range !== longRange ? "/" + longRange : ""}
				{range ? <span>{"   "}</span> : ""}
			</span>
		) : null}

		{duration ? (
			<span>
				<i className="far fa-clock" /> {duration}
				{concentration ? " Concentration" : ""}
			</span>
		) : null}
	</div>
);

export default InfoPanel;

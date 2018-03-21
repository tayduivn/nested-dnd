import React from "react";

const InfoPanel = ({ range, duration, concentration }) => (
	<div className="info-panel">
		<i className={`fa fa-long-arrow-up ${range ? "" : "hidden"}`}/>{" "}
		{range}
		{range ? <span>{"   "}</span> : ""}
		<i className={`fa fa-clock-o ${duration ? "" : "hidden"}`} />{" "}
		{duration}
		{concentration === "Yes" ? " Concentration" : ""}
	</div>
);

export default InfoPanel;

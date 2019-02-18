import React from "react";

const Page = props => (
	<div className="main">
		<div className="container mt-5">{props.children}</div>
	</div>
);
export default Page;

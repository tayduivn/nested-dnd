import React from "react";

const Page = ({children, id}) => (
	<div className="main" id={id}>
		<div className="container mt-5">{children}</div>
	</div>
);
export default Page;

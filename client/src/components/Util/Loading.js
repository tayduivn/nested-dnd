import React from "react";

import Page from "./Page";

export const LoadingIcon = () => <i className="loading fa fa-spinner fa-spin" />;

export const LoadingPage = () => (
	<Page>
		<LoadingIcon />
	</Page>
);

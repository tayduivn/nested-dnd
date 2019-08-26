import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";

import "animate.css";

import "./index.css";

import App from "./components/App";

// monkey patch
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
	const whyDidYouRender = require("@welldone-software/why-did-you-render/dist/no-classes-transpile/umd/whyDidYouRender.min.js");
	whyDidYouRender(React);
}

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();

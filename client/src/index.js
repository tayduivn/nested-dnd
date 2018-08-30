import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";

import "animate.css";

import "./index.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";

import App from "./components/App/App";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
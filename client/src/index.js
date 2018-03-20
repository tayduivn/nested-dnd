import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";

import "animate.css";
import "font-awesome/css/font-awesome.min.css";
import "game-icons-font/src/gameiconsfont/css/game-icons-font.min.css";
import "./assets/font/_flaticon.scss";
import "react-select/dist/react-select.css";

import "./index.css";

import App from "./components/App/App";

require('bootstrap');

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();

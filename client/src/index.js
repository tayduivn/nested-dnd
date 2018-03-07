import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";

import "bootstrap/dist/css/bootstrap.css";
import "animate.css";
import "font-awesome/css/font-awesome.min.css";
import "game-icons-font/src/gameiconsfont/css/game-icons-font.min.css";
import "./assets/font/flaticon.css";
import "react-select/dist/react-select.css";

import "./index.css";
import "./components/App.css";

import App from "./components/App";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();

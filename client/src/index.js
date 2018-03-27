import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";


import "animate.css";
import "font-awesome/css/font-awesome.min.css";
import "./assets/font/game-icons.css";
import "./assets/font/flaticon.css";
import "react-select/dist/react-select.css";

import "./index.css";

import App from "./components/App/App";

require('bootstrap');

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();

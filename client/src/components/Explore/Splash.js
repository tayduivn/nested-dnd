import React from "react";
import { Link } from 'react-router-dom';

import "./Splash.css"

const Splash = () => (
	<div className="container-fluid">
		<link href="https://fonts.googleapis.com/css?family=IM+Fell+English+SC" rel="stylesheet" />
		<link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet" />
		<div className="row fullscreen">
			<Link to="/explore/nested" className="nested stardust col-xs-12 col-sm-6">
				<div>
					<p>Nested</p>
				</div>
			</Link>
			<Link to="/explore/dnd" className="dnd purty-wood lightgoldenrodyellow col-xs-12 col-sm-6">
				<div>
					<p>Dungeons & Dragons</p>
				</div>
			</Link>
		</div>
	</div>
)

export default Splash;
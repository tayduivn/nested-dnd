import React from "react";
import { Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import "./Home.css"

const Home = () => (
	<div className="container-fluid">
		<link href="https://fonts.googleapis.com/css?family=IM+Fell+English+SC" rel="stylesheet" />
		<link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet" />
		<Row className="fullscreen">
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
		</Row>
	</div>
)

export default Home;
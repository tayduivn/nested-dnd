import React, { Component } from "react";
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import "./Home.css"

const Home = () => (
	<div className="container-fluid">
		<Row className="fullscreen">
			<Link to="/explore/nested" className="nested stardust col-xs-12 col-sm-6">
				<div>
					<p>Nested</p>
				</div>
			</Link>
			<Link to="/explore/dnd" className="dnd purty_wood col-xs-12 col-sm-6">
				<div>
					<p>D&D</p>
				</div>
			</Link>
		</Row>
	</div>
)

export default Home;
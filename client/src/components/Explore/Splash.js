import React from "react";
import { Link } from 'react-router-dom';
import WebFont from 'webfontloader';

import "./Splash.css"

const nestedLink = {
	pathname: "/explore/nested",
	state: {
		fromSplash: true,
		current: {
			in: true,
			cssClass: 'black stardust',
			name: 'Nested'
		}
	}
}

const dndLink = {
	pathname: "/explore/dnd",
	state: {
		fromSplash: true,
		current: {
			in: true,
			cssClass: 'tan purty-wood',
			name: 'Dungeons & Dragons',
			font: 'IM Fell English SC'
		}
	}
}

class Splash extends React.Component {
	componentWillMount(){
		WebFont.load({
			google: {
				families: ['IM Fell English SC','Press Start 2P']
			}
		})
	}
	render(){
		return (
			<div className="container-fluid">
				<div className="row fullscreen">
					<Link to={nestedLink} className="nested black stardust col-lg">
						<div>
							<p className="webfont">Nested</p>
						</div>
					</Link>
					<Link to={dndLink} className="dnd purty-wood burlywood col-lg">
						<div>
							<p className="webfont">Dungeons & Dragons</p>
						</div>
					</Link>
				</div>
			</div>
		)
	}
}

export default Splash;
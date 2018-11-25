import React from "react";
import PropTypes from "prop-types";

import './PlayersPreview.css';

export default class PlayersPreview extends React.Component {
	static propTypes = {
		subscribeToPlayersPreview: PropTypes.func
	}
	state = {
		src: undefined,
		alt: undefined,
		width: '100vw',
		height: '100vh'
	}
	centerWindow(){

	}
	componentDidMount(){
		this.setState({status: "subscribed"});

		this.props.subscribeToPlayersPreview((err, {src, alt, width = '100vw', height = '100vh'} = {}) => {
			this.setState({status: "retrieved"});
			this.setState({ src, alt, width });
		});
	}

	// center scroll
	onLoad(img){
		setTimeout(()=> {
			window.scrollTo({
				top: (img.height/2) - (window.innerHeight/2),
				left: (img.width/2) - (window.innerWidth/2),
			})
		},10);
	}

	render(){
		return (
			<div className="players-preview">
				<img src={this.state.src} alt={this.state.alt} style={{maxWidth: this.state.width, maxHeight: this.state.height}}  onLoad={(e) => this.onLoad(e.target)} />
			</div>
		);
	}
}
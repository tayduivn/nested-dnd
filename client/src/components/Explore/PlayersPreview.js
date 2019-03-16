import React from "react";

import "./PlayersPreview.css";

import { subscribeToPlayersPreview } from "../../actions/WebSocketAction";

const Image = ({ src, alt, width, height, onLoad }) => (
	<img src={src} alt={alt} style={{ maxWidth: width, maxHeight: height }} onLoad={onLoad} />
);

const Video = ({ src, alt, width, height, onLoad, hueOverlay }) => (
	<div class="video__wrapper">
		<div class={`video__hueOverlay ${hueOverlay}`} />
		<video autoPlay style={{ width: width, height: height }} loop>
			<source src={src} type="video/mp4" />
		</video>
	</div>
);

export default class PlayersPreview extends React.Component {
	state = {
		src: undefined,
		category: "img",
		alt: undefined,
		hueOverlay: "",
		width: "100vw",
		height: "100vh"
	};
	centerWindow() {}
	componentDidMount() {
		this.setState({ status: "subscribed" });

		subscribeToPlayersPreview(
			(err, { src, alt, width = "100vw", height = "100vh", category, hueOverlay } = {}) => {
				this.setState({ status: "retrieved", src, alt, width, category, hueOverlay });
			}
		);
	}

	// center scroll
	onLoad(e) {
		const img = e.target;
		setTimeout(() => {
			window.scrollTo({
				top: img.height / 2 - window.innerHeight / 2,
				left: img.width / 2 - window.innerWidth / 2
			});
		}, 10);
	}

	render() {
		const Category =
			this.state.category === "img" ? Image : this.state.category === "video" ? Video : null;
		return (
			<div className="players-preview">
				<Category {...this.state} onLoad={this.onLoad} />
			</div>
		);
	}
}

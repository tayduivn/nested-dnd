import React from "react";

import "./index.scss";
import { pixelToHex, hexToPixel, calcSizing } from "./hexmath";
import draw from "./draw";

function fitCanvasToParent(canvas) {
	const parent = canvas.parentElement;
	canvas.width = parent.clientWidth;
	canvas.height = parent.clientHeight;
}

export default class Map extends React.PureComponent {
	constructor(props) {
		super(props);
		this.mapRef = React.createRef();
		this.hexSize = 20;
		this.grid = [];
		this.hovered = false;
		this.rowCount = 0;
		this.colCount = 0;
	}

	handleMouseMove = e => {
		const canvas = this.mapRef.current;
		const { hexSize, hexOrigin, rowCount, colCount } = this;

		const x = e.pageX - canvas.offsetLeft;
		const y = e.pageY - canvas.offsetTop;

		const coords = pixelToHex({ x, y }, hexSize, hexOrigin);
		const center = hexToPixel(coords, hexSize, hexOrigin);

		// clear currently hovered
		if (this.hovered) {
			const oldCenter = hexToPixel(this.hovered, hexSize, hexOrigin);
			draw.hex(canvas, oldCenter, hexSize);
			this.hovered = false;
		}

		if (coords.c >= colCount || coords.r >= rowCount || coords.r < 0 || coords.c < 0) {
			canvas.style.cursor = "default";
			return;
		}

		// draw new hover
		draw.hex(canvas, center, hexSize, "#eeeeee", "#000", this.imageObj);
		this.hovered = coords;
		canvas.style.cursor = "pointer";
	};

	componentDidMount() {
		const canvas = this.mapRef.current;
		const { hexSize } = this;

		fitCanvasToParent(canvas);
		const { rowCount, colCount, hexOrigin } = calcSizing(canvas.width, canvas.height, hexSize);

		draw.hexes(rowCount, colCount, canvas, hexSize, hexOrigin);

		// set up param
		this.grid = new Array(rowCount);
		this.grid.forEach((row, r) => (this.grid[r] = new Array(colCount)));

		this.hexOrigin = hexOrigin;
		this.rowCount = rowCount;
		this.colCount = colCount;

		let imageObj = new Image();

		/*imageObj.onload = function() {
			const center = hexToPixel({ c: 0, r: 0 }, hexSize, hexOrigin);
			draw.hex(canvas, center, hexSize, "#eeeeee", imageObj);
		};*/
		imageObj.src = "https://i.imgur.com/65MLa3a.jpg";
		this.imageObj = imageObj;
	}

	render() {
		return (
			<div className="map__wrapper main mt-5">
				<canvas ref={this.mapRef} className="map" onMouseMove={this.handleMouseMove} />
			</div>
		);
	}
}

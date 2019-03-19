import { getHexCornerCoord, hexToPixel } from "./hexmath";

function line(ctx, start, end) {
	ctx.lineTo(end.x, end.y);
}

function hex(canvas, center, hexSize, strokeStyle = "#000000", fillStyle = "#ffffff", imageObj) {
	const ctx = canvas.getContext("2d");
	ctx.beginPath();
	let start = getHexCornerCoord(center, hexSize, 0);
	ctx.moveTo(start.x, start.y);

	for (let i = 0; i < 6; i++) {
		const endIndex = (i + 1) % 6;
		let end = getHexCornerCoord(center, hexSize, endIndex);
		line(ctx, start, end);

		start = end;
	}
	ctx.strokeStyle = strokeStyle;
	ctx.fillStyle = fillStyle;
	ctx.stroke();
	ctx.fill();
	ctx.closePath();

	//draw image
	if (imageObj) {
		ctx.save();
		ctx.clip();
		ctx.drawImage(imageObj, center.x - hexSize, center.y - hexSize, hexSize * 2, hexSize * 2);
		ctx.restore();
	}
}

function hexes(rowCount, colCount, canvas, hexSize, hexOrigin) {
	for (let r = 0; r < rowCount; r++) {
		for (let c = 0; c < colCount; c++) {
			let center = hexToPixel({ c, r }, hexSize, hexOrigin);
			hex(canvas, center, hexSize);
			hexCoords(canvas, center, { c, r });
		}
	}
}

function hexCoords(canvas, center, { c, r }) {
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#000";
	ctx.textAlign = "center";
	ctx.fillText(`${c},${r}`, center.x, center.y + 3);
}

export default { hex, hexes, line, hexCoords };

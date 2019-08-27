export function inGrid({ c, r }, colCount, rowCount) {
	return c >= colCount || r >= rowCount || r < 0 || c < 0;
}

export function calcSizing(width, height, hexSize) {
	const spacing = getHexSpacing(hexSize);
	const rowCount = Math.floor(height / spacing.vDist) - 1;
	const colCount = Math.floor(width / spacing.hDist) - 1;
	const remainingHeight = height - spacing.vDist * rowCount;
	const remainingWidth = width - spacing.hDist * colCount;
	const hexOrigin = {
		x: remainingWidth / 2 + spacing.hDist / 4,
		y: remainingHeight / 2 + spacing.vDist / 2
	};

	return { rowCount, colCount, hexOrigin };
}

export function hexToPixel({ c, r }, hexSize, hexOrigin) {
	// go back and forth
	c = c - Math.floor(r / 2);

	let x = hexSize * (Math.sqrt(3) * c + (Math.sqrt(3) / 2) * r) + hexOrigin.x;
	let y = hexSize * ((3 / 2) * r) + hexOrigin.y;
	return { x, y };
}

export function pixelToHex({ x, y }, size, origin) {
	let c = ((Math.sqrt(3) / 3) * (x - origin.x) - (y - origin.y) / 3) / size;
	let r = ((2 / 3) * y) / size;

	const rounded = cubeRound({ c, r, s: -c - r });

	// accomodate back and forth
	rounded.r -= 1;
	rounded.c = rounded.c + Math.floor(rounded.r / 2);
	return { c: rounded.c, r: rounded.r };
}

function cubeRound({ c, r, s }) {
	let rx = Math.round(c);
	let ry = Math.round(r);
	let rz = Math.round(s);

	let x_diff = Math.abs(rx - c);
	let y_diff = Math.abs(ry - r);
	let z_diff = Math.abs(rz - s);

	if (x_diff > y_diff && x_diff > z_diff) rx = -ry - rz;
	else if (y_diff > z_diff) ry = -rx - rz;
	else rz = -rx - ry;

	return { c: rx, r: ry, s: rz };
}
export function getHexCornerCoord(center, hexSize, i) {
	let angle_deg = 60 * i - 30;
	let angle_rad = (Math.PI / 180) * angle_deg;
	let x = center.x + hexSize * Math.cos(angle_rad);
	let y = center.y + hexSize * Math.sin(angle_rad);
	return { x, y };
}

export function getHexSpacing(hexSize) {
	let height = hexSize * 2;
	let width = (Math.sqrt(3) / 2) * height;
	let vDist = (height * 3) / 4;
	let hDist = width;
	return {
		height,
		width,
		vDist,
		hDist
	};
}

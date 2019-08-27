export default function toUpper(str) {
	return str
		.split(" ")
		.map(s => s.charAt(0).toUpperCase() + s.substr(1))
		.join(" ");
}

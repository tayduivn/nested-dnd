export default function setBodyStyle({ cssClass = "", txt = "", up = [] } = {}) {
	var body = window.document.getElementById("body");
	if (!body) return; //for tests
	var stripped = body.className
		.split(" ")
		.filter(c => !c.startsWith("bg-") && !c.startsWith("ptn-"))
		.join(" ")
		.trim();
	if (!cssClass) {
		cssClass = (up[0] && up[0].cssClass) || "";
	}
	if (!txt) txt = "";
	stripped += " " + cssClass;
	body.className = stripped.trim();
	body.style.color = txt;
}

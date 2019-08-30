export default function setBodyStyle({ cls = "", txt = "", up = [] } = {}) {
	var body = window.document.getElementById("body");
	if (!body) return; //for tests
	var stripped = body.className
		.split(" ")
		.filter(c => !c.startsWith("bg-") && !c.startsWith("ptn-"))
		.join(" ")
		.trim();
	if (!cls) {
		cls = (up[0] && up[0].cls) || "";
	}
	if (!txt) txt = "";
	stripped += " " + cls;
	body.className = stripped.trim();
	body.style.color = txt;
}

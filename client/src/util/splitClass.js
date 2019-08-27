export default function splitClass(cssClass = "") {
	const parts = cssClass.split(" ");
	return {
		bg: parts.find(p => p.startsWith("bg-")) || "",
		ptn: parts.find(p => p.startsWith("ptn-")) || ""
	};
}

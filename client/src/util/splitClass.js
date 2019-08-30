export default function splitClass(cls = "") {
	const parts = cls.split(" ");
	return {
		bg: parts.find(p => p.startsWith("bg-")) || "",
		ptn: parts.find(p => p.startsWith("ptn-")) || ""
	};
}

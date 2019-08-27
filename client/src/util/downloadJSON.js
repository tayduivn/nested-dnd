export default function downloadJSON(obj, filename) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
	var dlAnchorElem = document.getElementById("downloadAnchorElem");
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", filename + ".json");
	dlAnchorElem.click();
}

export default function binaryFind(arr, searchElement) {
	var minIndex = 0;
	var maxIndex = arr.length - 1;
	var currentIndex;
	var currentElement;

	while (minIndex <= maxIndex) {
		currentIndex = ((minIndex + maxIndex) / 2) | 0;
		currentElement = arr[currentIndex];

		if (currentElement < searchElement) {
			minIndex = currentIndex + 1;
		} else if (currentElement > searchElement) {
			maxIndex = currentIndex - 1;
		} else {
			return {
				// Modification
				found: true,
				index: currentIndex
			};
		}
	}

	return {
		// Modification
		found: false,
		index: currentElement < searchElement ? currentIndex + 1 : currentIndex
	};
}

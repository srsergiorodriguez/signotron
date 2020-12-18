function stringToArray(str_) {
	// Convert a string to an array of numbers
	let str = str_;
	let arr =[];
	for (let i=0;i<str.length;i++) {
		let char = str.substr(i,1);
		arr[i] = int(char);
	}
	return arr;
}

function arrayToString(arr_) {
	// Convert an array of numbers to a string
	let arr = arr_;
	let str = "";
	for (let i=0;i<arr.length;i++) {
		let num = nf(arr[i]);
		str+=num;
	}
	return str;
}

function multiStringToArray(string_) {
	let tempArray = [];
	for (let i=0;i<string_.length;i++) {
		tempArray[i] = stringToArray(string_[i]);
	}
	return tempArray;
}
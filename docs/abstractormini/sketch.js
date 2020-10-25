/* 
Abstractor mini: una aplicación para crear y recuperar figuras abstractas 
por medio de un código numérico.
Por Sergio Rodríguez Gómez
V.2.0.0
MIT LICENSE
*/

let codeInput;
let btnURLS = {shape:[],size:[],position:[],rotation:[]};
let iconBtns = [];
let shapeSets = [];

function setup() {
	createCanvas(res,res).id('canvas').parent(app_canvas_container);
	background(255);
	setParameters(); // Change the app config according to url parameters
	createCodeInput(); // Create the div that will contain the code and its buttons
	createIconImgs(); // Create images for the buttons that will represent the possible transformations
	readCode(); // Read the code by dividing it in subcodes and create the corresponding shapes
	createShapeSets(); // Read the code by dividing it in subcodes

	iconBtns = selectAll(".icon_button");
	highlightBtns();
	shapeSets = selectAll(".shape_set");
}

function setParameters() {
	let params = getURLParams();
	if (params.pal) {
		colors = palettes.hasOwnProperty(params.pal)?palettes[params.pal]:colors;
	}
}

function createCodeInput() {
	// Create the DOM elements for the code input
	codeInput = createInput(arrayToString(code)).parent(app_code_container).class("code_input");
	createButton('leer código').parent(app_code_container).class("input_btn")
		.mouseClicked(submitCode);
	
	createButton('código aleatorio').parent(app_code_container).class("input_btn")
		.mouseClicked(randomCode);

	createButton('guardar imagen').parent(app_code_container).class("input_btn")
		.mouseClicked(saveImage);
}

function createShapeSets() {
	// Create a complete set of controls with multiple sets of buttons
	for (let i=0;i<shapes;i++) {
		const shapeSet = createDiv().parent(shape_control).class("shape_set");
		createElement('p','Figura '+(i+1)).parent(shapeSet);
		createIconButtonsSet(shapeSet,i);
	}
}

function createIconButtonsSet(parent_,shapeSetIndex_) {
	// Create a set of buttons
	for (let i=0;i<attributeNr;i++) {
		createIconButtons(attributeKeys[i],parent_,i+(shapeSetIndex_*attributeNr));
	}
}

function createIconButtons(iconType_,parent_,setIndex_) {
	// Create invididual Buttons
	const buttonsDiv = createDiv().class("buttons_div").parent(parent_);
	if (iconType_=="color") {
		for (let i=0;i<colors.length;i++) {
			createDiv("").style('background',colors[i]).parent(buttonsDiv).class("icon_button")
				.mouseClicked(()=>{setCode(setIndex_,i)});
		}
	} else {
		for (let i=0;i<cmax;i++) {
			createImg(btnURLS[iconType_][i]).parent(buttonsDiv).class("icon_button")
				.mouseClicked(()=>{setCode(setIndex_,i)});
		}
	}
}

function highlightBtns() {
	for (let i=0;i<iconBtns.length;i++) {
		iconBtns[i].removeClass('highlighted_button');
	}
	for (let i=0;i<code.length;i++) {
		iconBtns[i*cmax+(code[i])].addClass('highlighted_button');
	}
}

function highlightSet(index_) {
	unHighlightSet();
	let tempset = floor(index_/(code.length/shapes));
	shapeSets[tempset].addClass('highlighted_set');
}

function unHighlightSet() {
	for (let i=0;i<shapeSets.length;i++) {
		shapeSets[i].removeClass('highlighted_set');
	}
}

function getImageBtn() {
	return document.getElementById('canvas').toDataURL('image/png',0.1);
}

function submitCode() {
	if (codeInput.value().length===code.length&&!(/[a-z !_]/gi.test(codeInput.value()))) {
		code = [...stringToArray(codeInput.value())];
		readCode();
		unHighlightSet();
		highlightBtns();
	} else {
		codeInput.value('código invalido');
	}
}

function resetCode() {
	code = Array(codeLength).fill(0);
}

function randomCode() {
	let randomCode = [];
	for (let i=0;i<code.length;i++) {
		let num = int(random(9));
		randomCode[i] = num;
	}
	code=randomCode;
	readCode();
}

function saveImage() {
	saveCanvas("Abstractor"+codeInput.value(),'png');
}

function arrayToString(arr_) {
	// Convert an array of numbers to a string
	return arr_.reduce((a,c)=>a+c,"");
}

function stringToArray(str_) {
	// Convert a string to an array of numbers
	let arr = [];
	for (let i=0;i<str_.length;i++) {
		const char = str_.substr(i,1);
		arr[i] = int(char);
	}
	return arr;
}

function updateCodeString() {
	// Update the value of the input with the internal code
	codeInput.value(arrayToString(code));
}

function setCode(index_,number_) {
	// Set a particular value in an index of the code
	code[index_] = number_;
	readCode();
	highlightSet(index_);
	highlightBtns();
}

function readCode() {
	// Read the code by dividing it in subcodes
	background(255);
	for (let i=0;i<shapes;i++) {
		const subCode = code.slice(i*attributeNr,i*attributeNr+attributeNr);
		const shape = createShapeImg(createGraphics(res,res),...subCode);
		image(shape,0,0);
	}
	updateCodeString();
}

function createIconImgs() {
	//shape,size,color,position,rotation
	resetCode();
	for (let i=0;i<cmax;i++) {
	  // Shape
	  code[0] = i;
	  code[1] = 7;
	  code[2] = 1;
	  code[3] = 5;
	  code[4] = 0;
	  readCode();
	  btnURLS.shape[i] = getImageBtn();
		// Size
		code[0] = 4;
		code[1] = i;
		readCode();
		btnURLS.size[i] = getImageBtn();
		// Position
		code[1] = 3;
		code[2] = 2;
		code[3] = i;
		code = i===0?[...[6,9,2,5,3,6,9,2,5,5],...Array(codeLength-10).fill(0)]:code; // Create an 'X' to represent the absence of position
		readCode();
		btnURLS.position[i] = getImageBtn();
		// Rotation
		resetCode();
		code[0] = 8;
		code[1] = 5;
		code[2] = 1;
		code[3] = 5;
		code[4] = i;
		readCode();
		btnURLS.rotation[i] = getImageBtn();
	}
	resetCode();
}
/* 
Abstractor: una aplicación para crear y recuperar figuras abstractas 
por medio de un código numérico.
Por Sergio Rodríguez Gómez
V.2.0.0
MIT LICENSE
*/

let codeInput;
let btnURLS = {shape:[],size:[],position:[],rotation:[],color:[]};
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
	const params = getURLParams();
	if (params.pal) {
		colors = palettes.hasOwnProperty(params.pal)?palettes[params.pal]:colors;
	}
	if (params.pos) {
		positionFormat = params.pos;
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
	for (let i=0;i<cmax;i++) {
		createImg(btnURLS[iconType_][i]).parent(buttonsDiv).class("icon_button")
			.mouseClicked(()=>{setCode(setIndex_,i)});
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
	const emptyCode = Array(codeLength).fill(0);
	code = emptyCode;
	for (let i=0;i<cmax;i++) {
		const preShape = [
			[i,7,1,5,0], // Shape
			[4,i,1,5,0], // Size
			[4,9,i,5,0], // Color
			[4,3,2,i,0], // Position
			[8,5,1,5,i] // Rotation
		]
		for (let j=0;j<preShape.length;j++) {
			const v = preShape[j];
			code = [...v,...Array(codeLength-v.length).fill(0)];
			if (i===0&&j===3) {code = [...[6,9,2,5,3,6,9,2,5,5],...Array(codeLength-10).fill(0)]} // Make an X in 0 position
			readCode();
			btnURLS[attributeKeys[j]][i] = document.getElementById('canvas').toDataURL('image/png',0.1);
		}
	}
	code = emptyCode;
}
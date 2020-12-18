let preview;
let cols = 4; // The number of columns displayed on the canvas
let rows = 4; // The number of rows displayed on the canvas
const maxTiles = 11
let canvasW = 1920; // The width of the canvas
let canvasH; // The height of the canvas
let codesNum; // The number of images that fit in the whole canvas

let codeArray = []; // An array that contains the abstractor codes of all the images in the canvas
let codeInput = []; // An array that contains the general code input
let generalString; // The complete code of the motivo image

let imgs = []; // An array that contains the image p5.js objects of the rendered abstractor images
let imgsPos = []; // An array that contains the positions of the image p5.objects that will be displayed in the canvas

let backColor; // The background color

function setup() {
	backColor = color(255);
	setParameters();
	noCanvas();
	let tempX = cols;
	let tempY = rows;
	select('#x_tiles_input').input(function(){tempX = +this.value()});
	select('#y_tiles_input').input(function(){tempY = +this.value()});
	select('#tiles_btn').mouseClicked(()=>{
		const test = (v) => v > 0 && v < maxTiles? true : false;
		let validX = test(tempX);
		let validY = test(tempY);
		if (validX && validY) {
			cols = tempX;
			rows = tempY;
			select("#app_container").show();
			select("#setup_container").hide();
			configApp();
		} else {
			alert(`Pon valores válidos para las baldosas horizontales (X) y verticales (Y). Ambos deben ser mayores a 0 y menores a ${maxTiles}`);
		}
	});
}

function setParameters() {
	let params = getURLParams();
	if (params.pal) {
		colors = palettes.hasOwnProperty(params.pal)?palettes[params.pal]:colors;
	}
	if (params.background) {
		backColor = color(...params.background.split("_",3).map(x=>+x));
		console.log(backColor);
	}
}

function configApp() {
	res = canvasW/cols;
	canvasH = res*rows;
	codesNum = cols*rows;

	preview = createGraphics(canvasW,canvasH).id('preview');
	background(backColor);
  for (let i=0;i<codesNum; i++) {
  	codeArray[i] = resetCode();
		imgsPos[i] = [res*(i%cols),res*((i-(i%cols))/cols)];
		createCodeInput(i);
	}
	createGeneralCodeInput();
}

function resetCode() {
	return Array(codeLength).fill(0);
}

function generateGeneralCode() {
	return codeArray.reduce((a,c)=>a+arrayToString(c),"");
}

function getPreviewURL() {
	return document.getElementById('preview').toDataURL('image/png',0.1);
}

function createGeneralCodeInput() {
	// Create the DOM elements for the general code input
	const generalCodeInput = createInput("").parent('#app_general_code_container').id("general_code_input").value(generateGeneralCode());
	generalString = randomCode(); // generateGeneralCode();
	decodeGeneral();
	createButton('leer código').parent('#app_general_code_container').class("input_btn")
		.mouseClicked(()=>{
			generalString = generalCodeInput.value();
			decodeGeneral();
		});

	createButton('código aleatorio').parent('#app_general_code_container').class("input_btn")
		.mouseClicked(()=>{
			generalString = randomCode();
			decodeGeneral();
		});

	createButton('guardar imagen').parent('#app_general_code_container').class("input_btn")
		.mouseClicked(()=>{saveCanvas(preview,"Obra",'png')});

	createButton('copiar al portapapeles').parent('#app_general_code_container').class("input_btn")
		.mouseClicked(()=>{
			let copyText = document.getElementById("general_code_input");
			copyText.select();
			copyText.setSelectionRange(0, 99999); /* For mobile devices */
			document.execCommand("copy");
		});
}

function createCodeInput(index) {
	// Create the DOM elements for the code inputs of abstractor figures
	select('#app_controls_container').style('display','grid').style('grid-template-columns',`repeat(${cols},1fr)`);
	appCodeContainer = createDiv().parent('#app_controls_container').class("app_code_container");
	createP((index%cols)+""+(index-(index%cols))/cols).parent(appCodeContainer);
	codeInput[index] = createInput(arrayToString(codeArray[index]))
		.parent(appCodeContainer).class("code_input")
		.mouseClicked(()=>{
			submitCode(index);
		});
}

function submitCode(index) {
	// Reads the Abstractor code from an input, then displays
	if (codeInput[index].value().length===codeLength) {
		codeArray[index] = stringToArray(codeInput[index].value());
		select("#general_code_input").value(generateGeneralCode());
		readCode(index);
	} else {
		codeInput[index].value('código invalido');
	}
}

function decodeGeneral() {
	// Decode the general code by dividing it into smaller abstractor codes
	for (let i=0;i<codesNum;i++) {
		let part = generalString.substr(i*codeLength,codeLength);
		codeArray[i] = stringToArray(part);
		codeInput[i].value(arrayToString(codeArray[i]));
		readCode(i);
	}
	select("#general_code_input").value(generateGeneralCode());
}

function readCode(index) {
	// Read the code by dividing it in subcodes
	imgs[index] = createGraphics(res,res);
	imgs[index].background(backColor);
	for (let i=0;i<shapes;i++) {
		const subCode = codeArray[index].slice(i * attributeNr, (1+i) * attributeNr);		
		createShapeImg(imgs[index],...subCode);
	}
	displayImages();
	select('#preview_img').attribute('src',getPreviewURL());
}

function displayImages() {
	// Display all the images redered from the abstractor codes
	// Used every time an aspect of the composition changes
	for (let i in imgs) {
		preview.image(imgs[i],imgsPos[i][0],imgsPos[i][1],canvasW/cols,canvasH/rows);
	}
}

function randomCode() {
	let rnd = ""
	for (let i=0;i<codesNum;i++) {
		for (let j=0;j<codeLength;j++) {
			rnd+=floor(random(10));
		}
	}
	return rnd
}
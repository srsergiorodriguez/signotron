let preview;
let cols = 4; // The number of columns displayed on the canvas
let rows = 4; // The number of rows displayed on the canvas
const maxTiles = 9;
let canvasW = 1920; // The width of the canvas
let canvasH; // The height of the canvas
let codesNum; // The number of images that fit in the whole canvas

let selectedCell;
let palUrl = "";

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
	select("#read_code_btn").hide();
	select("#random_code_btn").hide();
	select("#save_image_btn").hide();
	select("#copy_code_btn").hide();
	select("#erase_code_btn").hide();
	let tempX = cols;
	let tempY = rows;
	select('#x_tiles_input').input(function(){tempX = +this.value()});
	select('#y_tiles_input').input(function(){tempY = +this.value()});
	
	select('#tiles_btn').mouseClicked(()=>{
		const test = (v) => v > 0 && v <= maxTiles? true : false;
		let validX = test(tempX);
		let validY = test(tempY);
		if (validX && validY) {
			cols = tempX;
			rows = tempY;
			select("#app_container").show();
			select("#setup_container").hide();
			configApp();
		} else {
			alert(`Pon valores válidos para las baldosas horizontales (X) y verticales (Y). Ambos deben ser mayores a 0 y menores a ${maxTiles+1}`);
		}
	});
}

function setParameters() {
	let params = getURLParams();
	if (params.pal) {
		colors = palettes.hasOwnProperty(params.pal)?palettes[params.pal]:colors;
		palUrl = "/?pal="+params.pal;
	}
	if (params.background) {
		backColor = color(...params.background.split("_",3).map(x=>+x));
		console.log(backColor);
	}
	if (params.pos) {
		positionFormat = params.pos;
	}
}

function configApp() {
	createDiv("¡Cargando!").class("loading_screen").parent("loading_container");

	res = canvasW/cols;
	canvasH = res*rows;
	codesNum = cols*rows;

	createElement("iframe").id("abstractor_window").parent("abstractor_container").style("width","100%").style("height","175px")
			.attribute("src","../abstractormini"+palUrl);
	window.addEventListener("message", embeddingEvent, false);

	preview = createGraphics(canvasW,canvasH).id('preview');
	background(backColor);
  for (let i=0;i<codesNum; i++) {
  	codeArray[i] = resetCode();
		imgsPos[i] = [res*(i%cols),res*((i-(i%cols))/cols)];
		createCodeInput(i);
	}
	createGeneralCodeInput();
	cellHighlight();
}

function cellHighlight() {
	// Select cells, highlight them and send the code to abstractor iframe
	const abstractorIframe = document.getElementById("abstractor_window").contentWindow;
	createDiv().parent(select('#preview_container')).class("overlay").mouseClicked(function(e) {
		selectAll(".selected").map(d=>d.remove());
		const parentW = int(this.style("width").replace("px",""));
		const s = parentW / cols;
		const xindex = int(e.offsetX/ s);
		const yindex = int(e.offsetY / s);
		const x = xindex * s;
		const y = yindex * s;
		const newSelectedCell = (yindex * cols) + xindex;
		if (newSelectedCell !== selectedCell) {
			createDiv().class("selected").parent(this).style("width",s+"px").style("height",s+"px")
				.style("left",x+"px").style("top",y+"px");
				selectedCell = newSelectedCell;
				abstractorIframe.postMessage({message: "cellCode", value: codeArray[selectedCell]},"*");
		} else {
			selectedCell = undefined;
		}
	});
}

function embeddingEvent(event) {
	// Receive messages from abstractor iframe
	console.log(event.origin);
	if (event.origin !== "http://127.0.0.1:5500") {return}
	if (event.data.message === "abstractorCode") {
		if (selectedCell !== undefined) {
			codeInput[selectedCell].value(arrayToString(event.data.value));
			submitCode(selectedCell);
		}
	}
	if (event.data.message === "abstractorReady") {
		selectAll(".loading_screen").map(d=>d.remove());
	}
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
	const generalCodeInput = select("#general_code_input");
	if (generalCodeInput.value().length <= 0) {
		generalCodeInput.value(generateGeneralCode());
		generalString = randomCode();
	} else {
		generalString = generalCodeInput.value();
	}
	decodeGeneral();

	select("#read_code_btn").show().style("display","inline").mouseClicked(()=>{
		generalString = generalCodeInput.value();
		decodeGeneral();
	});

	select("#erase_code_btn").show().style("display","inline").mouseClicked(()=>{
		generalCodeInput.value(arrayToString(Array(generalString.length).fill(0)));
		generalString = generalCodeInput.value();
		decodeGeneral();
	});

	select("#random_code_btn").show().style("display","inline").mouseClicked(()=>{
		generalString = randomCode();
		decodeGeneral();
	});

	select("#save_image_btn").show().style("display","inline").mouseClicked(()=>{saveCanvas(preview,"motivo",'png')});

	select("#copy_code_btn").show().style("display","inline").mouseClicked(()=>{
		const copyText = document.getElementById("general_code_input");
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
	if (generalString.length < codeArray.length) {
		alert("El código es incorrecto para el número de celdas");
		return
	}
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
	// Display all the images rendered from the abstractor codes
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
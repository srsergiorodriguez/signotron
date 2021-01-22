let res = 450; // Default size of the canvas
const attributeKeys = ['shape','size','color','position','rotation'];
const shapes = 3; // Default number of shapes
const attributeNr = attributeKeys.length;
const codeLength = attributeNr*shapes;
const cmax = 10; // Base for the code
let code = Array(codeLength).fill(0); // Initial state of the code
let colors = palettes["a"];
let positionFormat = "a";
const rotationAngles = [0,45,90,135,180,225,270,315,45/2,225/2];

function createShapeImg(img,shape_,size_,color_,position_,rotation_) {
	// Create a shape based on a subcode
	if (position_==0) {
	} else {
		img.push();
		angleMode(DEGREES);
		img.angleMode(DEGREES);

		let pos;
		if (positionFormat==="b") {
			pos = position_===0?{}:{
				x:res/6*((Math.floor((position_-1)/3)*2)+1),
				y:res/6*((((position_-1)%3)*2)+1)
			};
		} else {
			pos = position_===0?{}:{
				x:res/2*((Math.floor((position_-1)/3))),
				y:res/2*((((position_-1)%3)))
			};
		}
		
		img.translate(pos.x,pos.y);

		//Define rotation
		if (rotation_<8) {
			img.rotate(rotationAngles[rotation_]);
		} else if (rotation_===8) {
			img.applyMatrix(-1,0,0,1,0,0);
		} else {
			img.applyMatrix(0,1,1,0,0,0);
		}
		
		//Define size
		size = map(size_,0,9,res/10,res);

		// Define color
		img.noStroke();
		c = color(colors[color_]);
		img.fill(c);

		// Define shape
		if (shape_==0) {
			//Circle
			img.ellipse(0,0,size,size);
		} else if (shape_==1) {
			//HalfCircle
			img.beginShape()
			for (let i=90;i<=270;i++) {
				let x = size/2*cos(i);
				let y = size/2*sin(i);
				img.vertex(x,y);
			}
			img.endShape();
		} else if (shape_==2) {
			//Ellipse
			img.ellipse(0,0,size/2,size);
		} else if (shape_==3) {
			//HalfEllipse
			img.beginShape()
			for (let i=90;i<=270;i++) {
				let x = size/4*cos(i);
				let y = size/2*sin(i);
				img.vertex(x,y)
			}
			img.endShape();
		} else if (shape_==4) {
			//Square
			img.rect(-(size/2),-(size/2), size, size);
		} else if (shape_==5) {
			//Rectangle
			img.rect(-((size/2)/2),-(size/2), size/2, size);
		} else if (shape_==6) {
			//Line
			img.rect(-((size/2)/8),-(size/2), size/8, size);
		} else if (shape_==7) {
			//Triangle
			img.triangle(-(size/2),(size/2),(size/2),(size/2),0,-(size/2));
		} else if (shape_==8) {
			//HalfTriangleLeft
			img.triangle(-(size/2),(size/2),0,(size/2),0,-(size/2));
		} else if (shape_==9) {
			//Triangle2
			img.triangle(-(size/2),(size/2),(size/2),(size/2),(size/2),-(size/2));
		} else {
		}
		img.pop();
	}
	return img;
}
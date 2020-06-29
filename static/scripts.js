var ctx, canvas, body, rect
var margin = 4, w = 4, h = 3, size = 100, focus_id = -1, oldPos, h_input, w_input, margin_input, size_input, w_input_origin = 3
var distanc = 50
var imgs = [], imgs_input = [[], [], []], id_input = [[], [], []]
var vectors = []
var vts = [[], [], []]
var img_res = new Image()

function drawLine(x1, x2, y1, y2){
	ctx.beginPath();
	ctx.moveTo(x1, x2);
	ctx.lineTo(y1, y2);
	ctx.stroke();
}
function drawRect(x, y, w, h){
	drawLine(x, y, x, y+h)
	drawLine(x, y, x+w, y)
	drawLine(x, y+h, x+w, y+h)
	drawLine(x+w, y+h, x+w, y)
}
function drawShape(){
	//ctx.beginPath();
	ctx.lineWidth = "2";
	drawRect(1, 1, w *size-2, h*size-2)
	drawRect(w*size + distanc + 1, 1, h*size -2, h*size-2)
	drawLine(w*size + distanc, size, w*size + size*h + distanc, size)
	drawLine(w*size + distanc, size*2, w*size + size*h + distanc, size*2)
	drawLine(w*size + distanc, size*3, w*size + size*h + distanc, size*3)
	ctx.font = "30px Arial";
	ctx.fillStyle = "#9e9e9e"
	ctx.fillText("Shape", w*size + distanc*3.1, size/1.7);
	ctx.fillText("Detail", w*size + distanc*3.1, size/1.7 + size);
	ctx.fillText("Color", w*size + distanc*3.1, size/1.7 + size*2);
	ctx.stroke();
}

function styleFocus(evt){
	p = getMousePos(canvas, evt)
	if (p.x>w*size + distanc && p.x<w*size+distanc+h*size)return Math.floor(p.y/size)
	return -1
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function getPosByIndex(i, input=false){
	if (input){
		return {
			"x": (i%w_input)*size_input + w*size + margin_input,
			"y": Math.floor(i/w_input)*size_input + margin_input
		}
	}
	return {
		"x": (i%w)*size + margin,
		"y": Math.floor(i/w)*size + margin
	}
}
function getIndexByPos(p, input=false){
	if (input){
		return w_input*(Math.floor(p.y/size_input)) + Math.floor((p.x-w*size)/size_input)
	}
	if(p.x>w*size) return -1;
	return w*(Math.floor(p.y/size)) + Math.floor(p.x/size)
}
function drawAllImages(){
	drawShape()
	for( let i=0;i<imgs.length;i++)
	{  
		imgPos = getPosByIndex(i)
		ctx.drawImage(imgs[i], imgPos.x, imgPos.y, size-margin*2, size-margin*2);
	}

	for(let style=0;style<3;style++){
		let nums = [3, 12, 48, 192, 768]
		let divs = [1, 2, 4, 8, 16]
		let count = 0;
		for (count = 0;count<nums.length;count++) if (nums[count]>=imgs_input[style].length) break;
		let sz = Math.floor(size/divs[count])
		let wi = h * divs[count]
		let hi = h * divs[count] / 3
		let mari = Math.floor(margin/divs[count])
		for(let i = 0;i<imgs_input[style].length;i++){
			pos = {
				"x": (i%wi)*sz + size*w + distanc + mari,
				"y": Math.floor(i/wi)*sz + style*size + mari
			}
			ctx.drawImage(imgs_input[style][i], pos.x, pos.y, sz-mari*2, sz-mari*2)
		}
	}

	ctx.drawImage(img_res, (w+w_input_origin)*size, 0, h*size, h*size)	
}
async function get_random_images(){
	$.ajax({
		url: '/get_random_images',
		type: 'POST',
		success: function (data) {
			images = data.images
			vectors = data.vectors
			imgs = []
			
			for(let i=0;i<images.length;i++) images[i] = document.URL+"/get_image/"+ images[i]
			for (let i=0;i<images.length;i++){
				var img = new Image()
				img.src = images[i]
				imgs.push(img)
				img.onload = function(){
					drawAllImages()
				}
				
			}
		},
		data: { "nums": w*h, "size": size - margin * 2 }
	});	
}
function init(){
	canvas = document.getElementById("pro-canvas")
	body = document.getElementById("body")
	//canvas.style.border = "2px solid"
	//canvas.style.backgroundColor = "gold"
	rect = canvas.getBoundingClientRect();
	ctx = canvas.getContext("2d")
	ctx.canvas.width  = size * w + distanc +  size*h;
	ctx.canvas.height = 512; 
}

async function canvas_load(){
	init()	
	await get_random_images()
	
	canvas.addEventListener('mouseup', function(evt){
		let p = getMousePos(canvas, evt)
		if (p.x<w*size) document.getElementById("pro-canvas").style.cursor = "grab";
		let s_id = styleFocus(evt)
		if (p.x>w*size + distanc && focus_id != -1 &&p.x<(w+h)*size + distanc	 && s_id != -1){
			var img = new Image()
			img.src = images[focus_id]
			img.onload = function(){
				drawAllImages()
			}
			imgs_input[s_id].push(img)
			vts[s_id].push(vectors[focus_id])
			submitStyles()
		}
		focus_id = -1
		drawAllImages()
	})
	canvas.addEventListener('mousedown', function(evt){
		let p = getMousePos(canvas, evt)
		if (p.x<w*size) document.getElementById("pro-canvas").style.cursor = "grabbing";
		focus_id = getIndexByPos(p)
		if (p.x<w*size) oldPos = p
	})
	canvas.addEventListener('mousemove', function(evt){
		temp = getMousePos(canvas, evt)
		if(temp.x>w*size && focus_id==-1){
			document.getElementById("pro-canvas").style.cursor = "default";
			index = getIndexByPos(temp, true)
		}else 
			if (focus_id==-1)document.getElementById("pro-canvas").style.cursor = "grab";
		if (focus_id == -1 || oldPos.x > w*size) return 
		img_pos = getPosByIndex(focus_id)
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawAllImages()
		if (styleFocus(evt)<3){
			ctx.fillStyle = "rgba(253, 240, 190, 0.57)";
			ctx.fillRect((w)*size+distanc, styleFocus(evt)*size, size*h, size); 
		}
		newPos = getMousePos(canvas, evt)
		img_pos = getPosByIndex(focus_id)
		delta = (newPos.x - oldPos.x, newPos.y - oldPos.y)
		drawPos = {
			"x": img_pos.x + newPos.x - oldPos.x,
			"y": img_pos.y + newPos.y - oldPos.y
		}
		ctx.drawImage(imgs[focus_id], drawPos.x, drawPos.y, size-margin*2, size-margin*2)
	})
	body.addEventListener('mouseup', function(evt){
		focus_id = -1
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawAllImages()
	})
}

async function submitStyles(){
	ans = [[], [], []]
	for (let k = 0;k<3;k++){
		if(vts[k].length==0)break
		for(let i=0; i<vts[k][0].length;i++){
			sum = 0
			for(let j =0;j<vts[k].length;j++){
				sum = sum + vts[k][j][i]
			}
			ans[k].push(sum/vts[k].length)
		}
	}
	$.ajax({
		url: '/get_image_by_vector',
		type: 'POST',
		success: function (data) {
			drawResult(data.image)
		},
		data: { "nums":ans}
	});	
}

async function btnRandomClick() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	await get_random_images()
}

async function drawResult(image){
	let cvas = document.getElementById("res-canvas")
	let img = new Image()
	img.src = image
	img.onload = function(){
		let context = cvas.getContext("2d")
		context.drawImage(img, 0, 0, 512, 512)
	}	
}
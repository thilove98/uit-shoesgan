var ctx, canvas, body, rect
var margin = 5, w = 7, h = 5, size = 80, focus_id = -1, oldPos, h_input, w_input, margin_input, size_input, w_input_origin = 3
var imgs = [], imgs_input = []
var vectors = []
var vts = []
var img_res = new Image()
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
function drawLine(x1, y1, x2, y2){
	ctx.beginPath();
	ctx.lineWidth = 2
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
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
	return w*(Math.floor(p.y/size)) + Math.floor(p.x/size)
}
function drawAllImages(){
	for( let i=0;i<imgs.length;i++)
	{  
		imgPos = getPosByIndex(i)
		ctx.drawImage(imgs[i], imgPos.x, imgPos.y, size-margin*2, size-margin*2);
		ctx.stroke();
	}

	count = Math.floor(Math.sqrt((Math.floor(imgs_input.length/(w_input_origin*h)))) +1)
	size_input = size/count
	margin_input = Math.floor(margin/count)
	w_input = w_input_origin * count
	h_input = h * count

	for( let i=0;i<imgs_input.length;i++)
	{  
		imgPos = getPosByIndex(i, true)
		ctx.drawImage(imgs_input[i], imgPos.x, imgPos.y, size_input-margin_input*2, size_input-margin_input*2);
		ctx.stroke();
	}
	ctx.drawImage(img_res, (w+w_input_origin)*size, 0, h*size, h*size)
	drawLine(w*size, 0, w*size, h*size)
	drawLine(w*size + w_input_origin*size, 0, w*size + w_input_origin*size, h*size)
	//drawLine(800, 0, 800, 200)
	//drawLine(600, 0, 600, 200)
}
async function get_random_images(){
	drawLine(w*size, 0, w*size, h*size)
	drawLine(w*size + w_input_origin*size, 0, w*size + w_input_origin*size, h*size)
	$.ajax({
		url: '/get_random_images',
		type: 'POST',
		success: function (data) {
			images = data.images
			vectors = data.vectors
			for(let i=0;i<images.length;i++) images[i] = document.URL+"/get_image/"+ images[i]
			for (let i=0;i<images.length;i++){
				var img = new Image()
				img.src = images[i]
				img.onload = function(){
					drawAllImages()
				}
				imgs.push(img)
			}
		},
		data: { }
	});	
}
function init(){
	canvas = document.getElementById("pro-canvas")
	body = document.getElementById("body")
	canvas.style.border = "2px solid"
	canvas.style.backgroundColor = "gold"
	rect = canvas.getBoundingClientRect();
	ctx = canvas.getContext("2d")
	ctx.canvas.width  = size * w + size * w_input_origin + size*h;
	ctx.canvas.height = size * h; 
}

async function canvas_load(){
	init()
	await get_random_images()
	body.addEventListener('mouseup', function(evt){
		focus_id = -1
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawAllImages()
	})
	canvas.addEventListener('mouseup', function(evt){
		let p = getMousePos(canvas, evt)
		if(p.x<w*size&&p.x<(w+w_input_origin)*size)
			document.getElementById("pro-canvas").style.cursor = "grab";
		if (p.x>w*size && focus_id != -1 &&p.x<(w+w_input_origin)*size){
			var img = new Image()
			img.src = images[focus_id]
			img.onload = function(){
				drawAllImages()
			}
			imgs_input.push(img)
			vts.push(vectors[focus_id])
			submitStyles()
		}
		focus_id = -1
		drawAllImages()
	})
	canvas.addEventListener('mousedown', function(evt){
		let p = getMousePos(canvas, evt)
		if (p.x>w*size && p.x<(w+w_input_origin)*size) {
			index = getIndexByPos(p, true)
			imgs_input.splice(index, 1)
			vts.splice(index, 1)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			drawAllImages()
			if(imgs_input.length>0) submitStyles()
			focus_id = -1
			return
		}
		if (p.x<w*size)
		document.getElementById("pro-canvas").style.cursor = "grabbing";
		focus_id = getIndexByPos(p)
		oldPos = p
	})
	canvas.addEventListener('mousemove', function(evt){
		temp = getMousePos(canvas, evt)
		if(temp.x>w*size){
			document.getElementById("pro-canvas").style.cursor = "default";
			index = getIndexByPos(temp, true)
			if(index<imgs_input.length && temp.x<(w+w_input_origin)*size)
				document.getElementById("pro-canvas").style.cursor = "not-allowed";
		}else 
		if (focus_id==-1)document.getElementById("pro-canvas").style.cursor = "grab";
		if (focus_id == -1 || oldPos.x > w*size) return 
		
		img_pos = getPosByIndex(focus_id)
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawAllImages()
		newPos = getMousePos(canvas, evt)
		img_pos = getPosByIndex(focus_id)
		delta = (newPos.x - oldPos.x, newPos.y - oldPos.y)
		drawPos = {
			"x": img_pos.x + newPos.x - oldPos.x,
			"y": img_pos.y + newPos.y - oldPos.y
		}
		ctx.drawImage(imgs[focus_id], drawPos.x, drawPos.y, size-margin*2, size-margin*2)
	})
}

async function submitStyles(){
	ans = []
	//console.log(vts)
	for(let i=0; i<vts[0].length;i++){
		sum = 0
		for(let j =0;j<vts.length;j++){
			sum = sum + vts[j][i]
		}
		ans.push(sum/vts.length)
	}
	$.ajax({
		url: '/get_image_by_vector',
		type: 'POST',
		success: function (data) {
			img_res.src = data.image
			img_res.onload = function(){drawAllImages()}
		},
		data: {"name": ans}
	});	
}

async function btnRandomClick() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	await get_random_images()
}

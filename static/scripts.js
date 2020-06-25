function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

var ctx, canvas
var margin = 5, w = 7, h = 5, size = 80, focus_id = -1, oldPos, h_input, w_input, margin_input, size_input, w_input_origin = 3
var imgs = [], imgs_input = []

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
		return w_input*(Math.floor(p.y/size_input)) + Math.floor((p.x-w*size_input)/size_input)
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
	drawLine(w*size, 0, w*size, h*size)
	//drawLine(800, 0, 800, 200)
	//drawLine(600, 0, 600, 200)
}

async function canvas_load(images){
	console.log(document.URL)
	canvas = document.getElementById("pro-canvas")
	body = document.getElementById("body")
	canvas.style.border = "2px solid"
	canvas.style.backgroundColor = "gold"
	rect = canvas.getBoundingClientRect();
	ctx = canvas.getContext("2d")
	ctx.canvas.width  = size * w + size * w_input_origin;
	ctx.canvas.height = size * h; 
	images = images.split(' ')
	for(let i=0;i<images.length-1;i++) images[i] = document.URL+"/get_image/"+images[i]
	//for	(let i of images)console.log(i)
	for (let i=0;i<=images.length-1;i++){
		var img = new Image()
		img.src = images[i]
		img.onload = function(){
			drawAllImages()
		}
		imgs.push(img)
	}
	body.addEventListener('mouseup', function(evt){
		focus_id = -1
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawAllImages()
	})
	canvas.addEventListener('mouseup', function(evt){
		let p = getMousePos(canvas, evt)
		if (p.x>w*size && focus_id != -1){
			var img = new Image()
			img.src = images[focus_id]
			img.onload = function(){
				drawAllImages()
			}
			imgs_input.push(img)
		}
		focus_id = -1
		drawAllImages()
	})
	canvas.addEventListener('mousemove', function(evt){
		let x = document.getElementById("xPos")
		let y = document.getElementById("yPos")
		let p = getMousePos(canvas, evt)
		x.innerHTML = p.x
		y.innerHTML = p.y
	})
	canvas.addEventListener('mousedown', function(evt){
		let p = getMousePos(canvas, evt)
		if (p.x>w*size) return
		let rl = document.getElementById("rl")
		var id = getIndexByPos(p)
		focus_id = id
		rl.innerHTML = focus_id
		oldPos = p
	})
	canvas.addEventListener('mousemove', function(evt){
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

function submit() {
	var latent = []
	for (let i = 0; i < LATENT_SIZE; i++) {
		latent.push($("#slid_" + i.toString()).val())
	}
	$.ajax({
		url: '/submit_latent_vector',
		type: 'POST',
		success: function (data) {
			document.getElementById("sample").src = data.image
		},
		data: { "latent": latent }
	});
}
function sampleClick(name, type, image_link) {
	var t = (this.id);
	for (let i in type.sample) {
		item_name = type.sample[i].name
		if (item_name == name) document.getElementById(name).style.borderColor = "blue";
		else document.getElementById(item_name).style.borderColor = "white";
	}

	console.log("input" + type.type)
	document.getElementById("input" + type.type).src = image_link;

	$.ajax({
		url: '/submit_sample',
		type: 'POST',
		success: function (data) {
			document.getElementById("main-image").src = data.image
		},
		data: { "sample_name": 1 }
	});	
}
function btnRandomClick() {
	//let temp = getRandomInt(64000)
	//submit()
}





//document.body.scrollTop = 0;
	//document.documentElement.scrollTop = 0;
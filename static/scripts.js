function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

var ctx, canvas

function drawLine(x1, y1, x2, y2){
	ctx.beginPath();
	ctx.lineWidth = 4
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

async function canvas_load(images){
	canvas = document.getElementById("pro-canvas")
	rect = canvas.getBoundingClientRect();

	ctx = canvas.getContext("2d")
	
	images = images.split(' ')

	for( let i=0;i<images.length-1;i++)
	{
		var img = new Image()
		img.src = await images[i];   
		margin = 5
		ctx.drawImage(img, (i%7)*80 + margin, Math.floor(i/7)*80 + margin, 70, 70);
		//ctx.stroke();
	}
	

	drawLine(800, 0, 800, 200)
	drawLine(600, 0, 600, 200)
	canvas.addEventListener('mousemove', function(evt){
		let x = document.getElementById("xPos")
		let y = document.getElementById("yPos")
		let p = getMousePos(canvas, evt)
		x.innerHTML = p.x
		y.innerHTML = p.y
	})
}

function canvas_onmousemove(){
	
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
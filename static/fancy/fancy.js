labels = ['Boat Shoes', 'Boots', 'Clogs & Mules', 'Crib Shoes', 'Flats', 'Heels', 'Loafers', 'Oxfords', 'Sandals', 'Slippers', 'Sneakers & Athletic Shoes']
styles = {
    "Shape": "",
    "Detail": "",
    "Color": ""
}
size = 80
focusId = ""
function addSample(src, name=""){
    let tempImg = document.createElement("img")
    tempImg.src = src
    tempImg.name = name
    tempImg.id = name
    tempImg.width = size
    tempImg.height = size
    tempImg.draggable = true;
    tempImg.ondragstart = function(event){
        focusId = event.target.id
    }
    tempImg.onload = function(){
        document.getElementById("samples").appendChild(tempImg)
    }
}

function allowDrop(event){
    event.preventDefault();
}

function drop(ev) {
    //ev.preventDefault();
    let temp = document.createElement("img")
    console.log(ev.target.id)
    temp.height = size
    temp.width = size
    temp.src = document.getElementById(focusId).src
    temp.id = ev.target.id
    styles[temp.id] = []
    console.log(styles)
    temp.onload = function(){
        ev.target.innerHTML = ""
        ev.target.appendChild(temp);
    }
    document.getElementById("Shape").innerHTML = ""
}

function load(){
    for(let i=0;i<labels.length;i++){
        var btn = document.createElement("BUTTON");
        btn.innerHTML = labels[i];
        btn.id = i.toString();
        btn.className = "myButton"
        document.getElementById("tags_type").appendChild(btn);
    }
    
    for(let i=0;i<3;i++){
        addSample("https://www.w3schools.com/images/colorpicker.gif", i.toString() + "x")
    }
}

load()
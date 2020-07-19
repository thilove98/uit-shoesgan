//labels = ['Boat Shoes', 'Boots', 'Clogs & Mules', 'Crib Shoes', 'Flats', 'Heels', 'Loafers', 'Oxfords', 'Sandals', 'Slippers', 'Sneakers & Athletic Shoes']
labels = ['black', 'blue', 'boots', 'brown', 'buckle', 'clog', 'flats', 'gray', 'heel', 'high', 'lace', 'low', 'middle', 'normal', 'oxford', 'pink', 'red', 'sandal', 'sandle', 'slipper', 'sneaker', 'sneakers', 'strap', 'white', 'yellow', 'zipper']
imgCode = {}
styles = {
    "sha": "",
    "det": "",
    "col": ""
}
size = 80
focusId = ""
url = document.URL

function makeid(length){
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function addSample(src, name=""){
    let tempImg = document.createElement("img")
    tempImg.src = src
    tempImg.name = name
    tempImg.id = name
    tempImg.width = size
    tempImg.height = size
    tempImg.draggable = true
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
    let idCon = ev.target.id
    let container = document.getElementById(idCon.substring(0, 3))
    container.innerHTML = ""
    let temp = document.createElement("img")
    temp.height = size -6
    temp.width = size -6
    temp.src = document.getElementById(focusId).src
    temp.id = idCon + 'img'
    container.appendChild(temp)
    styles[idCon.substring(0, 3)] = focusId
}
async function getVectorsByLabels(labels){
    var formData = JSON.stringify({"labels": labels});
    return await $.ajax({
        type: "POST",
        url: url + "/get_style_from_label",
        data: formData,
        success: function(data){
            return
        },
        dataType: "json",
        contentType : "application/json"
    });
}

async function getImageByVectors(shape, detail, color){
    var formData = JSON.stringify({"Shape": shape, "Detail": detail, "Color": color});
    return await $.ajax({
        type: "POST",
        url: url + "/get_images_from_styles",
        data: formData,
        success: function(data){
            return data
        },
        dataType: "json",
        contentType: "application/json"
    });
}

async function getRandomImages(num_images) {
    var formData = JSON.stringify({"num_images": num_images});
    return await $.ajax({
        type: "POST",
        url: url + "/get_style_from_random",
        data: formData,
        success: function(data) {
            return data;
        },
        dataType: "json",
        contentType: "application/json",
    });
}

async function btnRandom() {
    let num_images = 4;
    data = await getRandomImages(num_images);
    vectors = data.vectors    
    for (let i=0; i<num_images; ++i) {
        data = await getImageByVectors(vectors[i], vectors[i], vectors[i]);
        name = makeid(10);
        imgCode[name] = vectors[i];
        addSample("data:image/jpeg;base64,"+data.image, name);
    }

}

async function btnSubmit(){
    shape = imgCode[styles['sha']]
    detail = imgCode[styles['det']]
    color = imgCode[styles['col']]
    let arr = [shape, detail, color]
    conOutput = document.getElementById('output')
    conOutput.innerHTML = ""
    for(let i = 0; i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++){
        data = await getImageByVectors(arr[i], arr[j], arr[k])
        let temp = document.createElement("img")
        temp.src = "data:image/jpeg;base64," + data.image
        temp.width = size
        temp.height = size
        temp.ondblclick = async function(){
            conOut = document.getElementById('output1')
            conOut.innerHTML = ""
            let temp = document.createElement("img")
            temp.src = this.src
            temp.width = 400 - 6
            temp.height = 400 - 6
            temp.onload = function(){
            conOut.appendChild(temp)
        }
        }
        temp.onload = function(){
            conOutput.appendChild(temp)
        }
    }
}

function load(){
    for(let i=0;i<labels.length;i++){
        var btn = document.createElement("BUTTON");
        btn.innerHTML = labels[i];
        btn.id = i.toString();
        btn.className = "myButton"
        btn.onclick = async function(){
            let label = parseInt(this.id)
            data = await getVectorsByLabels([label, label, label, label])
            vectors = data.vectors
            for(let i = 0; i<vectors.length;i++){
                data = await getImageByVectors(vectors[i], vectors[i], vectors[i])
                name = makeid(10)
                imgCode[name] = vectors[i]
                addSample("data:image/jpeg;base64,"+data.image, name)
            }
        }
        document.getElementById("tags_type").appendChild(btn);
    }
}
load()

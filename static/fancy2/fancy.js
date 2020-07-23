//labels = ['Boat Shoes', 'Boots', 'Clogs & Mules', 'Crib Shoes', 'Flats', 'Heels', 'Loafers', 'Oxfords', 'Sandals', 'Slippers', 'Sneakers & Athletic Shoes']
//labels = ['black', 'blue', 'boots', 'brown', 'buckle', 'clog', 'flats', 'gray', 'heel', 'high', 'lace', 'low', 'middle', 'normal', 'oxford', 'pink', 'red', 'sandal', 'sandle', 'slipper', 'sneaker', 'sneakers', 'strap', 'white', 'yellow', 'zipper']
labels = ['Boat Shoes', 'Boots', 'Clogs & Mules', 'Crib Shoes', 'Flats', 'Heels', 'Loafers', 'Oxfords', 'Sandals', 'Slippers', 'Sneakers & Athletic Shoes'];
imgCode = {};
NUM_OUTPUT_IMAGES = 4;
prev_imgs = [];

styles = {
    "sha": "",
    "det": "",
    "col": ""
};
size = 400;
focusId = "";
url = document.URL;

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
    let canvas = document.getElementById("samples");
    let tempImg = document.createElement("img");
    tempImg.src = src;
    tempImg.name = name;
    tempImg.id = name;

    let size = Math.min(canvas.offsetHeight, canvas.offsetWidth);
    tempImg.width = size - 3;
    tempImg.height = size - 3;
    tempImg.draggable = true;
    tempImg.ondragstart = function(event){
        focusId = event.target.id;
    }
    tempImg.onload = function(){
        if (canvas.hasChildNodes) {
            prev_imgs.push(canvas.childNodes[0]);
        }
        canvas.innerHTML = "";
        canvas.appendChild(tempImg);
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

function getVectorsFromPredefined(){
    return $.ajax({
        type: "GET",
        url: url +  "/load_predefined_styles",
        async: false,
        success: function(data) {
            return data;
        },
        dataType: "json",
        contentType : "application/json"
    }).responseJSON;
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

async function getImageByVectors(vectors){
    var formData = JSON.stringify({"vectors": vectors});
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

async function getImageByMixing(input_style, mix_style, weight, level) {
    var formData = JSON.stringify({"input_style": input_style, "mix_style": mix_style, "weight": weight, "level": level});
    return await $.ajax({
        type: "POST",
        url: url + "/get_images_from_styles_mixing",
        data: formData,
        success: function(data) {
            return data;
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
    let num_images = 1;
    data = await getRandomImages(num_images);
    vectors = data.vectors    
    for (let i=0; i<num_images; ++i) {
        data = await getImageByVectors([vectors[i], vectors[i], vectors[i]]);
        name = makeid(10);
        imgCode[name] = [vectors[i], vectors[i], vectors[i]];
        addSample("data:image/jpeg;base64," + data.image, name);
    }
}

async function btnBack() {
    if (prev_imgs.length > 0) {
        let canvas = document.getElementById("samples");
        let img = prev_imgs.pop();
        canvas.innerHTML = "";
        canvas.appendChild(img);
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
        var btn = document.createElement("button");
        btn.innerHTML = labels[i];
        btn.id = i.toString();
        btn.type = "button";
        btn.className = "btn btn-primary";
        btn.onclick = async function(){
            data = await getVectorsByLabels([labels[i]])
            vectors = data.vectors;
            for(let i = 0; i<vectors.length;i++){
                data = await getImageByVectors([vectors[i], vectors[i], vectors[i]]);
                name = makeid(10);
                imgCode[name] = [vectors[i], vectors[i], vectors[i]];
                addSample("data:image/jpeg;base64," + data.image, name);
            }
        }
        document.getElementById("tags_type").appendChild(btn);
    }
}

function addStyle(src, name, style_name, level) {
    let img_div = document.createElement("div");
    img_div.id = "style_pick";
    let text = document.createElement("span");
    text.innerHTML = style_name;
    text.id = "style_text";

    let img = document.createElement("img");
    img.src = src;
    img.name = name;
    img.id = "style_img";
 
    img.width = 120;
    img.height = 120;
    img.onload = function() {
        img_div.appendChild(text);
        img_div.appendChild(img);
        document.getElementById("style-list").appendChild(img_div);
    }

    img.ondblclick = async function() {
        var canvas = document.getElementById("samples");
        outcanvas = document.getElementById("output1");
        outcanvas.innerHTML = "";
        let WEIGHT = [1, 2, 3, 100000000]

        for (let i=0; i<NUM_OUTPUT_IMAGES; i++) {
            let weight = WEIGHT[i];
            //let weight = (i + 1) / 2;
            if (canvas.hasChildNodes) {
                input_img = canvas.childNodes[0];
                data = await getImageByMixing(imgCode[input_img.name], imgCode[img.name], weight, level);
                outputImg = document.createElement("img");
                outputImg.id = "output_imgs";
                name = makeid(10);
                outputImg.name = name;
                imgCode[name] = data.vectors;

                outputImg.src = "data:image/jpeg;base64," + data.image;
                let size = Math.min(outcanvas.offsetHeight, outcanvas.offsetWidth) / Math.sqrt(NUM_OUTPUT_IMAGES) - 3
                outputImg.width = size;
                outputImg.height = size;
                
                outputImg.onload = function() {
                    outcanvas.appendChild(outputImg);
                }
                outputImg.ondblclick = async function() {
                    addSample(this.src, this.name);

                }
            }
        }
    }
   
}
function loadStyleList() {
    style_data = getVectorsFromPredefined();
    vectors = style_data.vectors;
    styles = style_data.styles;
    levels = style_data.levels;

    for (let i=0; i<vectors.length; i++) {
        data = getImageByVectors([vectors[i], vectors[i], vectors[i]]);

        name = makeid(10);
        imgCode[name] = [vectors[i], vectors[i], vectors[i]];

        Promise.resolve(data).then(function(value) {
            src = "data:image/jpeg;base64," + value.image;
            addStyle(src, name, styles[i], levels[i]);

        });


    }
    
}

load();

loadStyleList();

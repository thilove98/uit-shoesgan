//labels = ['Boat Shoes', 'Boots', 'Clogs & Mules', 'Crib Shoes', 'Flats', 'Heels', 'Loafers', 'Oxfords', 'Sandals', 'Slippers', 'Sneakers & Athletic Shoes']
//labels = ['black', 'blue', 'boots', 'brown', 'buckle', 'clog', 'flats', 'gray', 'heel', 'high', 'lace', 'low', 'middle', 'normal', 'oxford', 'pink', 'red', 'sandal', 'sandle', 'slipper', 'sneaker', 'sneakers', 'strap', 'white', 'yellow', 'zipper']
labels = ['Boat Shoes', 'Boots', 'Clogs & Mules', 'Crib Shoes', 'Flats', 'Heels', 'Loafers', 'Oxfords', 'Sandals', 'Slippers', 'Sneakers & Athletic Shoes'];
imgCode = {};
NUM_OUTPUT_IMAGES = 1;
prev_imgs = [];
style_src = {};

CLICK = false
style_mixing = null;
style_list = null;

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

function create_generated_output() {
    let output_region = document.getElementById("generated_output");
    if (output_region.innerHTML == "") {
        console.log("hahaha");

        let h5 = document.createElement("h5");
        h5.innerHTML = "GENERATED SHOE";

        let myoutput = document.createElement("div");
        myoutput.className = "myOutput";

        let mybutton = document.createElement("button");
        mybutton.className = "btn btn-danger"
        mybutton.onclick = async function {
            if (prev_imgs.length > 0) {
                let canvas = document.getElementById("samples");
                let img = prev_imgs.pop();
                canvas.innerHTML = "";
                if (img != null)
                    canvas.appendChild(img);
                if (img == null)
                    document.getElementById("style-region").innerHTML = "";
                }
            }

        
        let arrow = document.createElement("i");
        arrow.className = "fa fa-arrow-left";
        mybutton.appendChild(arrow);

        let samples = document.createElement("div");
        samples.id = "samples";
        samples.className = "output";
        
        myoutput.appendChild(mybutton);
        myoutput.appendChild(samples);
        output_region.appendChild(h5);
        output_region.appendChild(myoutput);
    }


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

        var style_region = document.getElementById("style-region");
        if (style_region.innerHTML == "") {
            style_region.appendChild(style_mixing);
        }
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
        if (img != null)
            canvas.appendChild(img);
        if (img == null)
            document.getElementById("style-region").innerHTML = "";
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

function load2() {
    var tags = document.getElementById("tags_type");
    var dropdown = document.createElement("div");
    dropdown.className = "dropdown-menu";
    for(var i=0;i<labels.length;i++){
        var dropdown_item = document.createElement("a");
        dropdown_item.className = "dropdown-item";
        dropdown_item.innerHTML = labels[i].bold();
        dropdown_item.id = labels[i];
        dropdown.appendChild(dropdown_item);
        var line = document.createElement("div");
        line.className = "dropdown-divider";
        if (i != labels.length - 1)
            dropdown.appendChild(line);
        
        dropdown_item.onclick = async function() {
            data = await getVectorsByLabels([this.id])
            vectors = data.vectors;
            for(let i = 0; i<vectors.length;i++){
                data = await getImageByVectors([vectors[i], vectors[i], vectors[i]]);
                name = makeid(10);
                imgCode[name] = [vectors[i], vectors[i], vectors[i]];
                addSample("data:image/jpeg;base64," + data.image, name);
            }
        }
    }
    tags.appendChild(dropdown);
}

function addStyle(src, name, style_name, level) {
    let dropdown_item = document.createElement("div");
    dropdown_item.className = "dropdown-item";

    let img_div = document.createElement("div");
    img_div.id = "style_pick";
    let text = document.createElement("span");
    text.innerHTML = style_name;
    text.id = "style_text";

    let img = document.createElement("img");
    img.src = src;
    img.name = name;
    img.id = "style_img";
 
    img.width = 80;
    img.height = 80;
    img.onload = function() {
        img_div.appendChild(text);
        img_div.appendChild(img);
        dropdown_item.appendChild(img_div);
        style_list.appendChild(dropdown_item);
    }

    dropdown_item.onclick = async function() {
        if (CLICK == true) {
            return;
        }
        CLICK = true;
        let canvas = document.getElementById("samples");
        for (let i=0; i<NUM_OUTPUT_IMAGES; i++) {
            let weight = (i + 9) * 3 / NUM_OUTPUT_IMAGES;
            if (canvas.hasChildNodes) {
                input_img = canvas.childNodes[0];
                if (input_img == null) {
                    CLICK = false;
                    return;
                }
                data = await getImageByMixing(imgCode[input_img.name], imgCode[img.name], weight, level);
                outputImg = document.createElement("img");
                outputImg.id = "output_imgs";
                name = makeid(10);
                outputImg.name = name;
                imgCode[name] = data.vectors;

                outputImg.src = "data:image/jpeg;base64," + data.image;
                let size = Math.min(canvas.offsetHeight, canvas.offsetWidth) / Math.sqrt(NUM_OUTPUT_IMAGES) - 3
                outputImg.width = size;
                outputImg.height = size;
                
                outputImg.onload = async function() {
                    addSample(this.src, this.name);

                }
            }
        }
        CLICK = false;
    }
   
}

function loadStyleList() {
    style_mixing = document.createElement("div");
    style_mixing.className = "dropright";
    style_mixing.innerHTML = '<button class="btn btn-secondary dropdown-toggle" type="button" id="random-button" data-toggle="dropdown">STYLE MIXING</button>'
    style_mixing.id = "style-mixing";

    style_list = document.createElement("div");
    style_list.className = "dropdown-menu";
    style_list.id = "style-list";
    style_mixing.appendChild(style_list);
    
    style_data = getVectorsFromPredefined();
    vectors = style_data.vectors;
    styles = style_data.styles;
    levels = style_data.levels;

    for (let i=0; i<vectors.length; i++) {
        data = getImageByVectors([vectors[i], vectors[i], vectors[i]]);

        Promise.resolve(data).then(function(value) {
            src = "data:image/jpeg;base64," + value.image;
            name = makeid(10);
            imgCode[name] = [vectors[i], vectors[i], vectors[i]];
            addStyle(src, name, styles[i], levels[i]);

        });

    }
    
}   

load2();
create_generated_output();
loadStyleList();

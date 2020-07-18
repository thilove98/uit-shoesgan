
IMG_SIZE = 400;
MINI_SIZE = 80;

url = document.URL;

async function getRandomImage() {
    return await $.ajax({
        type: "GET",
        url: url + "/random_image",
        dataType: "json",
        contentType: "application/json"
    });
}

async function btnRandomImages(text) {
    block = document.getElementById(text);
    block.innerHTML = "";

    width = block.offsetWidth
    height = block.offsetHeight

    num_images = width * height / MINI_SIZE / MINI_SIZE

    buttons = document.getElementsByTagName("button");
    for (let i=0; i<buttons.length; ++i) {
        buttons[i].disabled = true;
        buttons[i].style.cursor = "not-allowed";
    }
    for(let i=0; i<num_images; ++i){
        data = await getRandomImage();
        let img = document.createElement("img");
        img.id = text + i.toString();
        img.src = "data:image/jpeg;base64," + data.image;
        img.width = MINI_SIZE;
        img.height = MINI_SIZE;
        img.onload = function() {
            block.appendChild(img);
        }
        img.onclick = function(e) {
            if (text === "output") {
                buttons = document.getElementsByTagName("button");
                for (let i=0; i<buttons.length && i < 1; ++i) {
                    if (buttons[i].disabled != true) {
                        new_block = document.getElementById(e.target.id.substring(0, 6));
                        new_block.innerHTML = "";
                        e.target.width = 512;
                        e.target.height = 512
                        new_block.appendChild(img);
                    }
                }
            }
        }
    }
    for (let i=0; i<buttons.length; ++i) {
        buttons[i].disabled = false;
        buttons[i].style.cursor = "pointer";
    }

}



import os
import random
import pickle
from PIL import Image
from flask import Flask, Markup, request, render_template, url_for, jsonify, send_file
import base64
from io import BytesIO
import json
from gen import *
import binascii
import struct
import io
import string

app = Flask(__name__, template_folder='static')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def img2str(img):
    rawBytes = BytesIO()
    img.save(rawBytes, "PNG")
    rawBytes.seek(0)  # return to the start of the file
    return base64.b64encode(rawBytes.read()).decode('utf-8')

def id_generator(size=10, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

with open('latents.json') as json_file:
    sample_latent = json.load(json_file)

table = []
img_path = ["Shape", "Detail", "Color"]
imgs = get_random_images(25, (70, 70))

@app.route("/get_image_by_vector", methods=['POST'])
def vector_request():
    data = request.form.to_dict(flat=False)
    vector = data["name[]"]
    vector = np.array([float(i) for i in vector])
    image = "data:image/jpeg;base64," + img2str(style_to_image(vector, vector, vector))
    return {"image": image}
    

for img_type in img_path:
    a = dict()
    a['type'] = img_type
    a['sample'] = []
    img_name_path = os.listdir("images/" + img_type)
    for name in img_name_path:
        im = Image.open(os.path.join('images', img_type, name))
        im = im.resize((69, 69))
        name = name.replace("_fake", "")
        name = name.replace(".png", "")
        img = "data:image/png;base64," + img2str(im)
        a['sample'].append({"image": img, "name": name})
    table.append(a)

@app.route("/get_random_images", methods=['POST'])
def getranimg():
    global imgs
    imgs = get_random_images(35, (70, 70))
    data = request.form.to_dict(flat=False)
    images = []
    vectors = []
    for img, vector, index in imgs:
        images.append(index)
        vector = [float(i) for i in vector]
        vectors.append(vector)
    return {"images": images, "vectors": vectors}

@app.route('/promix/get_image/<name>')
def get_image(name):
    for i in imgs:
        if i[2] == name:
            img = i[0]
            break
    file_object = io.BytesIO()
    img.save(file_object, 'PNG')
    file_object.seek(0)
    return send_file(file_object, mimetype='image/PNG')

@app.route("/promix", methods=['POST', 'GET'])
def promix():
    return render_template("promix.html")

@app.route("/", methods=['POST', 'GET'])
def home():
    data = request.args.get('sample_image')
    latent = None
    if data is not None:
        latent = sample_latent[data][0]
    return render_template("index.html",
                        table = table,
                        image="127.0.0.1:5000" + '/get_image/' + id_generator() )

@app.route("/submit_latent_vector", methods=['POST'])
def changeImage():
    data = request.form.to_dict(flat=False)
    #latent = data["latent[]"]
    #latent = np.array([float(i) for i in latent])
    return {"image": "data:image/png;base64," + img2str(style_to_image())}

@app.route("/submit_sample", methods=['POST'])
def sample_request():
    return {"image": "data:image/png;base64," + img2str(style_to_image((255, 0, 0))) } 
    data = request.form.to_dict(flat=False)
    name = data['sample_name'][0]
    index = sample_latent[name]
    indices = [index, index, index]
    

if __name__ == "__main__":
    app.run(debug=True, port=5000)

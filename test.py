import os
import random
import pickle
from PIL import Image
from flask import Flask, Markup, request, render_template, url_for, jsonify
import base64
from io import BytesIO
import json
from gen_test import *
import binascii
import struct


app = Flask(__name__, template_folder='static')

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0



def img2str(img):
    rawBytes = BytesIO()
    img.save(rawBytes, "PNG")
    rawBytes.seek(0)  # return to the start of the file
    return base64.b64encode(rawBytes.read()).decode('utf-8')


with open('latents.json') as json_file:
    sample_latent = json.load(json_file)

table = []
img_path = ["Shape", "Detail", "Color"]
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

@app.route("/promix", methods=['POST', 'GET'])
def promix():
    data = request.args.get('sample_image')
    latent = None
    if data is not None:
        latent = sample_latent[data][0]
    img = "data:image/png;base64," + img2str(style_to_image())
    s = ''
    for i in range(5*7):
        s = s + img + ' '
    return render_template("promix.html", table = table, images = s)

@app.route("/", methods=['POST', 'GET'])
def home():
    data = request.args.get('sample_image')
    latent = None
    if data is not None:
        latent = sample_latent[data][0]
    return render_template("index.html",
                        table = table,
                        image="data:image/png;base64," + img2str(style_to_image()) )

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

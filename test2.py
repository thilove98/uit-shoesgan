import os
import random
import pickle
from PIL import Image
from flask import Flask, Markup, request, render_template, url_for, jsonify, send_file
import base64
from io import BytesIO
import json
from gen_test2 import *
import binascii
import struct
import io
import string

app = Flask(__name__, template_folder=os.path.join('static', 'fancy3'))
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def img2str(img):
    rawBytes = BytesIO()
    img.save(rawBytes, "PNG")
    rawBytes.seek(0)
    return base64.b64encode(rawBytes.read()).decode('utf-8')

@app.route("/get_images_from_styles", methods=['POST', 'GET'])
def stl2img():
    data = request.json
    vectors = data['vectors']
    img = get_images_from_styles(vectors)
    return jsonify({"image": img2str(img)})

@app.route("/get_images_from_styles_mixing", methods=['POST', 'GET'])
def stlm2img():
    data = request.json
    input_style = np.array(data['input_style'])
    mix_style = np.array(data['mix_style'])
    weight = data['weight']
    level = data['level']
    img, vectors = get_images_from_styles_mixing(input_style, mix_style, weight=weight, level=level)

    vectors = [[float(i) for i in vector] for vector in vectors]

    return jsonify({"image": img2str(img), "vectors": vectors})

@app.route("/get_style_from_label", methods=['POST', 'GET'])
def lal2stys():
    data = request.json
    labels = np.array(data["labels"])
    vectors = get_style_from_label(labels)
    vectors = [[float(i) for i in vector] for vector in vectors]
    return jsonify({"vectors": vectors})


@app.route("/get_style_from_random", methods=['POST', 'GET'])
def rnd2stl():
    data = request.json
    n_samples = np.array(data["num_images"])
    vectors = get_style_from_random(n_samples)
    vectors = [[float(i) for i in vector] for vector in vectors]
    return jsonify({"vectors": vectors})

@app.route("/load_predefined_styles", methods=['GET'])
def load_predefined_styles():
    latents, styles, levels = get_style_from_index()
    latents = [[float(i) for i in latent] for latent in latents]
    return jsonify({"vectors": latents, "styles": styles, "levels": levels})

@app.route("/", methods=['POST', 'GET'])
def home():
    return render_template("fancy.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)

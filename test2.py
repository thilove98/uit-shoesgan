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

app = Flask(__name__, template_folder=os.path.join("static", "test2"))
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def img2str(img):
    rawBytes = BytesIO()
    img.save(rawBytes, "PNG")
    rawBytes.seek(0) 
    return base64.b64encode(rawBytes.read()).decode('utf-8')

@app.route("/get_images_from_styles", methods=['POST', 'GET'])
def stl2img():
    data = request.json
    shape = np.array(data['Shape'])
    detail = np.array(data['Detail'])
    color = np.array(data['Color'])
    img = get_images_from_styles(shape, detail, color)
    return jsonify({"image": img2str(img)})

@app.route("/get_style_from_label", methods=['POST', 'GET'])
def lal2stys():
    data = request.json
    labels = np.array(data["labels"])
    vectors = get_style_from_label(labels)
    vectors = [[i for i in vector] for vector in vectors]
    return jsonify({"vectors": vectors})


@app.route("/random_image", methods=['POST', 'GET'])
def random_image():
    image, latent = get_random_image()
    latent = latent.tolist()
    return jsonify({"image": img2str(image), "latent": latent})

@app.route("/", methods=['POST', 'GET'])
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
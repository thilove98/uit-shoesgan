import os
import random
import pickle
from PIL import Image
from flask import Flask, Markup, request, render_template, url_for, jsonify, send_file
import base64
from io import BytesIO
import json
from gen_test import *
import binascii
import struct
import io
import string

app = Flask(__name__, template_folder='static/fancy')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def img2str(img):
    rawBytes = BytesIO()
    img.save(rawBytes, "PNG")
    rawBytes.seek(0) 
    return base64.b64encode(rawBytes.read()).decode('utf-8')

@app.route("/", methods=['POST', 'GET'])
def home():
    return render_template("fancy.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)

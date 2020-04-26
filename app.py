import os
import random
import pickle
import gdown
from PIL import Image
from torchvision import transforms, utils
from flask import Flask, Markup, request, render_template, url_for, jsonify
import base64
import torch
import numpy as np
from io import BytesIO
from model import Generator

app = Flask(__name__,
            static_url_path='/static',
            static_folder='static',
            template_folder='static')
app._static_folder = os.path.abspath("/static/")

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


def img2str(img):
    rawBytes = BytesIO()
    img.save(rawBytes, "PNG")
    rawBytes.seek(0)  # return to the start of the file
    return base64.b64encode(rawBytes.read()).decode('utf-8')

DEVICE = 'cuda'

# download MODEL:
MODEL_PATH = 'model.pt'
if not os.path.exists(MODEL_PATH):
    url_model = 'https://drive.google.com/uc?id=1gr6ghsrPX6CsEufFZkgMbDqLQ_KwsZaq'
    gdown.download(url_model, output=MODEL_PATH, quiet=False)
#MODEL_PATH = 'pretrained-face/550000.pt'
#MODEL_PATH = 'stylegan2-ffhq-config-f.pt'

LATENT_SIZE = 128
RESOLUTION = 512
LATENT_SORTED = 'latents/latents_sorted.pkl'
def load_model(model_path=MODEL_PATH, device=DEVICE):
    checkpoint = torch.load(model_path, map_location=lambda storage, loc: storage)
    generator = Generator(RESOLUTION, LATENT_SIZE, 8, 2).to(device)
    generator.load_state_dict(checkpoint['g_ema'])
    generator.eval()
    return generator
MODEL = load_model()

"""
def generate_image(latent=None, model=MODEL, device=DEVICE):
    if latent is None:
        #latent = np.random.randn(1, 128)
        latent = np.zeros((1, LATENT_SIZE))
    else:
        latent = np.array(latent).astype(np.float32)
        latent = latent.reshape(1, LATENT_SIZE)
    latent = torch.from_numpy(latent.astype(np.float32)).cuda()
    with torch.no_grad():
        sample, _ = model([latent])
    sample = sample.cpu()
    img = transforms.ToPILImage()(sample[0].clamp_(-1, 1).add_(1).div_(2 + 1e-5)).convert('RGB')
    return img
"""
NUMPY_ARRAY = np.array(pickle.load(open(LATENT_SORTED, 'rb')))

Z = 8
Y = 0
X = 16 - Y - Z
def generate_image(indices=None, model=MODEL, device=DEVICE, NUMPY_ARRAY=NUMPY_ARRAY):
    if indices is None:
        #indice = np.random.randint(low=0, high=64000)
        indices = np.repeat(0, 16)
    else:
        indices = np.array([indices[0]] * X + [indices[1]] * Y + [indices[2]] * Z)
        indices = [int(indice) for indice in indices]
    latent = NUMPY_ARRAY[indices]
    latent = torch.from_numpy(latent.astype(np.float32))
    latent = latent.unsqueeze(0).cuda()
    with torch.no_grad():
        sample, _ = model([latent], input_is_latent=True)
    sample = sample.cpu()
    img = transforms.ToPILImage()(sample[0].clamp_(-1, 1).add_(1).div_(2 + 1e-5)).convert('RGB')
    return img



@app.route("/thitrum", methods=['POST', 'GET'])
def home():
    return render_template("index.html",
                        image="data:image/png;base64," + img2str(generate_image()))

@app.route("/thitrum/submit_latent_vector", methods=['POST'])
def changeImage():
    data = request.form.to_dict(flat=False)
    latent = data["latent[]"]
    latent = np.array([float(i) for i in latent])
    return {"image": "data:image/png;base64," + img2str(generate_image(latent))}

if __name__ == "__main__":
    app.run(debug=True, port=9696)
    #generate_image2()

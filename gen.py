import os
import random
import pickle
import wget
import json
import gdown
import torch
import numpy as np
from torchvision import transforms, utils
from model import Generator

SEED = 2020
DEVICE = 'cuda'

RESOLUTION = 512
LEVELS = [4, 4, 8]

LATENT_SIZE = 512

def seed_everything(seed):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True

seed_everything(SEED)

def load_model(model_path='model.pt'):
    if not os.path.exists(model_path):
        # model kaggle 512 transfer
        url_model = 'https://www.kaggleusercontent.com/kf/38674976/eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..VX2ODnfS19mlPVAq4XX-aw.53RrqpKZ-DGobTBubGJ1qdrTs5Y23Xnj6Hu50c-YY4JFQTFzJRGgHV4d4sF632Jc4E4bDnQSfrBR936i8LclblbeZjO2ILfEbcIOJamzmV8aFR5P9NXyNBWm8IgAkrKYDFuJTkiUXhYB9Ymv_k-vfND5FwaKspg9Qz_9J64Q06HjeV6Jf6HLLL9xP77pJvHfOOtISq-qqhDyM7tT_jRFeC_UPNv13rVZXufddbAt-wcl2XJQHTFZl58lpElLYEdX7eoY8NE8uk2jy-2XrP4fdliHZhcLOUqCAn3N83Ah-ifKayAXToQpFtLA8Bd99gymzrG1R9wA_7up2PjDsWcJepxlVVNMAc8xRmm7SIf4LUeTETCXgUyi3lM9mQf6dTBsBlucGanl4Z3rWc4xEkxBAR7KHTnmw4EHW2xnVsrB0Ol0ofmLbE9Y5xfzPpOsejNDSK7fs8WXJgqFCOiWnZrOtr6SqRqPNQP1PVpCC0-BymmrLnU0kI1JxLpozUN2Yh0KPQVpTbj5e4RcDhh6x9E9TjByE4PYzGdZ6FocTkocZjGLTDe-lX7lOjyk29CUUX2v50pQWR8UAJWeItvs_ZG4Cw0yIZQFYP13RBA7aq4igHC3UqQ06iw27tqy92qg2jLsxLWyT-93OxbHXn2NZqBd3A.syPxTVHCFuoZwemx1R6ubg/checkpoint/039390.pt'
        wget.download(url_model, out=model_path)
    checkpoint = torch.load(model_path)

    generator = Generator(RESOLUTION, LATENT_SIZE, 8).to(DEVICE)

    generator.load_state_dict(checkpoint['g_ema'])
    generator.eval()
    return generator

def load_latents(latents_path='latents512.pkl'):
    if not os.path.exists(latents_path):
        url_latents = 'https://drive.google.com/uc?id=1Oo_R2un4FO5srZpZowGbDvDzYdo5MaNq&export=download'
        gdown.download(url_latents, output=latents_path, quiet=False)
    with open(latents_path, 'rb') as f:
        latents = pickle.load(f)
    return latents

def load_labels(labels_path='labels.json'):
    labels = {}
    all_keys = []

    with open(labels_path, 'r') as f:
        labels = json.load(f)
    for value in labels.values():
        for key in value.keys():
            if key not in all_keys:
                all_keys.append(key)

    return labels, all_keys

MODEL = load_model()
LATENTS = load_latents()

## fake label for testing
LABELS, ALL_KEYS = load_labels()
LABELS = np.random.randint(0, len(LATENTS), size=len(LATENTS))

@torch.no_grad()
def style_to_image(style1, style2, style3, model=MODEL):
    styles = [style1, style2, style3]

    for i, style in enumerate(styles):
        if len(style) == 0:
            random_latent = torch.randn(1, LATENT_SIZE).to(DEVICE)
            style = model.get_latent(random_latent)
            style = style.cpu().numpy()
        style = np.array(style).reshape(1, LATENT_SIZE)
        style = style.repeat(LEVELS[i], axis=0)
        styles[i] = style

    styles = np.r_[styles[0], styles[1], styles[2]]
    styles = torch.from_numpy(styles)
    styles = styles.unsqueeze(0)
    styles = styles.to(DEVICE)

    sample, _ = model([styles], input_is_latent=True)
    sample = sample.cpu()
    img = transforms.ToPILImage()(sample[0].clamp_(-1, 1).add_(1).div_(2 + 1e-5)).convert('RGB')

    return img

@torch.no_grad()
def gen_images(batch, model=MODEL):
    random_latents = torch.randn(batch, LATENT_SIZE).to(DEVICE)
    samples, latents = model([random_latents], return_latents=True)
    samples = samples.cpu()
    latents = latents.cpu()
    return samples, latents


@torch.no_grad()
def get_random_images(inputs=[-1, -1, 2], model=MODEL):
    results = []
    for x in inputs:
        if x == -1:
            latent_z = torch.randn(1, LATENT_SIZE).to(DEVICE)
            image, latent_w = model([latent_z], return_latents=True)
            latent_w = latent_w[:, 0, :]
        else:
            latent_w = LATENTS[LABELS[x]].reshape(1, LATENT_SIZE)
            latent_w = torch.from_numpy(latent_w).to(DEVICE)

            image, test = model([latent_w], input_is_latent=True, return_latents=True)
        
        image = transforms.ToPILImage()(image[0].cpu().clamp_(-1, 1).add_(1).div_(2 + 1e-5))
        latent_w = latent_w.cpu().numpy().reshape(-1,)
        item = [image, latent_w]
        results.append(item)
    return results

@torch.no_grad()
def get_style_from_label(labels, model=MODEL):
    #TODO rewrite this
    """input:
        - labels: a list of labels, i.e [1, 2, 3]
        output:
        - a numpy array of vector styles with shape:
    """
    labels = np.array(labels)
    latents = LATENTS[labels]
    return latents

@torch.no_grad()
def get_style_from_random(n_samples, model=MODEL):
    """input:
        - n_samples: number of styles
        output:
        - a numpy array of vector styles with random 
    """
    latent_z = torch.randn(n_samples, LATENT_SIZE).to(DEVICE)
    latent_w = model.get_latent(latent_z)
    return latent_w.cpu().numpy()

@torch.no_grad()
def get_images_from_styles(style1, style2, style3, weight=0.8, model=MODEL, multi_output=False):
    """input:
        - style1, style2, style3 : vector with shape (320,)
        output:
        - image with size 512x512
    """
    style1 = np.array(style1, dtype=np.float32)
    style2 = np.array(style2, dtype=np.float32)
    style3 = np.array(style3, dtype=np.float32)

    styles = []
    assert 0.0 <= weight <= 1.0
    style2 = (1 - weight) * style1 + weight * style2
    for i, style in enumerate([style1, style2, style3]):
        style = torch.tensor(style, device=DEVICE)
        style = style.repeat(LEVELS[i], 1)
        styles.append(style)
    styles = torch.cat(styles, 0).unsqueeze(0)
    img, _ = model([styles], input_is_latent=True)
    img = img.cpu()
    img = transforms.ToPILImage()(img[0].clamp_(-1, 1).add_(1).div_(2 + 1e-5)).convert('RGB')
    return img


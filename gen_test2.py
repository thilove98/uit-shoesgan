import os
import random
import json
import numpy as np
from PIL import Image

class Generator:
    def __init__(self):
        pass

    def __call__(self):
        pass

SEED = 2020
DEVICE = 'cuda'

RESOLUTION = 512
LEVELS = [4, 4, 8]

LATENT_SIZE = 512

def seed_everything(seed):
    random.seed(seed)
    np.random.seed(seed)

seed_everything(SEED)

def load_labels(labels_path='labels.json'):
    with open(labels_path, 'r') as f:
        labels = json.load(f)
    return labels

def load_predefined_styles(styles_path=os.path.join("styles-predefined", "styles-predefined.json")):
    with open(styles_path, 'r') as f:
        styles = json.load(f)
    return styles

MODEL = None
LABELS = load_labels()
STYLES = load_predefined_styles()

def style_to_image(style1, style2, style3, model=MODEL):
    return None
    #return img

def gen_images(batch, model=MODEL):
    random_latents = torch.randn(batch, LATENT_SIZE).to(DEVICE)
    samples, latents = model([random_latents], return_latents=True)
    samples = samples.cpu()
    latents = latents.cpu()
    return samples, latents


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

def get_style_from_label(labels):
    name = labels[0]
    results = LABELS[name]
    labels = random.sample(results, len(labels))
    labels = np.array(labels)

    np.random.seed(labels)
    latents = np.random.randint(0, 256, (3, 512))

    return latents

def get_style_from_random(n_samples, model=MODEL):
    """input:
        - n_samples: number of styles
        output:
        - a numpy array of vector styles with random 
    """
    return np.random.randint(0, 256, (n_samples, LATENT_SIZE))

def get_style_from_index():
    latents = []
    styles = []
    levels = []
    for x in STYLES:
        np.random.seed(x["id"])
        latents.append(np.random.randint(0, 256, (512,)))
        styles.append(x["style"])
        levels.append(x["level"])
    return latents, styles, levels

def get_images_from_styles(vectors, weight=0.8, model=MODEL, multi_output=False):
    vectors = np.sum(vectors, axis=1) / len(vectors[0])
    vectors = np.clip(vectors, 0, 255).astype(np.uint8)
    img = Image.new('RGB', (512, 512), color=tuple(map(int, np.random.randint(0, 256, (3,)))))
    return img

def get_images_from_styles_mixing(input_style, mix_style, weight=0.8, model=MODEL, level=1):
    style1 = np.array(input_style[0], dtype=np.float32)
    style2 = np.array(input_style[1], dtype=np.float32)
    style3 = np.array(input_style[2], dtype=np.float32)

    styles = []

    if level <= 3:
        new_style = (input_style[level-1] + weight * mix_style[level-1]) / (weight + 1)
        new_style = np.array(new_style, dtype=np.float32)
        if level == 1:
            style1 = new_style
        elif level == 2:
            style2 = new_style
        elif level == 3:
            style3 = new_style
    else:
        style1 = (input_style[0] + weight * mix_style[0]) / (weight + 1)
        style2 = (input_style[1] + weight * mix_style[1]) / (weight + 1)
        style1 = np.array(style1, dtype=np.float32)
        style2 = np.array(style2, dtype=np.float32)

    img = Image.new('RGB', (512, 512), color=tuple(map(int, np.random.randint(0, 256, (3,)))))
    return img, [style1, style2, style3]


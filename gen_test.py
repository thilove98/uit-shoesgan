import numpy as np
from PIL import Image
import random

def style_to_image(style1 = [], style2 = [], style3 = [], model=None, size = 512):
    img = Image.new("RGB", (size, size), (random.randint(0, 254), random.randint(0, 254), random.randint(0, 254)))
    return img

def get_random_images(n, size):
    ans = []
    for i in range(n):
        ans.append((style_to_image(size=70), [0.1, 0.2, 3], str(i)))
    return ans

def get_style_from_label(labels, model=None):
    """input:
        - labels: a list of labels, i.e [1, 2, 3]
        output:
        - a numpy array of vector styles with shape: (len(labels), 320)
    """
    return [[i, i, i, i*2, i*2] for i in range(len(labels))]

def get_style_from_random(n_samples, model=None):
    return [[i ,i ,i ,i*2, i*2] for i in range(n_samples)]

def get_images_from_styles(vectors, model=None):
    """input:
        - style1, style2, style3 : vector with shape (320,)
        output:
        - image with size 512x512
    """
    img = Image.new("RGB", (512, 512), (random.randint(0, 254), random.randint(0, 254), random.randint(0, 254)))
    return img

def get_images_from_styles_mixing(input_style, mix_style, weight, model=None):
    img = Image.new("RGB", (512, 512), (random.randint(0, 254), random.randint(0, 254), random.randint(0, 254)))
    return img
   
def get_style_from_index():

    import json
    with open("styles-predefined/styles-predefined.json", 'r') as f:
        r = json.load(f)

    styles = [d["style"] for d in r]
    latents = [[1] for _ in range(len(styles))]
    levels = [1 for _ in range(len(styles))]

    print(styles)
    return latents, styles, levels

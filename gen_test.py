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
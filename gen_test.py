import numpy as np
from PIL import Image
def style_to_image(color = (100, 100, 100), style1 = [], style2 = [], style3 = [], model=None):
    img = Image.new("RGB", (512, 512), color)
    return img
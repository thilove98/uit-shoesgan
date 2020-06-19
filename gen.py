import gdown
import torch
import numpy as np
from torchvision import transforms, utils
from model import Generator


DEVICE = 'cuda'
RESOLUTION = 512
LATENT_SIZE = 128

LEVEL1 = 4
LEVEL2 = 4
LEVEL3 = 8

def load_model(model_path='model.pt'):
    # download model
    if not os.path.exists(MODEL_PATH):
        url_model = 'https://drive.google.com/uc?id=1gr6ghsrPX6CsEufFZkgMbDqLQ_KwsZaq'
        gdown.download(url_model, output=MODEL_PATH, quiet=False)

    # load checkpoint
    checkpoint = torch.load(model_path, map_location=lambda storage, loc: storage)
    generator = Generator(RESOLUTION, LATENT_SIZE, 8, 2).to(DEVICE)
    generator.load_state_dict(checkpoint['g_ema'])
    generator.eval()
    return generator


MODEL = load_model()

@torch.no_grad()
def style_to_image(style1, style2, style3, model=MODEL):
    style1 = np.array(style1).reshape(1, LATENT_SIZE)
    style2 = np.array(style2).reshape(1, LATENT_SIZE)
    style3 = np.array(style3).reshape(1, LATENT_SIZE)

    style1 = style1.repeat(LEVEL1, axis=0)
    style2 = style2.repeat(LEVEL2, axis=0)
    style3 = style3.repeat(LEVEL3, axis=0)

    style = np.r_[style1, style2, style3]
    style = torch.from_numpy(style.astype(np.float32))
    style = style.to(DEVICE)

    sample, _ = model([style], input_is_latent=True)
    sample = sample.cpu()
    img = transforms.ToPILImage()(sample[0].clamp_(-1, 1).add_(1).div_(2 + 1e-5)).convert('RGB')

    return img


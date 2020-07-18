import os
import wget
import random
import gdown
import torch
import numpy as np
from torchvision import transforms, utils
from model2 import Generator

SEED = 2020
DEVICE = 'cuda'

RESOLUTION = 512
LEVELS = [4, 4, 8]

LABELS_IN = True

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
    # download model
    if not os.path.exists(model_path):
        # model kaggle 512 transfer
        url_model = 'https://www.kaggleusercontent.com/kf/38674976/eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..lSr-Ys6CHHJw9sCJutEwOA.F7nobtYD4y_M2ONtUFVaiQsQQbuxFhRLtjRxEPiNx8AuIMigztl1B4r3xKeLPhQlC3Zt8fvEUb8e2K8SWSu3HSjAYDhedWlIg7YBGclX7yBi1xutu2gK_N7zovv2smJ1syU9OreCj4nZmyW_gAUxoKS63uNEYMiq-nEG-7ydM7O2kYGig5kDHHTbasGhqMsO3_JtKtgqf9ngt7vrfhQ9jGxXw2FmWMm_pvqJn_eR3ICELRoQe4o7HZ_46g0gnRkidMYajY6_3dYw1Ddn_MMpnDhKKousqqamOq0X_T_YbCw_XWwCVpJD-GQ3GrGMfp20htAIcwJB_tYvizXz-7k6hhe43aX64FeOF084e1Zb6wsqoYvnRBWxrRF0rmwBbOvOJjEgUy0bku8fHWN07NfpPtM1JusijHaRi2CfLaA9M-tYEhq6Vf_kcJ3SvpvxlkMy27mgY4lWWWsksd4HZKgm-O8WHWsaSDgVKPIFYh-7X_RWpLbN-xzhytjeoXrSOva-39ljMO8VBgwFCwc_d6bfb6BlVNcLPUkKcrxi7BQmQ41Oz7Bpqr7KnoNuCSQegzyL19ihS7GSA6lLBxTPh27oc-5QuH2svo0hsP5rBaHGiAKLUqqkW1WaOvMzYIw-p0mEvnh1sGoEN7jWETq1yPk2UQ.NMNoGsbv5CAj35rx33x_uw/checkpoint/039390.pt'
        wget.download(url_model, out=model_path)
        # url_model = 'https://drive.google.com/uc?id=1gr6ghsrPX6CsEufFZkgMbDqLQ_KwsZaq'
        # gdown.download(url_model, output=model_path, quiet=False)
 
    # load checkpoint
    checkpoint = torch.load(model_path)

    generator = Generator(RESOLUTION, LATENT_SIZE, 8).to(DEVICE)

    generator.load_state_dict(checkpoint['g_ema'])
    generator.eval()
    return generator


MODEL = load_model()

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

def get_random_images(n_samples, size, batch_size=16, model=MODEL):
    batches = [batch_size] * (n_samples//batch_size) + [n_samples%batch_size]
    results = []
    index = 0
    for batch in batches:
        if batch == 0:
            continue
        samples, latents = gen_images(batch, model)
        for sample, latent in zip(samples, latents):
            img = transforms.ToPILImage()(sample.clamp_(-1, 1).add_(1).div_(2 + 1e-5))
            img = img.convert('RGB').resize(size)
            style = latent[0].numpy()

            item = [img, style, str(index)]
            results.append(item)
            index += 1
    return results

@torch.no_grad()
def get_style_from_label(labels, model=MODEL):
    """input:
        - labels: a list of labels, i.e [1, 2, 3]
        output:
        - a numpy array of vector styles with shape: (len(labels), 320)
    """
    labels = torch.tensor(labels, dtype=torch.long, device=DEVICE)
    latents = torch.randn(labels.shape[0], LATENT_SIZE, device=DEVICE)
    styles = model.get_latent(latents, label=labels)
    return styles.cpu().numpy()


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


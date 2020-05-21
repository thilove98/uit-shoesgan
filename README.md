# UIT SHOESGAN
Generating shoes designs using [StyleGAN2](https://github.com/NVlabs/stylegan2).

Thanks to rosinality for his awesome repository [stylegan2-pytorch](https://github.com/rosinality/stylegan2-pytorch).

## Dataset
The [dataset](https://github.com/thilove98/uit-shoesgan/tree/master/dataset) included 70k shoes images that we collected from Zappos.

## Installation
	pip install -r requirements.txt

## Usage
	python app.py

### Pretrained model
We have trained the 512px model on our datasets (with the left-view) 420k iterations. Due to the limited of computational resources we only used 1 batch size.
<https://drive.google.com/uc?id=1gr6ghsrPX6CsEufFZkgMbDqLQ_KwsZaq>



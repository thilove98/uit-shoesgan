from io import BytesIO
import torch
import lmdb
from PIL import Image
from torch.utils.data import Dataset


class MultiResolutionDataset(Dataset):
    def __init__(self, path, transform, resolution=256, use_label=False, metadata=None, categories=None):
        self.env = lmdb.open(
            path,
            max_readers=32,
            readonly=True,
            lock=False,
            readahead=False,
            meminit=False,
        )

        if not self.env:
            raise IOError('Cannot open lmdb dataset', path)

        with self.env.begin(write=False) as txn:
            self.length = int(txn.get('length'.encode('utf-8')).decode('utf-8'))

        self.resolution = resolution
        self.transform = transform
        self.use_label = use_label
        self.metadata = metadata
        self.categories = categories

    def __len__(self):
        return self.length

    def __getitem__(self, index):
        with self.env.begin(write=False) as txn:
            if self.use_label:
                key = f'image-{str(index).zfill(5)}'.encode('utf-8')
                img_bytes = txn.get(key)
                key = f'label-{str(index).zfill(5)}'.encode('utf-8')
                label = txn.get(key)
                label = str(label).replace('\\','').replace('b','').replace('\"','').replace('\'','')

                assert label in self.metadata

                label = self.metadata[label]['info']['category']
                label = self.categories[label]
                label = int(label)
                label = torch.tensor(label).type(torch.long)

            else:
                key = f'{self.resolution}-{str(index).zfill(5)}'.encode('utf-8')
                img_bytes = txn.get(key)
        
        buffer = BytesIO(img_bytes)
        img = Image.open(buffer)
        img = self.transform(img)
        if self.use_label:
            return img, label
        else:
            return img

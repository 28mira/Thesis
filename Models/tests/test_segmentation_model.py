import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import os

from segmentation_model import SegmentationModel


def test_load_image_and_mask():
    model = SegmentationModel("test_data")
    image, mask = model.load_image_and_mask()

    assert len(image) > 0
    assert len(mask) == len(image)
    assert image[0].shape == (1, 256, 256)
    assert mask[0].shape == (1, 256, 256)


def test_build_unet_model():
    model = SegmentationModel("test_data")
    unet_model = model.build_unet_model()

    assert unet_model is not None
    assert model.model is not None


def test_save_model(tmp_path):
    model = SegmentationModel("test_data")
    model.build_unet_model()
    model.save_model(tmp_path)

    assert os.path.exists(tmp_path / "unet_model.pth")


def test_model_epochs():
    model = SegmentationModel("test_data")
    model.build_unet_model()
    images, masks = model.load_image_and_mask()

    datas = list(zip(images, masks))
    model.model_epochs(datas, images, masks)

    assert model.model is not None

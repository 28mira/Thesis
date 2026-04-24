from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from main import check_folder
from main import main
import os
from unittest.mock import patch
import numpy as np


def test_check_folder(tmp_path):
    folders = ['converted_data', 'data','Normal', 'Stroke_Haemorrhage', 'Stroke_infarct']
    for folder in folders:
        os.makedirs(tmp_path / folder)
    
    assert check_folder(tmp_path, folders) is True

def test_check_folder_missing(tmp_path):
    (tmp_path / "a").mkdir()
    assert check_folder(tmp_path, ['a', 'b']) is False

@patch("main.ClassificationModel")
@patch("main.SegmentationModel")
def test_main(mock_segmentation, mock_classification, tmp_path):
    base = tmp_path
    mock_classification_model_instance = mock_classification.return_value
    mock_segmentation_model_instance = mock_segmentation.return_value

    folders = ['converted_data', 'data','Normal', 'Stroke_Haemorrhage', 'Stroke_infarct']
    for folder in folders:
        os.makedirs(tmp_path / folder)

    mock_classification_model_instance.load_from_folder.return_value = ([np.zeros((256, 256, 1))], [0])
    mock_classification_model_instance.load_labels.return_value = [0]
    mock_classification_model_instance.build_model.return_value = "classification_model"
    mock_classification_model_instance.train_model.return_value = ("history", [], [])

    mock_segmentation_model_instance.load_image_and_mask.return_value = ([np.zeros((256, 256, 1))], [np.zeros((256, 256, 1))])
    mock_segmentation_model_instance.build_unet_model.return_value = "unet_model"

    main(str(base), str(tmp_path))

    assert mock_classification_model_instance.build_model.called
    assert mock_segmentation_model_instance.build_unet_model.called
import os
import numpy as np
from Models.classification_modell import ClassificationModel
from Models.segmentation_modell import SegmentationModel
import argparse

def check_folder(folder_path:str, folders:list)-> bool:
    """Check if a folder exists.

    Args:
        folder_path (str): Path to the folder to check or create.
        folders (list): List of subfolders to check or create.
    """
    for folder in folders:
        path = os.path.join(folder_path, folder)
        if not os.path.exists(path):
            return False
        
        
    return True

def main(base_path:str, save_path:str )-> None:
    """Run classification and segmentation training pipelines.

    Args:
        base_path (str): Path to the dataset directory.
        save_path (str): Path where trained models will be saved.
    This function initializes the classification and segmentation models, loads the data, trains both models, and saves the results.
    """
    
    classification_model = ClassificationModel(base_path)
    segmentation_model = SegmentationModel(base_path)
    
    folders = ['converted_data', 'data','Normal', 'Stroke_Haemorrhage', 'Stroke_infarct']
    if not check_folder(base_path, folders):
        raise FileNotFoundError(f"One or more required folders are missing in the base path: {folders}")
    else:
        X, _ = classification_model.load_from_folder('converted_data', label=None)
        y  = classification_model.load_labels('data')
        for folder in folders[2::]:
            X_load,y_load = classification_model.load_from_folder(folder, label=len(set(y)))
            X += X_load
            y += y_load
    classification_model.model = classification_model.build_model()
    classification_model.history, X_val, y_val = classification_model.train_model(np.array(X), np.array(y))
    classification_model.save_model(save_path, X_val, y_val)
    classification_model.diagram()

    images, masks = segmentation_model.load_image_and_mask()
    segmentation_model.model = segmentation_model.build_unet_model()
    datas = list(zip(images, masks))
    segmentation_model.model_epochs(datas, images, masks)
    segmentation_model.save_model(save_path)

   
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train classification and segmentation models.")
    parser.add_argument('--base_path', type=str, required=True, help='Path to the dataset directory.')
    parser.add_argument('--save_path', type=str, required=True, help='Path where trained models will be saved.')
    args = parser.parse_args()
    main(
        base_path=args.base_path,
        save_path=args.save_path,
    )
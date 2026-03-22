import numpy as np
from classification_model import ClassificationModel
from segmentation_model import SegmentationModel
import argparse

def main(base_path:str, save_path:str )-> None:
    """Run classification and segmentation training pipelines.

    Args:
        base_path (str): Path to the dataset directory.
        save_path (str): Path where trained models will be saved.
    This function initializes the classification and segmentation models, loads the data, trains both models, and saves the results.
    """
    
    classification_model = ClassificationModel(base_path)
    segmentation_model = SegmentationModel(base_path)
    
    X, _ = classification_model.load_from_folder('converted_data', label=None)
    y  = classification_model.load_labels('data')
    X_load,y_load = classification_model.load_from_folder('Normal', label=len(set(y))) 
    X += X_load
    y += y_load  
    X_load,y_load = classification_model.load_from_folder('Stroke_Haemorrhage', label=len(set(y)))    
    X += X_load
    y += y_load  
    X_load,y_load = classification_model.load_from_folder('Stroke_infarct', label=len(set(y)))    
    X += X_load
    y += y_load  

    classification_model.model = classification_model.build_model()
    classification_model.history, X_val, y_val = classification_model.train_model(np.array(X), np.array(y))
    classification_model.save_model(save_path, X_val, y_val)
    classification_model.inFigures()

    images, masks = segmentation_model.load_image_and_mask()
    segmentation_model.model = segmentation_model.build_unet_model()
    datas = list(zip(images, masks))
    segmentation_model.modleEpochs(datas, images, masks)
    segmentation_model.saveModel(save_path)

   
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train classification and segmentation models.")
    parser.add_argument('--base_path', type=str, required=True, help='Path to the dataset directory.')
    parser.add_argument('--save_path', type=str, required=True, help='Path where trained models will be saved.')
    args = parser.parse_args()
    main(
        base_path=args.base_path,
        save_path=args.save_path,
    )
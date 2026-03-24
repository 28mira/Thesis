import os
import h5py
import numpy as np
import torch
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader
from monai.networks.nets import UNet
from monai.losses import DiceLoss
from monai.metrics import DiceMetric
import cv2

class SegmentationModel:
    """Segmentation model class for loading data, building and training a U-Net."""

    def __init__(self, base_path:str):
        """Initialize the segmentation model.

        Args:
            base_path (str): Base directory containing the dataset.

        Attributes:
            model (torch.nn.Module): The segmentation model.
            device (torch.device): Device used for computation (CPU or GPU).
        """
        self.base_path = base_path
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")  

    def load_image_and_mask(self)-> tuple:
        """Load and preprocess images and corresponding masks.

        The method reads `.mat` files, normalizes the images, resizes them,
        and converts them into PyTorch tensors.

        Returns:
            tuple: A tuple containing:
                - images (list of torch.Tensor): Preprocessed images.
                - masks (list of torch.Tensor): Corresponding binary masks.
        """        
        input_folder = os.path.join(self.base_path, 'data')
        images, masks = [], []
        img_size = (256,256)
        for file_name in sorted(os.listdir(input_folder)):
            if file_name.endswith('.mat'):
                file_path = os.path.join(input_folder,file_name)
                
                with h5py.File(file_path, 'r') as f:
                    image = np.array(f['cjdata/image']).T
                    tumor_mask = np.array(f['cjdata/tumorMask']).T
                
                eps = 1e-8
                
                image = image.astype(np.float64)
                image = 255*(image-image.min())/(image.max()-image.min() + eps)
                image = cv2.resize(image,img_size)
                image_norm = torch.tensor(image,dtype=torch.float32)/255.0
                image = image_norm.unsqueeze(0) 

                tumor_mask = tumor_mask.astype(np.float64)
                tumorMask = 255*(tumor_mask-tumor_mask.min())/(tumor_mask.max()-tumor_mask.min() + eps)
                tumorMask = cv2.resize(tumorMask,img_size)
                tumor_mask_norm = torch.tensor(tumorMask,dtype=torch.float32)/255.0
                mask =tumor_mask_norm.unsqueeze(0)
                mask = (mask>0.5).float() 

                images.append(image)
                masks.append(mask)
                
        return (images, masks)

    def build_unet_model(self)-> UNet:
        """Build and initialize a U-Net model.

        Returns:
            UNet: Initialized U-Net model moved to the selected device.
        """        
        model = UNet(
        spatial_dims=2,
        in_channels=1,       
        out_channels=1,      
        channels=(16, 32, 64, 128, 256),
        strides=(2, 2, 2, 2),
        num_res_units=2,)
        self.model = model.to(self.device)

        return self.model

    def modleEpochs(self, datas:tuple, images:list, masks:list)-> None:
        """Train the model for a fixed number of epochs.

        The dataset is split into training and validation subsets.
        The model is trained using Dice loss and Adam optimizer.

        Args:
            datas (Dataset): Combined dataset containing images and masks.
            images (list): List of input images (not directly used here).
            masks (list): List of ground truth masks (not directly used here).
        """
        train_size = int(0.8*len(datas))
        val_size = len(datas) - train_size
        train_datas, val_datas = torch.utils.data.random_split(datas,[train_size,val_size])
        train = DataLoader(train_datas,batch_size=8,shuffle=True)

        loss_function = DiceLoss(sigmoid=True)
        optimizer = torch.optim.Adam(self.model.parameters(), 1e-4)

        self.model = self.model.to(self.device)
        for epoch in range(55):
            self.model.train()
            epoch_loss = 0
            for i,(images, masks) in enumerate(train):
                images, masks = images.to(self.device), masks.to(self.device)
                optimizer.zero_grad()
                outputs = self.model(images)
                loss = loss_function(outputs, masks)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()

    def saveModel(self,save_path:str)-> None:
        """Save the trained model weights.

        Args:
            save_path (str): Directory where the model will be saved.
        """
        torch.save(self.model.state_dict(), os.path.join(save_path, 'unet_model.pth'))
        print(f"Model saved to")
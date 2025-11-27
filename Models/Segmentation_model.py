import os
import h5py
import numpy as np
import torch
from tensorflow.keras import preprocessing
from torch.utils.data import DataLoader
from monai.networks.nets import UNet
from monai.losses import DiceLoss
from monai.metrics import DiceMetric
import cv2
from torch.optim import Adam
import torch

def LoadImageAndMask():
    input_folder = r'C:\Users\marto\Desktop\Szakdolgozat\pogram\brainTumor\data'
    datas = []
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
            image_norm = image.astype(np.float32)/255.0
            image = np.expand_dims(image_norm,axis=0)

            tumor_mask = tumor_mask.astype(np.float64)
            tumorMask = 255*(tumor_mask-tumor_mask.min())/(tumor_mask.max()-tumor_mask.min() + eps)
            tumorMask = cv2.resize(tumorMask,img_size)
            tumor_mask_norm = tumorMask.astype(np.float32)/255.0
            mask = np.expand_dims(tumor_mask_norm,axis=0)

            
            datas.append((image,mask))
    return datas

def unetModel():
    model = UNet(
    spatial_dims=2,
    in_channels=1,       
    out_channels=1,      
    channels=(16, 32, 64, 128, 256),
    strides=(2, 2, 2, 2),
    num_res_units=2,).to("cpu")
    return model

def modleEpochs(model, train):
    loss_function = DiceLoss(to_onehot_y=True, sigmoid=True)
    optimizer = torch.optim.Adam(model.parameters(), 1e-4)
    dice_metric = DiceMetric(include_background=False, reduction="mean")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    for epoch in range(35):
        model.train()
        epoch_loss = 0
        for i, (images, masks) in enumerate(train):
            images, masks = images.to(device), masks.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = loss_function(outputs, masks)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        print(f"Epoch {epoch+1}, Loss: {epoch_loss/len(train)}")

def saveModel(model):
    torch.save(model.state_dict(), 'unet_model.pth')

def predictSomeImages(model, X, y):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    image = X[0].astype(np.float64)
    #image = 255*(image-image.min())/(image.max()-image.min() + (1e-8))
    #image = cv2.resize(image,(256,256))
    #image_norm = image.astype(np.float32)/255.0
    #image = np.expand_dims(image_norm,axis=0)

    image = torch.tensor(image,dtype=torch.float32).unsqueeze(0).to(device)

    model.eval()
    with torch.no_grad():
        output = model(image)
        preds = torch.sigmoid(output)
        binary_preds = (preds>0.3).float()

def main():
    X,y = LoadImageAndMask()

    train_size = int(0.8*len(X))
    val_size = len(X) - train_size
    train_datas, val_datas = torch.utils.data.random_split(X,[train_size,val_size])

    train = DataLoader(train_datas,batch_size=8,shuffle=True)
    val = DataLoader(val_datas,batch_size=8,shuffle=True)

    model = unetModel()
    modleEpochs(model, train)
    saveModel(model)
    predictSomeImages(model, X,y)



if __name__ == "__main__":
    main()
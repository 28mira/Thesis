#import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
import h5py
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from tensorflow.keras import models, layers, preprocessing, datasets

def imageGenerator():
    input_folder = r'C:\Users\marto\Desktop\Szakdolgozat\pogram\brainTumor\data'
    output_folder = r'C:\Users\marto\Desktop\Szakdolgozat\pogram\brainTumor\converted_data'
    datas = []
    img_size = (256,256)
    for file_name in sorted(os.listdir(input_folder)):
        if file_name.endswith('.mat'):
            file_path = os.path.join(input_folder,file_name)
            
            with h5py.File(file_path, 'r') as f:
                image = np.array(f['cjdata/image']).T
                label = int(np.array(f['cjdata/label'])[0,0])
    
            image = image.astype(np.float64)
            im_norm = 255*(image-image.min())/(image.max()-image.min())
            im_uint8 = im_norm.astype(np.uint8)

            file_name_base = os.path.splitext(file_name)[0]
            output_file_path = os.path.join(output_folder,file_name_base + '.jpg')
    
            im_pil = Image.fromarray(im_uint8)
            im_pil = im_pil.resize(img_size)
            datas.append((np.array(im_pil,dtype=np.float32),label))
            
            im_pil.save(output_file_path)

def loadLabels():
    input_folder = r'C:\Users\marto\Desktop\Szakdolgozat\pogram\brainTumor\data'
    datas = []
    for file_name in sorted(os.listdir(input_folder)):
        if file_name.endswith('.mat'):
            file_path = os.path.join(input_folder,file_name)
            
            with h5py.File(file_path, 'r') as f:
                label = int(np.array(f['cjdata/label'])[0,0])-1

         
            datas.append((label))
    return datas

def loadImages():
    input_folder = r'C:\Users\marto\Desktop\Szakdolgozat\pogram\brainTumor\converted_data'
    X = []
    for file_name in sorted(os.listdir(input_folder)):
            if file_name.endswith('.jpg'):
                file_path = os.path.join(input_folder,file_name)
                
                img = preprocessing.image.load_img(file_path,target_size=(256, 256),
                                                    color_mode="grayscale")
                image_array = preprocessing.image.img_to_array(img)
                image_array = image_array/255.0

                X.append(image_array)
    return X

def loadNormalImages(X,y):
    input_folder = r'C:\Users\marto\Desktop\Szakdolgozat\pogram\brainTumor\Normal'
    for file_name in sorted(os.listdir(input_folder)):
            if file_name.endswith('.jpg'):
                file_path = os.path.join(input_folder,file_name)
                
                img = preprocessing.image.load_img(file_path,target_size=(256, 256),
                                                    color_mode="grayscale")
                image_array = preprocessing.image.img_to_array(img)
                image_array = image_array/255.0

                X.append(image_array)
                y.append(3)
    return np.array(X,dtype="float32"), np.array(y,dtype="int")

def cnnModel():
    model = models.Sequential() 
    model.add(layers.Input(shape=(256, 256, 1)))
    model.add(layers.Conv2D(64, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Conv2D(64, (3, 3), activation='relu'))
    model.add(layers.Flatten())
    model.add(layers.Dense(4,activation='softmax'))
    return model

def save_results(model, history, X_test, y_test):
    #model.save('C:/Users/marto/Desktop/Thesis/backend/models/BrainTumorClassificationModel.h5')
    #jl.dump(history,'C:/Users/marto/Desktop/Thesis/backend/models/BrainTumorClassificationHistory.pkl')
    np.save('C:/Users/marto/Desktop/Thesis/backend/brainTumor_y_test.npy',y_test)
    np.save('C:/Users/marto/Desktop/Thesis/backend/brainTumor_X_test.npy', X_test)  

def aboutModel(model, X_test, y_test):
    predictions = model.predict(X_test)
    predicted_classes = np.argmax(predictions, axis=1)
    print("Pontosság:", accuracy_score(y_test, predicted_classes))
    print("\n", classification_report(y_test, predicted_classes))

def inFigures(history):
    plt.figure(figsize=(10, 5))
    plt.plot(history.history['loss'], label='train loss')
    plt.plot(history.history['val_loss'], label='validation loss')
    plt.legend()
    plt.show()

def predictImages(model, X, y):
    img = np.expand_dims(X[0],axis=0)
    pred = model.predict(img)
    pred_class = np.argmax(pred,axis=1).tolist()
    pred_prob = np.max(pred)
    print(f"Predikált osztály: {pred_class}, valószínűség: {pred_prob:.2f}, valós címke: {y[0]}")
    img = np.expand_dims(X[1],axis=0)
    pred = model.predict(img)
    pred_class = np.argmax(pred,axis=1).tolist()
    pred_prob = np.max(pred)
    print(f"Predikált osztály: {pred_class}, valószínűség: {pred_prob:.2f}, valós címke: {y[1]}")

def main():
    X, y = [], []
    X, y = loadImages(), loadLabels()
    X, y = loadNormalImages(X,y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

    datagen = preprocessing.image.ImageDataGenerator(
    rotation_range=20,       
    width_shift_range=0.1,   
    height_shift_range=0.1,  
    zoom_range=0.1,          
    horizontal_flip=True,    
    fill_mode='nearest')

    train_generated = datagen.flow(X_train,y_train,batch_size=32)

    model = cnnModel()

    model.compile(optimizer='adam', loss=tf.keras.losses.SparseCategoricalCrossentropy(), metrics=['accuracy'])
    history = model.fit(train_generated, epochs=40, validation_data=(X_test,y_test))
    
    save_results(model, history, X_test, y_test)
    aboutModel(model, X_test, y_test)
    inFigures(history)
    predictImages(model, X, y)

if __name__ == "__main__":
    main()
#import pandas as pd
import os
from xml.parsers.expat import model
import numpy as np
import matplotlib.pyplot as plt
import h5py
import joblib as jl
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from tensorflow.keras import models, layers, preprocessing

class ClassificationModel:
    """Classification model for brain tumor type prediction using CNN."""

    def __init__(self, base_path: str):
        """Initialize the classification model.

        Args:
            base_path (str): Base directory containing dataset folders.

        Attributes:
            model (tf.keras.Model): The classification model.
            history (History): Training history object.
        """
        self.base_path = base_path
        self.model = None
        self.history = None

    def load_from_folder(self, folder: str, label=None)-> tuple:
        """Load images from a folder and optionally assign labels.

        Images are resized to 256x256, converted to grayscale,
        and normalized to [0, 1].

        Args:
            folder (str): Folder name inside base_path.
            label (int, optional): Label assigned to all images in the folder.

        Returns:
            tuple:
                - X (list of np.ndarray): Loaded image data.
                - y (list): Corresponding labels (if provided).
        """
        input_folder = os.path.join(self.base_path, folder)
        X = []
        y = []
        for file_name in sorted(os.listdir(input_folder)):
            if file_name.endswith('.jpg') or file_name.endswith('.png'):
                file_path = os.path.join(input_folder,file_name)
                
                img = preprocessing.image.load_img(file_path,target_size=(256, 256),
                                                    color_mode="grayscale")
                image_array = preprocessing.image.img_to_array(img)
                image_array = image_array/255.0

                X.append(image_array)

                if label is not None:
                    y.append(label)
            
        return X, y
    
    def load_labels(self, label_folder: str)-> tuple:
        """Load labels from .mat files.

        The labels are extracted from the dataset and adjusted to zero-based indexing.

        Args:
            label_folder (str): Folder containing label .mat files.

        Returns:
            list: List of integer labels.
        """
        input_folder = os.path.join(self.base_path, label_folder)
        y = []
        for file_name in sorted(os.listdir(input_folder)):
            if file_name.endswith('.mat'):
                file_path = os.path.join(input_folder,file_name)
                                
                with h5py.File(file_path, 'r') as f:
                    label = int(np.array(f['cjdata/label'])[0,0])-1
                y.append((label))
        return y

    def build_model(self)-> models.Sequential:
        """Build and compile a CNN model for multi-class image classification.

        The model consists of stacked convolutional and max-pooling layers to extract
        hierarchical spatial features, followed by fully connected layers for classification.

        Design choices:
            - Conv2D + ReLU: learns spatial features with non-linearity
            - MaxPooling: reduces spatial dimensions and overfitting
            - Dense layers: perform final classification based on extracted features
            - Softmax output: produces class probabilities for 6 categories

        The model is compiled using the Adam optimizer and sparse categorical
        cross-entropy loss, which is suitable for multi-class classification
        with integer labels.

        Returns:
            tf.keras.Sequential: Compiled CNN model.

        This model is based on a simplified version of a CNN architecture that we studied during our Python course at university.
        The original concept was extended and adapted here for brain tumor classification tasks.
        """
        model = models.Sequential([
            layers.Input(shape=(256, 256, 1)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D(),
            layers.Flatten(),
            layers.Dense(128, activation='relu'),
            layers.Dense(6,activation='softmax')]) 

        model.compile(optimizer='adam', loss=tf.keras.losses.SparseCategoricalCrossentropy(), metrics=['accuracy'])
        self.model = model
        return model

    def train_model(self, X:list, y:list, epochs=30)-> tuple:
        """Train the classification model.

        The dataset is split into training and validation sets.
        Data augmentation is applied to the training data.

        Args:
            X (array-like): Input images.
            y (array-like): Corresponding labels.
            epochs (int, optional): Number of training epochs.

        Returns:
            tuple:
                - history (History): Training history.
                - X_val (np.ndarray): Validation images.
                - y_val (np.ndarray): Validation labels.
        """
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.33, random_state=42)
        datagen = preprocessing.image.ImageDataGenerator(
            rotation_range=20,       
            width_shift_range=0.1,   
            height_shift_range=0.1,  
            zoom_range=0.1,          
            horizontal_flip=True,    
            fill_mode='nearest'
        )
        train_generated = datagen.flow(X_train,y_train,batch_size=32)

        if self.model is None:
            self.build_model()
        history = self.model.fit(train_generated, epochs=epochs, validation_data=(X_val, y_val))
        self.history = history
        return history, X_val, y_val

    def save_model(self, file_path: str, X_val: np.ndarray, y_val: np.ndarray)-> None:
        """Save the trained model and related artifacts.

        Args:
            file_path (str): Directory where files will be saved.
            X_val (np.ndarray): Validation images.
            y_val (np.ndarray): Validation labels.
        """
        if self.model is not None and self.history is not None:
            self.model.save(os.path.join(file_path, 'BrainTumorClassificationModel.h5'))
            jl.dump(self.history, os.path.join(file_path, 'BrainTumorClassificationHistory.pkl'))
            np.save(os.path.join(file_path, 'brainTumor_y_test.npy'), y_val)
            np.save(os.path.join(file_path, 'brainTumor_X_test.npy'), X_val) 

    def diagram(self)-> None:
        """Plot training and validation loss curves."""
        plt.figure(figsize=(10, 5))
        plt.plot(self.history.history['loss'], label='train loss')
        plt.plot(self.history.history['val_loss'], label='validation loss')
        plt.legend()
        plt.show()


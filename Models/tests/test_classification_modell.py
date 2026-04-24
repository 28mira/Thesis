from pathlib import Path
import numpy as np
import os
import sys
from types import SimpleNamespace
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    
from classification_model import ClassificationModel

def test_load_from_folder():
    model = ClassificationModel("test_data")
    X, y = model.load_from_folder("images", label=0)
    
    assert len(X)>0
    assert len(X) == len(y)
    assert X[0].shape == (256, 256, 1)
    assert y[0] == 0

def test_load_labels():
    model = ClassificationModel("test_data")
    labels = model.load_labels("data")

    assert len(labels)>0
    assert isinstance(labels[0], int)

def test_build_model():
    model = ClassificationModel("test_data")
    cnn_model = model.build_model()

    assert cnn_model is not None
    assert cnn_model.output_shape[-1] == 6

def test_train_model():
    model = ClassificationModel("test_data")
    model.build_model()
    X = np.random.rand(10, 256, 256, 1)
    y = np.random.randint(0, 6, size=(10,))
    history, X_val, y_val = model.train_model(X, y, epochs=1)

    assert history is not None
    assert len(X_val) > 0
    assert len(y_val) > 0
    assert X_val.shape[1:] == (256, 256, 1)

def test_save_model(tmp_path):
    model = ClassificationModel("test_data")
    model.model = model.build_model()
    model.history = SimpleNamespace(history={'loss':[0.5], 'accuracy':[0.8], 'val_loss':[0.6], 'val_accuracy':[0.8]})
    X_val = np.random.rand(2, 256, 256, 1)
    y_val = np.array([0, 1])
    
    model.save_model(tmp_path, X_val, y_val)
    files = os.listdir(tmp_path)
    assert "BrainTumorClassificationModel.h5" in files





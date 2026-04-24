import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import app, predicted_classes, prediction


def test_check_user_model():
    app.userModel = None
    with app.test_client() as client:
        response = client.get("/api/checkUserModel")
        assert response.status_code == 200
        data = response.get_json()
        assert data["model_loaded"] == False


def test_image_analyze_result():
    with app.test_client() as client:
        response = client.get("/imageAnalyze/result?type=0&accuracy=0.95")
        assert response.status_code == 200
        data = response.get_json()
        assert data["label"] == "Meningeóma"
        assert "accuracy" in data


def test_prediction():
    mock_model = MagicMock()
    mock_model.predict.return_value = np.array([[0.1, 0.9]])

    X = np.array([[1]])
    result = prediction(mock_model, X)
    assert result.shape == (1, 2)


def test_predicted_classes():
    mock_model = MagicMock()
    mock_model.predict.return_value = np.array([[0.1, 0.9]])

    X = np.array([[1]])
    result = predicted_classes(mock_model, X)

    assert result[0] == 1

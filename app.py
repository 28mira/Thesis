from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import joblib as jl
import numpy as np
import pandas as pd
from PIL import Image

app = Flask(__name__)
CORS(app)


y_test = np.loadtxt('brainTumor_y_test.txt',dtype=float)
X_test = np.load('brainTumor_X_test.npy',allow_pickle=True)


brainTumorModel = jl.load('models/BrainTumorClassificationModel.pkl')
brainTumorHistory = jl.load('models/BrainTumorClassificationHistory.pkl')

from sklearn.metrics import accuracy_score, classification_report

def prediction (model, X):
    predicted = model.predict(X)
    return predicted

def predicted_classes(model,X):
    return np.argmax(prediction(model,X),axis=1)

def model_classification_report(model, X, y):
    report = classification_report(y,predicted_classes(model,X),output_dict=True)
    return report


@app.route('/model1/prediction')
def model1_prediction():
    return jsonify({'message': prediction(brainTumorModel,X_test).tolist()})


def confusion_matrix():
    return 'Not doen yet.'

@app.route('/model1/summary')
def summary():
    report = model_classification_report(brainTumorModel, X_test, y_test)
    return jsonify({
        'model': 'Brain Tumor Classification Model',
        'accuracy': float(accuracy_score(y_test, predicted_classes(brainTumorModel, X_test))),
        'loss': float(np.mean(brainTumorHistory.history['loss'])),
        'val_loss': float(np.mean(brainTumorHistory.history['val_loss'])),
        'precision': float(report['weighted avg']['precision']),
        'recall': float(report['weighted avg']['recall']),
        'f1_score': float(report['weighted avg']['f1-score']),
        'confusion_matrix': confusion_matrix()
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    img_size = (256,256)
    
    get = request.files['image']
    data = Image.open(get.stream)
    data = data.resize(img_size)

    image = np.array(data)
    image = image.astype(np.float32) / 255.0
    image = np.expand_dims(image, axis=0) 



    prediction_result = predicted_classes(brainTumorModel, image)
    return jsonify({'message': 'Image received successfully', 
                    'prediction': prediction_result.tolist(),
                    'image_size': image.size})

@app.route('/imageAnalyze/result', methods=['GET'])
def image_analyze_result():
    tumor_type = request.args.get('type', type=int)
    #1 for meningioma, 2 for glioma, 3 for pituitary tumor
    print("Tumor type received:", tumor_type)
    if tumor_type == 1:
        result = {
            "label": 'Meningeóma',
            "content": "Olyan típusú elváltozás ahol a tumor az "
            "agy mellett található, lassan befelé nőnek. "
            "Általában jóindulatúak, viszont ha túl nagyra nőnek "
            "akkor életveszélyesek is lehetnek. Főbb tünetei a "
            "fejfájás, a kéz és láb gyengesége, ezenkívül más "
            "tünetei is lehetnek. Ha többet szeretnél tudni akkor "
            "ezen az oldalon tudsz róla még olvasni: "
            "https://orvos24.com/meningioma-tunetek-okok-kezelesek ",
            "accuracy": 0.98,
        }
    elif tumor_type == 2:
        result = {
            "label": 'Glióma',
            "content": "Egyfajta daganat, amely az agyban és a "
            "gerincvelőben, az idegsejtek környékében tud "
            "kialakulni, az elején segítik a támogatósejtek "
            "működését. Az agydaganatok leggyakoribb típusa. "
            "Többféle tünete lehet, amik főleg az agy működésében "
            "és az idegrendszerben való változásra utalnak. Ha "
            "többet szeretnél róla olvasni akkor itt tudsz még "
            "információkat szerezni: https://orvos24.com/a-glioma-tunetei-es-okai",
            "accuracy": 0.98,}
    elif tumor_type == 3:
        result = {
            "label": 'Agyalapi mirigy daganat',
            "content": "A legtöbb ilyen típusú elváltozás "
            "jóindulatú, a tünetei változóak lehetnek, de "
            "vér- és vizeletvizsgálat, valamint képalkotó "
            "eljárások segíthetnek a diagnózisban. Ez a fajta "
            "daganat nem terjed át más szervekre viszont a "
            "szervezet hormontermelése megváltozhat. Ha többet "
            "szeretnél tudni erről akkor ezen az oldalon tudsz "
            "jobban tájékozódni: https://egeszsegvonal.gov.hu/egeszseg-a-z/a-a/agyalapi-mirigy-daganata.html",
            "accuracy": 0.98,}
    else:
        result = {
            "label": 'Valami más',
            "content": "Valami más típusú elváltozás lehet.",
            "accuracy": 0.98,
        }
    return jsonify(result)


if __name__ == '__main__':
    app.run(port=5000,debug=False)

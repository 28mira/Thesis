from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import joblib as jl
import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib.pyplot as plt
import io
import os
import base64
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from sklearn.metrics import accuracy_score, classification_report
from PIL import Image

app = Flask(__name__)
CORS(app)

WEBLINKS = {
        0: 'C:/Users/marto/Desktop/meningioma/meningioma.html',
        1: 'C:/Users/marto/Desktop/glioma/glioma.html',
        2: 'C:/Users/marto/Desktop/amd/amd.html'
    }

y_test = np.load('brainTumor_y_test.npy',allow_pickle=True)
X_test = np.load('brainTumor_X_test.npy',allow_pickle=True)


brainTumorModel = load_model('models/BrainTumorClassificationModel.h5')
brainTumorHistory = jl.load('models/BrainTumorClassificationHistory.pkl')

u_netModel = load_model('models/unet_model.h5')

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
        'accuracy': float(accuracy_score(y_test, predicted_classes(brainTumorModel, X_test))),  #close to 1
        'loss': float(np.mean(brainTumorHistory.history['loss'])),  #close to 0
        'val_loss': float(np.mean(brainTumorHistory.history['val_loss'])),  #close to 0
        'precision': float(report['weighted avg']['precision']),    #close to 1
        'recall': float(report['weighted avg']['recall']),      #close to 1
        'f1_score': float(report['weighted avg']['f1-score']),   #close to 1
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    img_size = (256,256)

    get = request.files['image']
    print ("Type:", type(get))
    #print("Shape:", get.shape)
    #print("Min:", get.min(), "Max:", img.max())
    #print("Dtype:", get.dtype)
    print("Eddig jó")
    img = Image.open(get.stream).convert('L').resize(img_size) 
    print ("Type:", type(get))

    img = image.img_to_array(img)
    img = img / 255.0  
    img = np.expand_dims(img,axis=0)

    #img_tf = tf.convert_to_tensor(image, dtype=tf.float32)
    
    
    print ("Type:", type(img))
    print("Shape:", img.shape)
    print("Min:", img.min(), "Max:", img.max())
    print("Dtype:", img.dtype)
    print("Eddig jó")
    
    pred = brainTumorModel.predict(img) # mi történik ?
    pred_class = int(np.argmax(pred,axis=1)[0]) # 1 for meningioma, 2 for glioma, 3 for pituitary tumor
    pred_prob = float(np.max(pred))
    print ("Pred:", pred)
    #PlaceOfTumor = u_netModel.predict(image)
    print(f"Predicted class: {pred_class}, Probability: {pred_prob}")
    return jsonify({'message': 'Image received successfully', 
                    'prediction': pred_class,
                    'accuracy': pred_prob
                    })


@app.route('/imageAnalyze/result', methods=['GET'])
def image_analyze_result():
    tumor_type = request.args.get('type', type=int)
    accuracy = request.args.get('accuracy',type=float)
    #1 for meningioma, 2 for glioma, 3 for pituitary tumor
    
    print("Tumor type received:", tumor_type)
    if tumor_type == 0:
        result = {
            "label": 'Meningeóma',
            "content": "Olyan típusú elváltozás ahol a tumor az "
            "agy mellett található, lassan befelé nőnek. "
            "Általában jóindulatúak, viszont ha túl nagyra nőnek "
            "akkor életveszélyesek is lehetnek. Főbb tünetei a "
            "fejfájás, a kéz és láb gyengesége, ezenkívül más "
            "tünetei is lehetnek. ",
            "link": 'http://localhost:5000/disease/0', #"https://orvos24.com/meningioma-tunetek-okok-kezelesek'>https://orvos24.com/meningioma-tunetek-okok-kezelesek",
            "accuracy": accuracy,
        }
    elif tumor_type == 1:
        result = {
            "label": 'Glióma',
            "content": "Egyfajta daganat, amely az agyban és a "
            "gerincvelőben, az idegsejtek környékében tud "
            "kialakulni, az elején segítik a támogatósejtek "
            "működését. Az agydaganatok leggyakoribb típusa. "
            "Többféle tünete lehet, amik főleg az agy működésében "
            "és az idegrendszerben való változásra utalnak. ",
            "link": 'http://localhost:5000/disease/1', #"https://orvos24.com/a-glioma-tunetei-es-okai",
            "accuracy": accuracy,}
    elif tumor_type == 2:
        result = {
            "label": 'Agyalapi mirigy daganat',
            "content": "A legtöbb ilyen típusú elváltozás "
            "jóindulatú, a tünetei változóak lehetnek, de "
            "vér- és vizeletvizsgálat, valamint képalkotó "
            "eljárások segíthetnek a diagnózisban. Ez a fajta "
            "daganat nem terjed át más szervekre viszont a "
            "szervezet hormontermelése megváltozhat. ",
            "link": 'http://localhost:5000/disease/2',#"https://egeszsegvonal.gov.hu/egeszseg-a-z/a-a/agyalapi-mirigy-daganata.html",
            "accuracy": accuracy,}
    else:
        result = {
            "label": 'Valami más',
            "content": "Valami más típusú elváltozás lehet.",
            "accuracy": accuracy,
        }

    unet_model = brainTumorModel.predict(X_test)

    '''fig, ax = plt.subplots()
    ax.imshow(unet_model, cmap='gray')    
    ax.axis('off')'''

    if unet_model.shape[-1] > 1:
        mask = np.argmax(unet_model, axis=-1)
    else:
        mask = (unet_model.squeeze() > 0.5).astype(np.uint8)

    mask_img = (mask * 255).astype(np.uint8)

    buf =io.BytesIO()
    Image.fromarray(mask_img).save(buf, format='JPEG')
    buf.seek(0)
    base64_img = base64.b64encode(buf.getvalue()).decode('utf-8')
    #print(base64_img)
    result["placeOfTumorLabel"] = "Agytumor helye"
    result["placeOfTumor"] = base64_img
    return jsonify(result)

@app.route('/disease/<int:tumor_type>', methods=['GET'])
def disease_info(tumor_type):
   
    # Lekérjük az elérési utat
    file_path = WEBLINKS[tumor_type]
    print(f"Fájl elérési útja: {file_path}")
    
    # Ellenőrzés: létezik-e a fájl?
    if not os.path.exists(file_path):
        print(f"HIBA: A fájl nem található: {file_path}")
        return jsonify({'error': f'Fájl nem található: {file_path}'}), 404
    
    # Ha minden ok, serve-eljük a fájlt
    print(f"OK - Fájl serve-elése: {file_path}")
    return send_file(file_path, mimetype='text/html')

if __name__ == '__main__':
    app.run(port=5000,debug=False)
  
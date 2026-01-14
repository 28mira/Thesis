from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import joblib as jl
import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib
import matplotlib.pyplot as plt
import os
import shutil
import torch
from monai.networks.nets import UNet
from tensorflow.keras import preprocessing
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from sklearn.metrics import accuracy_score, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from PIL import Image

app = Flask(__name__, static_folder='static_folder')
CORS(app)

WEBLINKS = {
        0: 'meningioma/meningioma.html',
        1: 'glioma/glioma.html',
        2: 'amd/amd.html',
        3: '',
        4: '',  #https://gyogyaszportal.hu/agyverzes/
        5: ''   #https://egeszsegvonal.gov.hu/egeszseg-a-z/a-a/agyi-infarktus.html
    }

y_test = np.load('brainTumor_y_test.npy',allow_pickle=True)
X_test = np.load('brainTumor_X_test.npy',allow_pickle=True)

userModel = None

brainTumorModel = load_model('models/BrainTumorClassificationModel.h5')
brainTumorHistory = jl.load('models/BrainTumorClassificationHistory.pkl')

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
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static_folder')
    os.makedirs(app.static_folder, exist_ok=True)

    img_size = (256,256)

    get = request.files['image']
    img = Image.open(get.stream).convert('RGB')
    img = img.convert('L').resize(img_size)

    img = img_to_array(img)
    img = img / 255.0  
    img = np.expand_dims(img,axis=0)
    
    pred = brainTumorModel.predict(img)
    pred_class = int(np.argmax(pred,axis=1)[0]) # 1 for meningioma, 2 for glioma, 3 for pituitary tumor
    pred_prob = float(np.max(pred))

    if pred_class == 0 or pred_class == 1 or pred_class == 2:
        model = UNet(
            spatial_dims=2,
            in_channels=1,       
            out_channels=1,      
            channels=(16, 32, 64, 128, 256),
            strides=(2, 2, 2, 2),
            num_res_units=2,
        ).to("cpu")
        
        model.load_state_dict(torch.load('models/unet_weights.pth', map_location=torch.device('cpu')))
        model.eval()

        image = np.transpose(img,(0,3,1,2))
        image = torch.tensor(image,dtype=torch.float32)
        output = model(image)
        preds = torch.sigmoid(output)
        binary_preds = (preds>0.5).float()
        matplotlib.use('Agg')
        plt.figure(figsize=(12, 8))
        plt.imshow(binary_preds[0][0].cpu(), cmap='Reds')
        plt.imshow(img[0][:,:,0], cmap='gray', alpha=0.5)
        plt.axis('off')
        result_path = os.path.join(static_dir, 'result.jpg')

        plt.savefig(result_path, bbox_inches='tight', pad_inches=0)

    

    print(f"Predicted class: {pred_class}, Probability: {pred_prob}")
    return jsonify({'message': 'Image received successfully', 
                    'prediction': pred_class,
                    'accuracy': pred_prob,
                    'result_image': f'http://localhost:5000/image/result.jpg' if pred_class == 0 or pred_class == 1 or pred_class == 2 else None
                    })

@app.route('/api/userModel', methods=['POST'])
def user_model():
    input_folder = '/Normal_images'
    db = 0
    for file_name in sorted(os.listdir(input_folder)):
            if file_name.endswith('.jpg'):
                file_path = os.path.join(input_folder,file_name)
                
                img = preprocessing.image.load_img(file_path,target_size=(256, 256),
                                                    color_mode="grayscale")
                image_array = preprocessing.image.img_to_array(img)
                image_array = image_array/255.0
                db+=1
                X.append(image_array)
                y.append(1)

    files = request.files.getlist("images")
    X = []
    y = []
    for get in files:
        img_size = (256,256)
        img = Image.open(get.stream).convert('L').resize(img_size)
        img = img_to_array(img)
        img = img / 255.0  
        img = np.expand_dims(img,axis=0)
        X.append(img)
        y.append(0) 
    epochs = int(request.form.get("epochs"))
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

    model = LogisticRegression(max_iter=epochs)
    model.fit(np.array(X_train).reshape(len(X_train), -1), y_train)

    userModel = model
    return jsonify({'message': f'Sikeresen megkaptuk a fájlokat és az epoch számot: {len(files)} fájl és {epochs} epoch.'})

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
            "link": f"http://localhost:5000/pages/{WEBLINKS[tumor_type]}", #"https://orvos24.com/meningioma-tunetek-okok-kezelesek'>https://orvos24.com/meningioma-tunetek-okok-kezelesek",
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
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}', #"https://orvos24.com/a-glioma-tunetei-es-okai",
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
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}',#"https://egeszsegvonal.gov.hu/egeszseg-a-z/a-a/agyalapi-mirigy-daganata.html",
            "accuracy": accuracy,}
    elif tumor_type == 3:    
        result = {
            "label": 'Egészséges kép',
            "content": "A feltöltött képen nem található semmilyen elváltozás/tumor.",
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}',
            "accuracy": accuracy,}
    elif tumor_type == 4:    
        result = {
            "label": 'Agyvérzés',
            "content": "Az agyvérzés egy életveszélyes állapot, amikor az agyban egy agyi ér" 
                        "sérül és elpattan. Az agyban vérzés alakul ki, ez kívülről nem látszik, és ezáltal" 
                        "a koponyában felgyülemlik a vér és megnő a nyomás, ami meg tudja ölni az agyi sejteket." 
                        "Ez meg tudja gátolni a további vér és oxigén ellátását az agynak, ami szükséges a működéshez"
                        " és a túléléshez. Az agyvérzésnek több tünete is lehet ami gyorsan rosszabbodhat és agykárosodást"
                        " is okozhat, de akár halálos is lehet. Az agyvérzésnek tünete a fejfájás, szédülés, beszédnehézség" 
                        "és a beszéd megértése, egy oldalas gyengeség, ez arcon is és kézen is jelentkezhet, ezeken kívül más"
                        " tünet is jelentkezhet, de ha ilyen tüneteket vél felfedezni, minél előbb hívja a mentőket."
                        "További tünetek és részletesebb leírás ezen a linken érhető el:",
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}',
            "accuracy": accuracy,}
    elif tumor_type == 5:    
        result = {
            "label": "Agyi infarktus",
            "content": "Az agyi infarktus nagyon hasonlít egy agyvérzéshez, mint tünetekben mint végeredményben is." 
            "Viszont az esetek nagyobb részében agyi infarktusról beszélünk. Az agyi infarktus akkor alakul ki mikor" 
            " az agy egy része nem kapnak vért  érelzáródás miatt. Mivel az agynak szüksége van folyamatos oxigén és "
            "tápanyag ellátásra, ezért az agysejtek ilyen esetekben perceken belül nekiállnak meghalni. Az agyi infarktusnak " 
            "főbb tünetei a beszédzavar, egy oldalas gyengeség, bénulás ami arcon vagy kézen jelentkezik. Ha ilyen tüneteket "
            "vél felfedezni valakin hívja a mentőket és jegyzezze fel az időpontot mikor jelentkeztek elösszőr ezek a tünetek."
            " Részletesebb leíráshoz olvasson tovább a következő linken:",
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}',
            "accuracy": accuracy,}
    else:
        result = {
            "label": 'Valami más',
            "content": "Valami más típusú elváltozás lehet.",
            "accuracy": accuracy,
        }

    return jsonify(result)

@app.route('/image/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/pages/<path:filename>')
def websites(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/disease/<int:tumor_type>', methods=['GET'])
def disease_info(tumor_type):
   
    # Lekérjük az elérési utat
    file_path = WEBLINKS[tumor_type]
    print(f"Fájl elérési útja: {file_path}")
    
    if not os.path.exists(file_path):
        return jsonify({'error': f'Fájl nem található: {file_path}'}), 404
    
    return send_file(file_path, mimetype='text/html')

if __name__ == '__main__':
    app.run(port=5000,debug=False)
  
import shutil
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import joblib as jl
import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib
import matplotlib.pyplot as plt
import os
import cv2
import torch
import time
from monai.networks.nets import UNet
from tensorflow.keras import preprocessing
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from sklearn.metrics import accuracy_score, classification_report
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from PIL import Image
from werkzeug.utils import secure_filename 

# Initialization of the Flask application and CORS configuration
app = Flask(__name__, static_folder='static_folder')
CORS(app)

#Mapping predicted classes to informational web pages
WEBLINKS = {
        0: 'meningioma/meningioma.html',
        1: 'glioma/glioma.html',
        2: 'amd/amd.html',
        4: 'agyverzes/agyverzes.html', 
        5: 'agyinfarktus/AgyiInfarktus.html' 
    }

# Load test data and pre-trained model for classification
y_test = np.load('brainTumor_y_test.npy',allow_pickle=True)
X_test = np.load('brainTumor_X_test.npy',allow_pickle=True)

#Global variables for user model and labels
userModel = None
userLabels = []

# Load pre-trained classification model and its training history
brainTumorModel = load_model('models/BrainTumorClassificationModel.h5')
brainTumorHistory = jl.load('models/BrainTumorClassificationHistory.pkl')

def clear_uploads(bool=False):
    """
    Removes uploaded files and folders.
    
    If bool=True → full cleanup.
    If bool=False → removes only files older than 3 hours.
    """
    folder = 'uploads'
    now = time.time()
    if os.path.exists(folder):
        for item in os.listdir(folder):
            item_path = os.path.join(folder, item)
            if bool:
                if os.path.isfile(item_path):
                    os.remove(item_path)
                elif os.path.isdir(item_path):
                    shutil.rmtree(item_path)
            else:
                if now - os.path.getmtime(item_path) > 10800:  # 3600 = 1 óra, 
                    if os.path.isfile(item_path):
                        os.remove(item_path)
                    elif os.path.isdir(item_path):
                        shutil.rmtree(item_path)

def prediction (model, X):
    """
    Runs prediction on the given model.
    Returns raw probability outputs.
    """
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
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Handles image upload and performs classification.
    If tumor is detected, segmentation is also applied.
    """
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
    pred_class = int(np.argmax(pred,axis=1)[0]) 
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

        pic = img
        bin = (binary_preds.detach().cpu().numpy()[0,0]>0.5)
        rgb = cv2.cvtColor((pic[0,:,:,0]*255).astype(np.uint8), cv2.COLOR_GRAY2BGR)
        bin_color = np.zeros_like(rgb)
        bin_color[bin] = [0,250,250]
        blended = cv2.addWeighted(rgb,1.0,bin_color,0.4,0)

        matplotlib.use('Agg')
        plt.figure(figsize=(12, 8))
        plt.imshow(blended)
        plt.axis('off')
        result_path = os.path.join(static_dir, 'result.jpg')

        plt.savefig(result_path, bbox_inches='tight', pad_inches=0)

    print(f"Predicted class: {pred_class}, Probability: {pred_prob}")
    if (pred_prob>=0.60):
        return jsonify({'message': 'Image received successfully', 
                        'prediction': pred_class,
                        'accuracy': pred_prob,
                        'result_image': f'http://localhost:5000/image/result.jpg' if pred_class <= 2 else None
                        })
    else:
        return jsonify({'message': 'Image received successfully', 
                        'prediction': 10,
                        'accuracy': pred_prob,
                        'result_image': None
                        })

@app.route('/api/userModel', methods=['POST'])
def user_model():
    """
    Handles image upload and performs classification.
    If tumor is detected, segmentation is also applied.
    """
    global userModel
    global userLabels
    userLabels = ['egészséges']
    input_folder = 'Normal_images'
    classes = 0
    X = []
    y = []
    numtypes = int(request.form.get("numtypes"))
    image_size = (128, 128)    
    if os.path.exists(input_folder):
        db = 0
        for file_name in sorted(os.listdir(input_folder)):
            if file_name.endswith('.jpg'):
                if db >= 30: break
                else:
                    file_path = os.path.join(input_folder,file_name)
                    
                    img = preprocessing.image.load_img(file_path,target_size=image_size,
                                                        color_mode="grayscale")
                    image_array = preprocessing.image.img_to_array(img)
                    image_array = image_array.flatten()/255.0
                    X.append(image_array)
                    y.append(classes)
                    db+=1
        classes+=1

    for i in range(numtypes):
        label = request.form.get(f"label_{i}")
        userLabels.append(label)

    for i in range(numtypes):
        images = request.files.getlist(f"type_{i}")
        if len(images) != 0:
            db = 0
            for get in images:
                if db >= 30: break
                else:
                    img = Image.open(get.stream).convert('L').resize(image_size)
                    img = img_to_array(img)
                    img = img.flatten() / 255.0  
                    X.append(img)
                    y.append(classes)
                    db+=1
            classes+=1 

    X = np.array(X)
    y = np.array(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

    model = RandomForestClassifier(max_depth=8, n_estimators=200)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    userModel = model

    clear_uploads(True)

    return jsonify({
        "num_classes": classes
    })

@app.route("/api/saveChanges", methods=['POST'])
def save_change():
    """
    Saves images and label updates for a specific class.
    Handles folder renaming dynamically based on label changes.
    """
    clear_uploads()
    type_index = int(request.form.get("type_index"))
    label = request.form.get("label")
    
    folder = os.path.join('uploads', f"type_{type_index}_{label}")
    

    for i in os.listdir('uploads'):
        if i.startswith(f"type_{type_index}_"):
            os.rename(os.path.join('uploads', i), folder)

    os.makedirs(folder, exist_ok=True)
    

    images = request.files.getlist("images")
    for image in images:
        filename = secure_filename(image.filename)
        image.save(os.path.join(folder, filename))
    return jsonify({"message": "Changes saved successfully"})

@app.route("/api/loadUserData", methods=['GET'])
def load_user_data():
    """
    Loads saved user data (labels + image paths) from uploads directory.
    Used to restore frontend state.
    """
    folder = 'uploads'
    result = []
    if not os.path.exists(folder):
        return jsonify({"message": "No user data found", "data": []})
    
    for label in sorted(os.listdir(folder)):
        label_folder = os.path.join(folder, label)
        if os.path.isdir(label_folder):
            label_parts = label.split('_')
            if len(label_parts) > 2:
                label_name = '_'.join(label_parts[2:])
            else:
                label_name = ""

            images = []
            for img in os.listdir(label_folder):
                image_path = f"http://localhost:5000/uploads/{label}/{img}"
                images.append(image_path)
            result.append({"label": label_name, "images": images })

    return jsonify({
        "data": result
    })

@app.route('/api/userupload',methods=['POST'])
def UserModelImageAnalysis():
    """
    Runs prediction using the user-trained model.
    Returns predicted label and confidence.
    """
    global userModel
    global userLabels
    img_size = (128,128)

    get = request.files['image']
    img = Image.open(get.stream)
    img = img.convert('L').resize(img_size)

    img = img_to_array(img)
    img = img.flatten() / 255.0  
    img = np.expand_dims(img,axis=0)

    pred = userModel.predict_proba(img)
    accuracy = float(np.max(pred))
    print("Prediction: ",pred)
    prediction = int(np.argmax(pred))
    print('User labels:',userLabels[prediction])
    print('Accuracy',accuracy)
    if accuracy >= 0.60:
        return jsonify({
            "prediction": prediction,
            "accuracy": accuracy,
            "label": userLabels[prediction]
        })
    else:
        return jsonify({
            "prediction": 10,
            "accuracy": accuracy,
            "label": 'Nem biztos'
        })

@app.route('/api/checkUserModel', methods=['GET'])
def check_user_model():
    """
    Checks whether a user-trained model is currently available in memory.
    """
    if userModel is None:
        return jsonify({"model_loaded": False})
    return jsonify({"model_loaded": True})

@app.route('/imageAnalyze/result', methods=['GET'])
def image_analyze_result():
    tumor_type = request.args.get('type', type=int)
    accuracy = request.args.get('accuracy',type=float)
    
    print("Tumor type received:", tumor_type)
    if tumor_type == 0:
        result = {
            "label": 'Meningeóma',
            "content": '''Olyan típusú elváltozás, amelynél a daganat az agy felszínéhez közel helyezkedik el, és lassan növekszik befelé.
                        Általában jóindulatú, azonban nagyobb méret elérése esetén életveszélyessé válhat.
                        Leggyakoribb tünetei közé tartozik a fejfájás, valamint a kéz és a láb gyengesége, de az elhelyezkedéstől 
                        függően egyéb neurológiai tünetek is jelentkezhetnek.''',
            "link": f"http://localhost:5000/pages/{WEBLINKS[tumor_type]}", 
            "accuracy": accuracy,
        }
    elif tumor_type == 1:
        result = {
            "label": 'Glióma',
            "content": '''Olyan daganattípus, amely az agyban és a gerincvelőben, az idegsejteket körülvevő támogató sejtekből alakulhat ki.
                        Ezek a sejtek normál esetben az idegsejtek működését segítik.
                        Ez az agydaganatok leggyakoribb típusa.
                        Tünetei sokfélék lehetnek, és leginkább az agyi működés, illetve az idegrendszer működésének megváltozására utalnak.''',
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}', 
            "accuracy": accuracy,}
    elif tumor_type == 2:
        result = {
            "label": 'Agyalapi mirigy daganat',
            "content": '''Az ilyen típusú elváltozások többsége jóindulatú.
                        A tünetek változatosak lehetnek, a diagnózis felállítását pedig
                        vér- és vizeletvizsgálatok, valamint képalkotó eljárások segítik.
                        Ez a daganattípus nem ad áttétet más szervekbe, azonban
                        a szervezet hormontermelésében változásokat okozhat.''',
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}',
            "accuracy": accuracy,}
    elif tumor_type == 3:    
        result = {
            "label": 'Egészséges kép',
            "content": '''A feltöltött képen nem található kimutatható elváltozás vagy daganat.''',
            "link": '',
            "accuracy": accuracy,}
    elif tumor_type == 4:    
        result = {
            "label": 'Agyvérzés',
            "content": '''Az agyvérzés egy életveszélyes állapot, amely akkor alakul ki, amikor az agyban egy ér megsérül és megreped. 
                        Ennek következtében vérzés keletkezik az agyban, ami kívülről nem látható, viszont a koponyán belüli nyomás megnő. 
                        Ez károsíthatja vagy el is pusztíthatja az agysejteket.
                        A kialakuló vérzés akadályozhatja az agy megfelelő vérellátását és oxigénellátását, ami elengedhetetlen a normális működéshez
                         és a túléléshez. Az agyvérzés tünetei gyorsan súlyosbodhatnak, maradandó agykárosodást okozhatnak, 
                         és akár halálos kimenetelűek is lehetnek.
                        Gyakori tünetei közé tartozik az erős fejfájás, szédülés, beszédzavar vagy a beszéd megértésének nehézsége, valamint az arc, 
                        a kar vagy a láb egyik oldalának gyengesége. Ha ezek közül bármelyik tünet jelentkezik, haladéktalanul hívja a mentőket.'''
                        ,
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}',
            "accuracy": accuracy,}
    elif tumor_type == 5:    
        result = {
            "label": "Agyi infarktus",
            "content": '''Az agyi infarktus tüneteiben és következményeiben nagyon hasonló az agyvérzéshez, ugyanakkor az esetek többségében 
                        agyér-elzáródásról (agyi infarktusról) beszélünk.
                        Az agyi infarktus akkor alakul ki, amikor az agy egy területe nem jut megfelelő mennyiségű vérhez egy ér elzáródása miatt. 
                        Mivel az agy folyamatos oxigén- és tápanyagellátást igényel, az érintett agysejtek perceken belül károsodni, majd elhalni 
                        kezdenek. Leggyakoribb tünetei közé tartozik a beszédzavar, az arc, a kar vagy a láb egyik oldalának gyengesége vagy bénulása. 
                        Amennyiben ilyen tüneteket észlel valakin, azonnal hívja a mentőket, és lehetőség szerint jegyezze fel, mikor jelentkeztek 
                        először a tünetek, mert ez kulcsfontosságú az ellátás szempontjából.''',
            "link": f'http://localhost:5000/pages/{WEBLINKS[tumor_type]}',
            "accuracy": accuracy,}
    else:
        result = {
            "label": 'Valami más',
            "content": '''A feltöltött kép alapján más típusú elváltozás is fennállhat. A pontos diagnózis érdekében javasolt szakorvoshoz fordulni, 
                        aki további vizsgálatokkal meg tudja állapítani a probléma okát.''',
            "link": "",
            "accuracy": accuracy,
        }

    return jsonify(result)

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory('uploads', filename)

@app.route('/image/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/pages/<path:filename>')
def websites(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/disease/<int:tumor_type>', methods=['GET'])
def disease_info(tumor_type):
   
    file_path = WEBLINKS[tumor_type]
    print(f"Fájl elérési útja: {file_path}")
    
    if not os.path.exists(file_path):
        return jsonify({'error': f'Fájl nem található: {file_path}'}), 404
    
    return send_file(file_path, mimetype='text/html')

if __name__ == '__main__':
    """
    Ensure no stale uploaded data remains on server start
        and run the Flask application.
    """ 
    clear_uploads(True)
    app.run(port=5000,debug=False)
  
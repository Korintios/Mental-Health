import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import numpy as np

# Cargar los datos
file_path = 'Student Mental health.csv'
data = pd.read_csv(file_path)

# Preprocesar los datos
# Convertir las columnas categóricas en números con LabelEncoder
label_encoders = {}
categorical_columns = ['Choose your gender', 'What is your course?', 'Your current year of Study', 'Marital status', 
                       'Do you have Depression?', 'Do you have Anxiety?', 'Do you have Panic attack?', 
                       'Did you seek any specialist for a treatment?']

for col in categorical_columns:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    label_encoders[col] = le

# Crear la columna de estrés (si tiene depresión, ansiedad o ataques de pánico)
data['Stress'] = data[['Do you have Depression?', 'Do you have Anxiety?', 'Do you have Panic attack?']].sum(axis=1)
data['Stress'] = (data['Stress'] > 0).astype(int)

# Convertir los rangos de CGPA en valores numéricos (promedio del rango)
def convert_cgpa(cgpa):
    if isinstance(cgpa, str):
        # Si el valor es un rango como '3.00 - 3.49', lo convertimos en el promedio del rango
        cgpa_range = cgpa.split(' - ')
        return (float(cgpa_range[0]) + float(cgpa_range[1])) / 2
    return float(cgpa)  # Si ya es un número, lo dejamos tal cual

data['What is your CGPA?'] = data['What is your CGPA?'].apply(convert_cgpa)

# Seleccionar las características y el objetivo
X = data[['Age', 'Choose your gender', 'Your current year of Study', 'What is your course?', 
          'What is your CGPA?', 'Marital status', 'Did you seek any specialist for a treatment?']]
y = data['Stress']

# Dividir los datos en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Entrenar un modelo de Random Forest
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluar el modelo
from sklearn.metrics import accuracy_score
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy * 100:.2f}%')

# Guardar el modelo entrenado
joblib.dump(model, 'stress_model.pkl')
print("Modelo guardado exitosamente.")

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

# Cargar el modelo previamente entrenado
model = joblib.load('stress_model.pkl')  # Asegúrate de que la ruta al modelo sea correcta

# Crear la aplicación FastAPI
app = FastAPI()

# Configurar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia esto a la URL de tu frontend en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definir el modelo de datos de entrada
class InputData(BaseModel):
    age: float
    gender: int  # 0 para masculino, 1 para femenino
    year_of_study: int
    course: int  # El índice del curso (deberías ajustar esto según cómo están representados los cursos)
    cgpa: float
    marital_status: int  # 0 para no, 1 para sí
    specialist_treatment: int  # 0 para no, 1 para sí

# Endpoint para verificar si el servidor está funcionando
@app.get("/health")
def health_check():
    return {"status": "Server is running"}

# Endpoint para hacer predicción sobre si una persona sufre de estrés
@app.post("/predict")
def predict(data: InputData):
    # Convertir los datos de entrada a un formato adecuado para el modelo
    input_array = np.array([[data.age, data.gender, data.year_of_study, data.course, data.cgpa,
                             data.marital_status, data.specialist_treatment]])
    
    # Realizar la predicción
    prediction = model.predict(input_array)
    
    # Devolver el resultado de la predicción
    if prediction[0] == 1:
        return {"stress": "Yes"}
    else:
        return {"stress": "No"}

# Endpoint para predecir el estrés de múltiples entradas
@app.post("/predict_multiple")
def predict_multiple(data: list[InputData]):
    # Convertir la lista de datos de entrada a un DataFrame
    input_df = pd.DataFrame([item.model_dump() for item in data])
    
    # Convertir el DataFrame a un formato adecuado para el modelo
    input_array = input_df.to_numpy()
    
    # Realizar la predicción
    predictions = model.predict(input_array)
    
    # Devolver los resultados de la predicción
    results = [{"stress": "Yes" if pred == 1 else "No"} for pred in predictions]
    return {"predictions": results}
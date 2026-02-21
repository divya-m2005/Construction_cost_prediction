from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionInput, PredictionOutput
from model import load_model, predict_cost
import uvicorn

app = FastAPI(
    title="Construction Cost Prediction API",
    description="Predicts construction costs based on project features",
    version="1.0.0"
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
model, scaler, label_encoders = load_model()


@app.get("/")
def root():
    return {"message": "Construction Cost Prediction API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictionOutput)
def predict(data: PredictionInput):
    try:
        result = predict_cost(data, model, scaler, label_encoders)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/feature-importance")
def feature_importance():
    if hasattr(model, "feature_importances_"):
        feature_names = [
            "area_sqft", "num_floors", "project_type", "location_zone",
            "foundation_type", "wall_material", "roof_type",
            "has_basement", "has_parking", "quality_grade",
            "soil_type", "distance_to_city_center"
        ]
        importances = model.feature_importances_.tolist()
        return {
            "features": feature_names,
            "importances": importances
        }
    return {"message": "Feature importance not available for this model"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

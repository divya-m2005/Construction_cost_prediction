from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionInput, PredictionOutput, TrendOutput, OptimizeInput, OptimizeOutput
from model import load_model, predict_cost, get_cost_trend, optimize_budget
import uvicorn

app = FastAPI(
    title="Construction Cost Prediction API",
    description="Predicts construction costs based on project features",
    version="1.0.0"
)

# CORS for React frontend - Broadened for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
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


@app.get("/analytics/trend", response_model=TrendOutput)
def trend_forecasting():
    try:
        return get_cost_trend()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/parse-intent")
def parse_intent(data: dict):
    from model import parse_natural_language
    query = data.get("query", "")
    parsed = parse_natural_language(query)
    return {"auto_fill": parsed}



@app.post("/analytics/optimize", response_model=OptimizeOutput)
def budget_optimizer(data: OptimizeInput):
    try:
        # Pass the global model, scaler, and encoders
        return optimize_budget(data, model, scaler, label_encoders)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

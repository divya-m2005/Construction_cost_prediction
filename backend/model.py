import os
import pickle
import numpy as np
from pathlib import Path

MODEL_DIR = Path(__file__).parent / "app" / "saved_model"
MODEL_PATH = MODEL_DIR / "model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
ENCODERS_PATH = MODEL_DIR / "label_encoders.pkl"


def load_model():
    model, scaler, label_encoders = None, None, {}
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
    else:
        print("Warning: No saved model found. Run train_model.py first.")
    if SCALER_PATH.exists():
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
    if ENCODERS_PATH.exists():
        with open(ENCODERS_PATH, "rb") as f:
            label_encoders = pickle.load(f)
    return model, scaler, label_encoders


def encode_input(data, label_encoders: dict) -> np.ndarray:
    categorical_cols = [
        "project_type", "location_zone", "foundation_type",
        "wall_material", "roof_type", "quality_grade", "soil_type"
    ]
    encoded = {}
    for col in categorical_cols:
        val = getattr(data, col)
        if hasattr(val, 'value'):
            val = val.value
        if col in label_encoders:
            try:
                encoded[col] = label_encoders[col].transform([val])[0]
            except ValueError:
                encoded[col] = 0
        else:
            encoded[col] = 0

    feature_vector = np.array([
        data.area_sqft,
        data.num_floors,
        encoded["project_type"],
        encoded["location_zone"],
        encoded["foundation_type"],
        encoded["wall_material"],
        encoded["roof_type"],
        int(data.has_basement),
        int(data.has_parking),
        encoded["quality_grade"],
        encoded["soil_type"],
        data.distance_to_city_center
    ]).reshape(1, -1)
    return feature_vector


def get_cost_breakdown(total_cost: float, data) -> dict:
    percentages = {
        "Foundation & Site Work": 0.12,
        "Structural Frame": 0.18,
        "Exterior Finishes": 0.14,
        "Interior Finishes": 0.20,
        "Mechanical, Electrical & Plumbing": 0.22,
        "Roofing": 0.07,
        "Contingency & Overhead": 0.07,
    }
    if data.has_basement:
        percentages["Foundation & Site Work"] += 0.05
        percentages["Contingency & Overhead"] -= 0.05
    return {k: round(v * total_cost, 2) for k, v in percentages.items()}


def get_recommendations(data, predicted_cost: float) -> list:
    recommendations = []

    quality = getattr(data.quality_grade, 'value', data.quality_grade)
    wall = getattr(data.wall_material, 'value', data.wall_material)
    project = getattr(data.project_type, 'value', data.project_type)
    soil = getattr(data.soil_type, 'value', data.soil_type)
    foundation = getattr(data.foundation_type, 'value', data.foundation_type)

    if quality == "luxury":
        recommendations.append("Consider premium grade to reduce cost by ~15% with minimal quality impact.")
    if wall == "steel" and project == "residential":
        recommendations.append("Brick or concrete walls are more cost-effective for residential projects.")
    if data.distance_to_city_center > 30:
        recommendations.append("Remote location increases material transportation costs. Consider local suppliers.")
    if data.has_basement and soil == "rocky":
        recommendations.append("Rocky soil significantly raises basement excavation costs. Slab foundation may be preferable.")
    if data.num_floors > 5 and foundation != "pile":
        recommendations.append("For high-rise construction, pile foundation is recommended for structural safety.")
    if not recommendations:
        recommendations.append("Your current configuration appears cost-optimized for the selected specifications.")
    return recommendations


def predict_cost(data, model, scaler, label_encoders) -> dict:
    quality = getattr(data.quality_grade, 'value', data.quality_grade)
    zone = getattr(data.location_zone, 'value', data.location_zone)
    wall = getattr(data.wall_material, 'value', data.wall_material)

    if model is None:
        base_cost_per_sqft = {
            "economy": 80, "standard": 130, "premium": 200, "luxury": 320
        }.get(quality, 130)
        zone_multiplier = {
            "urban": 1.3, "suburban": 1.0, "rural": 0.8
        }.get(zone, 1.0)
        material_multiplier = {
            "brick": 1.0, "concrete": 1.05, "steel": 1.15,
            "wood": 0.9, "glass": 1.25
        }.get(wall, 1.0)
        cost_per_sqft = base_cost_per_sqft * zone_multiplier * material_multiplier
        if data.has_basement:
            cost_per_sqft *= 1.12
        if data.has_parking:
            cost_per_sqft *= 1.06
        predicted_cost = cost_per_sqft * data.area_sqft * data.num_floors
        confidence = 0.72
    else:
        features = encode_input(data, label_encoders)
        if scaler:
            features = scaler.transform(features)
        predicted_cost = float(model.predict(features)[0])
        confidence = 0.91

    cost_per_sqft = predicted_cost / (data.area_sqft * data.num_floors)
    margin = predicted_cost * 0.12

    return {
        "predicted_cost": round(predicted_cost, 2),
        "cost_per_sqft": round(cost_per_sqft, 2),
        "cost_range_low": round(predicted_cost - margin, 2),
        "cost_range_high": round(predicted_cost + margin, 2),
        "confidence_score": confidence,
        "breakdown": get_cost_breakdown(predicted_cost, data),
        "recommendations": get_recommendations(data, predicted_cost)
    }

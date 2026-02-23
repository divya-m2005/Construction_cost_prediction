import os
import pickle
import numpy as np
import math
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


def detect_anomalies(data, predicted_cost: float, cost_per_sqft: float) -> list[str]:
    anomalies = []
    
    # Anomaly 1: Cost extremes relative to quality
    if data.quality_grade == "economy" and cost_per_sqft > 200:
        anomalies.append("High cost detected for economy grade specifications.")
    if data.quality_grade == "luxury" and cost_per_sqft < 150:
        anomalies.append("Unusually low cost for luxury grade specifications.")
        
    # Anomaly 2: Structural complexity
    if data.num_floors > 10:
        anomalies.append("High floor count may require specialized structural engineering not fully captured.")
        
    # Anomaly 3: Area/Cost ratio
    if data.area_sqft < 100:
        anomalies.append("Micro-project area may result in skewed per-sqft metrics.")
        
    return anomalies


def generate_explanation(data, predicted_cost: float, cost_per_sqft: float) -> str:
    quality = getattr(data.quality_grade, 'value', data.quality_grade)
    zone = getattr(data.location_zone, 'value', data.location_zone)
    
    explanation = f"The estimated cost of {predicted_cost:,.2f} is primarily driven by "
    explanation += f"the {quality} quality standards in a {zone} zone. "
    explanation += f"At {cost_per_sqft:,.2f} per sqft, this includes structural work, finishes, and MEP systems."
    
    if data.has_basement:
        explanation += " The inclusion of a basement adds approximately 12% to the total budget."
        
    return explanation


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points in km."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def predict_cost(data, model, scaler, label_encoders) -> dict:
    # Reference city center (Mumbai: 19.076, 72.877)
    CITY_CENTER = (19.076, 72.877)

    # Dynamic adjustment based on Map Coordinates
    if data.latitude is not None and data.longitude is not None:
        dist = calculate_distance(data.latitude, data.longitude, CITY_CENTER[0], CITY_CENTER[1])
        # Update distance if coordinates are provided
        data.distance_to_city_center = round(dist, 2)
        
        # Determine zone based on distance
        if dist < 12:
            data.location_zone = "urban"
        elif dist < 35:
            data.location_zone = "suburban"
        else:
            data.location_zone = "rural"

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
        
        # Fallback distance factor (matching train_model.py logic: -200 per km)
        # We adjust the total cost by -200 * distance
        predicted_cost = (cost_per_sqft * data.area_sqft * data.num_floors) - (data.distance_to_city_center * 200)
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
        "recommendations": get_recommendations(data, predicted_cost),
        "anomalies": detect_anomalies(data, predicted_cost, cost_per_sqft),
        "explanation": generate_explanation(data, predicted_cost, cost_per_sqft),
        "derived_distance": data.distance_to_city_center,
        "derived_zone": data.location_zone
    }


def get_cost_trend():
    import random
    months = ["Mar 24", "Apr 24", "May 24", "Jun 24", "Jul 24", "Aug 24", "Sep 24", "Oct 24", "Nov 24", "Dec 24", "Jan 25", "Feb 25"]
    
    def generate_trend(base, volatility, trend_up=True):
        data = []
        current = base
        for m in months:
            change = random.uniform(-volatility, volatility)
            if trend_up:
                change += 0.5 # Slight upward trend
            current += change
            data.append({"month": m, "index": round(current, 2)})
        return data

    return {
        "cement": generate_trend(100, 2),
        "steel": generate_trend(100, 5),
        "brick": generate_trend(100, 1.5, trend_up=False), # Bricks might be stabilizing
        "overall": generate_trend(100, 1)
    }


def optimize_budget(data, model, scaler, label_encoders):
    target = data.budget
    suggestions = []
    
    # Simple heuristic search
    grades = ["economy", "standard", "premium", "luxury"]
    floor_options = [1, 2, 3, 5]
    
    for grade in grades:
        for floors in floor_options:
            # Estimate area based on budget
            # Cost = Area * Floors * Rate
            # Area = Cost / (Floors * Rate)
            
            # Rough rate estimate for inverse calculation
            base_rate = {"economy": 1000, "standard": 1800, "premium": 2800, "luxury": 4500}[grade]
            estimated_area = target / (floors * base_rate)
            
            if estimated_area < 500: continue
            if estimated_area > 50000: continue
            
            # Refine prediction with the actual model logic
            from schemas import PredictionInput
            test_input = PredictionInput(
                area_sqft=round(estimated_area, -1),
                num_floors=floors,
                project_type=data.project_type,
                location_zone=data.location_zone,
                foundation_type="slab",
                wall_material="brick",
                roof_type="gable",
                has_basement=False,
                has_parking=True,
                quality_grade=grade,
                soil_type="loamy",
                distance_to_city_center=10.0
            )
            
            res = predict_cost(test_input, model, scaler, label_encoders)
            cost = res["predicted_cost"]
            
            if cost <= target * 1.1: # Allow 10% tolerance for suggestions
                suggestions.append({
                    "area_sqft": test_input.area_sqft,
                    "num_floors": test_input.num_floors,
                    "quality_grade": grade,
                    "estimated_cost": cost
                })
    
    # Sort by closeness to budget without going over too much
    suggestions.sort(key=lambda x: abs(x["estimated_cost"] - target))
    return {"suggestions": suggestions[:3]}



def parse_natural_language(query: str) -> dict:
    import re
    query = query.lower()
    
    # Defaults
    result = {
        "area_sqft": 2000,
        "num_floors": 2,
        "project_type": "residential",
        "location_zone": "suburban",
        "quality_grade": "standard"
    }
    
    # Extract Area
    area_match = re.search(r"(\d+)\s*(sqft|sq\s*ft|square\s*feet|feet)", query)
    if area_match:
        result["area_sqft"] = int(area_match.group(1))
    
    # Extract Floors
    floor_match = re.search(r"(\d+)\s*(floor|floors|story|stories|storey)", query)
    if floor_match:
        result["num_floors"] = int(floor_match.group(1))
    
    # Extract Quality
    if "economy" in query or "cheap" in query or "low cost" in query:
        result["quality_grade"] = "economy"
    elif "premium" in query or "high" in query:
        result["quality_grade"] = "premium"
    elif "luxury" in query or "elite" in query:
        result["quality_grade"] = "luxury"
        
    # Extract Zone
    if "urban" in query or "city" in query or "center" in query:
        result["location_zone"] = "urban"
    elif "rural" in query or "village" in query or "outskirts" in query:
        result["location_zone"] = "rural"
        
    # Extract Project Type
    if "commercial" in query or "office" in query or "shop" in query:
        result["project_type"] = "commercial"
    elif "industrial" in query or "factory" in query:
        result["project_type"] = "industrial"
        
    return result

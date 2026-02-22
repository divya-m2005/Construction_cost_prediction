from pydantic import BaseModel
from typing import Optional


class PredictionInput(BaseModel):
    area_sqft: float
    num_floors: int
    project_type: str
    location_zone: str
    foundation_type: str
    wall_material: str
    roof_type: str
    has_basement: bool
    has_parking: bool
    quality_grade: str
    soil_type: str
    distance_to_city_center: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PredictionOutput(BaseModel):
    predicted_cost: float
    cost_per_sqft: float
    cost_range_low: float
    cost_range_high: float
    confidence_score: float
    breakdown: dict
    recommendations: list
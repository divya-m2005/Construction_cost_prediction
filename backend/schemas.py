from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ProjectType(str, Enum):
    residential = "residential"
    commercial = "commercial"
    industrial = "industrial"
    infrastructure = "infrastructure"


class FoundationType(str, Enum):
    slab = "slab"
    crawl_space = "crawl_space"
    basement = "basement"
    pile = "pile"


class WallMaterial(str, Enum):
    brick = "brick"
    concrete = "concrete"
    steel = "steel"
    wood = "wood"
    glass = "glass"


class RoofType(str, Enum):
    flat = "flat"
    gable = "gable"
    hip = "hip"
    mansard = "mansard"


class QualityGrade(str, Enum):
    economy = "economy"
    standard = "standard"
    premium = "premium"
    luxury = "luxury"


class LocationZone(str, Enum):
    urban = "urban"
    suburban = "suburban"
    rural = "rural"


class SoilType(str, Enum):
    clay = "clay"
    sandy = "sandy"
    rocky = "rocky"
    loamy = "loamy"


class PredictionInput(BaseModel):
    area_sqft: float = Field(..., gt=0, le=1000000, description="Total area in square feet")
    num_floors: int = Field(..., ge=1, le=100, description="Number of floors")
    project_type: ProjectType = Field(..., description="Type of construction project")
    location_zone: LocationZone = Field(..., description="Location zone")
    foundation_type: FoundationType = Field(..., description="Foundation type")
    wall_material: WallMaterial = Field(..., description="Primary wall material")
    roof_type: RoofType = Field(..., description="Roof type")
    has_basement: bool = Field(default=False, description="Whether project has a basement")
    has_parking: bool = Field(default=False, description="Whether project includes parking")
    quality_grade: QualityGrade = Field(..., description="Construction quality grade")
    soil_type: SoilType = Field(..., description="Soil type at location")
    distance_to_city_center: float = Field(..., ge=0, le=500, description="Distance to city center in km")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude for map visualization")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude for map visualization")

    class Config:
        json_schema_extra = {
            "example": {
                "area_sqft": 5000,
                "num_floors": 3,
                "project_type": "residential",
                "location_zone": "suburban",
                "foundation_type": "slab",
                "wall_material": "brick",
                "roof_type": "gable",
                "has_basement": False,
                "has_parking": True,
                "quality_grade": "standard",
                "soil_type": "loamy",
                "distance_to_city_center": 10.5,
                "latitude": 40.7128,
                "longitude": -74.0060
            }
        }


class PredictionOutput(BaseModel):
    predicted_cost: float = Field(..., description="Predicted total construction cost in USD")
    cost_per_sqft: float = Field(..., description="Predicted cost per square foot")
    cost_range_low: float = Field(..., description="Lower bound of cost estimate (90% CI)")
    cost_range_high: float = Field(..., description="Upper bound of cost estimate (90% CI)")
    confidence_score: float = Field(..., description="Model confidence score (0-1)")
    breakdown: dict = Field(..., description="Cost breakdown by category")
    recommendations: list = Field(..., description="Cost optimization recommendations")

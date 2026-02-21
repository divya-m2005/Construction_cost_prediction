"""
Construction Cost Prediction - Model Training Script
Trains a Gradient Boosting (XGBoost) regression model on construction cost data.
"""

import os
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings("ignore")

# Try to import XGBoost (preferred), fall back to sklearn
try:
    from xgboost import XGBRegressor
    USE_XGBOOST = True
except ImportError:
    USE_XGBOOST = False
    print("XGBoost not found. Using GradientBoostingRegressor.")

PROCESSED_DATA_PATH = Path("../data/processed/construction_data_processed.csv")
MODEL_DIR = Path("app/saved_model")
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def generate_synthetic_data(n_samples: int = 5000) -> pd.DataFrame:
    """Generate synthetic training data when real data is unavailable."""
    np.random.seed(42)

    project_types = ["residential", "commercial", "industrial", "infrastructure"]
    location_zones = ["urban", "suburban", "rural"]
    foundation_types = ["slab", "crawl_space", "basement", "pile"]
    wall_materials = ["brick", "concrete", "steel", "wood", "glass"]
    roof_types = ["flat", "gable", "hip", "mansard"]
    quality_grades = ["economy", "standard", "premium", "luxury"]
    soil_types = ["clay", "sandy", "rocky", "loamy"]

    df = pd.DataFrame({
        "area_sqft": np.random.uniform(500, 50000, n_samples),
        "num_floors": np.random.randint(1, 20, n_samples),
        "project_type": np.random.choice(project_types, n_samples),
        "location_zone": np.random.choice(location_zones, n_samples),
        "foundation_type": np.random.choice(foundation_types, n_samples),
        "wall_material": np.random.choice(wall_materials, n_samples),
        "roof_type": np.random.choice(roof_types, n_samples),
        "has_basement": np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        "has_parking": np.random.choice([0, 1], n_samples, p=[0.5, 0.5]),
        "quality_grade": np.random.choice(quality_grades, n_samples),
        "soil_type": np.random.choice(soil_types, n_samples),
        "distance_to_city_center": np.random.uniform(0, 100, n_samples),
    })

    # Compute cost with realistic factors
    base = {
        "economy": 80, "standard": 130, "premium": 200, "luxury": 320
    }
    zone_mult = {"urban": 1.3, "suburban": 1.0, "rural": 0.8}
    material_mult = {
        "brick": 1.0, "concrete": 1.05, "steel": 1.15, "wood": 0.9, "glass": 1.25
    }

    cost = (
        df["area_sqft"]
        * df["num_floors"].map(lambda x: 1 + (x - 1) * 0.05)
        * df["quality_grade"].map(base)
        * df["location_zone"].map(zone_mult)
        * df["wall_material"].map(material_mult)
        + df["has_basement"] * df["area_sqft"] * 15
        + df["has_parking"] * 12000
        - df["distance_to_city_center"] * 200
    )

    # Add realistic noise
    df["total_cost"] = cost * np.random.uniform(0.92, 1.08, n_samples)
    df["total_cost"] = df["total_cost"].clip(lower=50000)

    return df


def preprocess_data(df: pd.DataFrame):
    """Encode categoricals, scale features, split data."""
    categorical_cols = [
        "project_type", "location_zone", "foundation_type",
        "wall_material", "roof_type", "quality_grade", "soil_type"
    ]
    numerical_cols = [
        "area_sqft", "num_floors", "has_basement",
        "has_parking", "distance_to_city_center"
    ]

    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    feature_cols = numerical_cols + categorical_cols
    X = df[feature_cols].values
    y = df["total_cost"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler, label_encoders


def train_model(X_train, y_train):
    """Train the best available regression model."""
    if USE_XGBOOST:
        model = XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0
        )
    else:
        model = GradientBoostingRegressor(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            random_state=42
        )

    model.fit(X_train, y_train)
    return model


def evaluate_model(model, X_test, y_test):
    """Print comprehensive evaluation metrics."""
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

    print("\n" + "="*50)
    print("MODEL EVALUATION RESULTS")
    print("="*50)
    print(f"  MAE  : ${mae:,.2f}")
    print(f"  RMSE : ${rmse:,.2f}")
    print(f"  R²   : {r2:.4f}")
    print(f"  MAPE : {mape:.2f}%")
    print("="*50)
    return {"mae": mae, "rmse": rmse, "r2": r2, "mape": mape}


def save_artifacts(model, scaler, label_encoders):
    """Persist model and preprocessing artifacts."""
    with open(MODEL_DIR / "model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open(MODEL_DIR / "scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    with open(MODEL_DIR / "label_encoders.pkl", "wb") as f:
        pickle.dump(label_encoders, f)
    print(f"\nModel artifacts saved to {MODEL_DIR}/")


def main():
    print("Construction Cost Prediction - Model Training")
    print("-" * 50)

    # Load or generate data
    if PROCESSED_DATA_PATH.exists():
        print(f"Loading data from {PROCESSED_DATA_PATH}")
        df = pd.read_csv(PROCESSED_DATA_PATH)
    else:
        print("No dataset found. Generating synthetic training data...")
        df = generate_synthetic_data(5000)
        df.to_csv(PROCESSED_DATA_PATH, index=False)
        print(f"Synthetic data saved to {PROCESSED_DATA_PATH}")

    print(f"Dataset: {df.shape[0]} samples, {df.shape[1]} features")

    # Preprocess
    X, y, scaler, label_encoders = preprocess_data(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Training samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")

    # Train
    print("\nTraining model...")
    model = train_model(X_train, y_train)

    # Evaluate
    metrics = evaluate_model(model, X_test, y_test)

    # Save
    save_artifacts(model, scaler, label_encoders)
    print("\nTraining complete! Run the API with: uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()

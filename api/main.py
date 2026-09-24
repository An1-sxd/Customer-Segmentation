from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):(5173|5174|5175)",
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

model = joblib.load("../model/model.pkl")
scaler = joblib.load("../model/scaler.pkl")

class Customer(BaseModel):
  ID: int
  Year_Birth: int
  Education: str
  Marital_Status: str
  Income: float
  Kidhome: int
  Teenhome: int
  Dt_Customer: str
  Recency: int
  MntWines: int
  MntFruits: int
  MntMeatProducts: int
  MntFishProducts: int
  MntSweetProducts: int
  MntGoldProds: int
  NumDealsPurchases: int
  NumWebPurchases: int
  NumCatalogPurchases: int
  NumStorePurchases: int
  NumWebVisitsMonth: int
  AcceptedCmp3: int
  AcceptedCmp4: int
  AcceptedCmp5: int
  AcceptedCmp1: int
  AcceptedCmp2: int
  Complain: int
  Z_CostContact: int
  Z_Revenue: int
  Response: int

@app.post("/predict")
def predict(customer: Customer):
  customer_data = pd.DataFrame([customer.model_dump()])

  customer_data["Dt_Customer"] = pd.to_datetime(
    customer_data["Dt_Customer"], format="%d-%m-%Y"
  )
  customer_data["year_Customer"] = customer_data["Dt_Customer"].dt.year
  customer_data["month_Customer"] = customer_data["Dt_Customer"].dt.month
  customer_data["day_Customer"] = customer_data["Dt_Customer"].dt.day

  customer_data["Age"] = pd.Timestamp.today().year - customer_data["Year_Birth"]

  customer_data["Total_Children"] = (
    customer_data["Kidhome"] + customer_data["Teenhome"]
  )

  customer_data["Total_Amount"] = customer_data[[
    "MntWines",
    "MntFruits",
    "MntMeatProducts",
    "MntFishProducts",
    "MntSweetProducts",
    "MntGoldProds",
  ]].sum(axis=1)

  customer_data["Customer_Since"] = (
    pd.Timestamp.today() - customer_data["Dt_Customer"]
  ).dt.days

  customer_data = customer_data.drop(columns=["ID", "Dt_Customer"])

  encoded_data = pd.get_dummies(
    customer_data, columns=["Education", "Marital_Status"], drop_first=True
  )

  # scaled_features = scaler.feature_names_in_
  # scaled_data = encoded_data.copy()
  # scaled_data[scaled_features] = scaler.transform(encoded_data[scaled_features])

  model_features = list(model.feature_names_in_)
  scaled_data = encoded_data.reindex(columns=model_features, fill_value=0)

  scaled_features = list(scaler.feature_names_in_)
  scaled_data[scaled_features] = scaler.transform(scaled_data[scaled_features])

  prediction = model.predict(scaled_data)[0]
  return {"predicted_cluster": int(prediction)}


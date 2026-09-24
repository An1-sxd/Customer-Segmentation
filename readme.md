# Customer Segmentation

Machine learning project for grouping customers by demographic, purchasing, campaign, and channel behavior, with a **K-Means clustering model**, **FastAPI REST API**, and **React frontend**.

## Dataset

- 2,240 customer records
- 29 source columns containing customer demographics, household information, spending, purchase channels, and campaign responses
- Dataset file: `data/customer_segmentation.csv`
- Date format: `Dt_Customer` uses `DD-MM-YYYY`

The dataset is included in this project for training and local testing.

## ML Workflow

- Exploratory data analysis using Pandas and Matplotlib
- Missing income values filled with the median
- Customer date split into year, month, and day features
- Feature engineering for `Age`, `Total_Children`, `Total_Amount`, and `Customer_Since`
- `ID` and the original `Dt_Customer` column removed before training
- Categorical encoding with Pandas `get_dummies` and `drop_first=True`
- Numerical feature scaling with `StandardScaler`
- Cluster count evaluated with an inertia plot using elbow method
- Customer groups created with K-Means clustering using 5 clusters, `random_state=42`, and applying `k-means++`
- Cluster summaries reviewed by comparing average customer and purchasing features across groups
- Clusters visualized in two dimensions using PCA
- Trained model and scaler saved with Joblib

The model uses the complete engineered and encoded feature set. The frontend and API align incoming one-hot encoded data with the saved model columns before scaling and prediction.

## API

FastAPI endpoint:

```text
POST /predict
```

The API receives customer information and returns the predicted cluster:

```json
{
  "ID": 5524,
  "Year_Birth": 1957,
  "Education": "Graduation",
  "Marital_Status": "Single",
  "Income": 58138,
  "Kidhome": 0,
  "Teenhome": 0,
  "Dt_Customer": "04-09-2012",
  "Recency": 58,
  "MntWines": 635,
  "MntFruits": 88,
  "MntMeatProducts": 546,
  "MntFishProducts": 172,
  "MntSweetProducts": 88,
  "MntGoldProds": 88,
  "NumDealsPurchases": 3,
  "NumWebPurchases": 8,
  "NumCatalogPurchases": 10,
  "NumStorePurchases": 4,
  "NumWebVisitsMonth": 7,
  "AcceptedCmp3": 0,
  "AcceptedCmp4": 0,
  "AcceptedCmp5": 0,
  "AcceptedCmp1": 0,
  "AcceptedCmp2": 0,
  "Complain": 0,
  "Z_CostContact": 3,
  "Z_Revenue": 11,
  "Response": 1
}
```

Response:

```json
{
  "predicted_cluster": 3
}
```

Swagger documentation is available at `/docs` when the API is running.

## Interfaces

### React

The React frontend provides a customer profile form and communicates with the FastAPI backend.

```text
frontend/
```

## Project Structure

```text
3_ Customer Segmentation/
├── api/
│   └── main.py
├── data/
│   └── customer_segmentation.csv
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── model/
│   ├── model.pkl
│   └── scaler.pkl
├── notebook/
│   └── train.ipynb
├── .gitignore
└── readme.md
```

## Run Locally

From the project directory, install the Python dependencies:

```bash
pip install fastapi uvicorn pydantic joblib pandas scikit-learn matplotlib
```

### Start the API

The API currently loads model files using paths relative to the `api` directory:

```bash
cd api
uvicorn main:app --reload --port 8000
```

Open Swagger:

```text
http://127.0.0.1:8000/docs
```

### Start the React app

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the React interface:

```text
http://localhost:5173
```

The FastAPI server must be running on port `8000` for predictions from the React frontend.

## Tech Stack

Python · Pandas · Scikit-learn · Matplotlib · FastAPI · Pydantic · Joblib · React · Vite

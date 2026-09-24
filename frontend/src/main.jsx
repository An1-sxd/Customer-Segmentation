import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const initialForm = {
  ID: 5524,
  Year_Birth: 1957,
  Education: "Graduation",
  Marital_Status: "Single",
  Income: 58138,
  Kidhome: 0,
  Teenhome: 0,
  Dt_Customer: "04-09-2012",
  Recency: 58,
  MntWines: 635,
  MntFruits: 88,
  MntMeatProducts: 546,
  MntFishProducts: 172,
  MntSweetProducts: 88,
  MntGoldProds: 88,
  NumDealsPurchases: 3,
  NumWebPurchases: 8,
  NumCatalogPurchases: 10,
  NumStorePurchases: 4,
  NumWebVisitsMonth: 7,
  AcceptedCmp3: 0,
  AcceptedCmp4: 0,
  AcceptedCmp5: 0,
  AcceptedCmp1: 0,
  AcceptedCmp2: 0,
  Complain: 0,
  Z_CostContact: 3,
  Z_Revenue: 11,
  Response: 1,
};

const numericFields = Object.keys(initialForm).filter(
  (field) => !["Education", "Marital_Status", "Dt_Customer"].includes(field),
);

const personalFields = [
  ["ID", "Customer ID"],
  ["Year_Birth", "Birth year"],
  ["Income", "Annual income"],
  ["Dt_Customer", "Customer since"],
];

const householdFields = [
  ["Kidhome", "Children at home"],
  ["Teenhome", "Teenagers at home"],
  ["Recency", "Days since purchase"],
  ["Complain", "Complaints"],
];

const spendingFields = [
  ["MntWines", "Wine spending"],
  ["MntFruits", "Fruit spending"],
  ["MntMeatProducts", "Meat spending"],
  ["MntFishProducts", "Fish spending"],
  ["MntSweetProducts", "Sweet spending"],
  ["MntGoldProds", "Gold spending"],
];

const channelFields = [
  ["NumDealsPurchases", "Deal purchases"],
  ["NumWebPurchases", "Web purchases"],
  ["NumCatalogPurchases", "Catalog purchases"],
  ["NumStorePurchases", "Store purchases"],
  ["NumWebVisitsMonth", "Web visits / month"],
];

const campaignFields = [
  ["AcceptedCmp1", "Campaign 1 accepted"],
  ["AcceptedCmp2", "Campaign 2 accepted"],
  ["AcceptedCmp3", "Campaign 3 accepted"],
  ["AcceptedCmp4", "Campaign 4 accepted"],
  ["AcceptedCmp5", "Campaign 5 accepted"],
  ["Response", "Latest campaign response"],
  ["Z_CostContact", "Contact cost code"],
  ["Z_Revenue", "Revenue code"],
];

function Field({ name, label, form, onChange, type = "number" }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={onChange}
        required
        min={type === "number" ? 0 : undefined}
      />
    </label>
  );
}

function FieldGroup({ title, fields, form, onChange }) {
  return (
    <section className="form-section">
      <div className="section-heading">
        <span className="section-kicker">Profile data</span>
        <h3>{title}</h3>
      </div>
      <div className="field-grid">
        {fields.map(([name, label]) => (
          <Field
            key={name}
            name={name}
            label={label}
            form={form}
            onChange={onChange}
            type={name === "Dt_Customer" ? "text" : "number"}
          />
        ))}
      </div>
    </section>
  );
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setPrediction(null);
    setStatus("idle");
    setError("");
  }

  async function findSegment(event) {
    event.preventDefault();
    setStatus("loading");
    setPrediction(null);
    setError("");

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        numericFields.includes(key) ? Number(value) : value,
      ]),
    );

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("The segmentation service returned an error.");
      }

      const data = await response.json();
      if (!Number.isInteger(data.predicted_cluster)) {
        throw new Error("The model returned an invalid cluster.");
      }

      setPrediction(data.predicted_cluster);
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(
        `${requestError.message} Make sure the FastAPI server is running on port 8000.`,
      );
    }
  }

  return (
    <main className="streamlit-page">
      <h1>Customer Segment Predictor</h1>
      <p className="caption">
        Enter customer behavior and let the trained K-Means model identify its
        closest segment.
      </p>

      <form className="streamlit-form" onSubmit={findSegment}>
        <h2>Customer details</h2>

        <div className="streamlit-columns">
          <div className="field-column">
            <FieldGroup
              title="Identity"
              fields={personalFields}
              form={form}
              onChange={updateField}
            />
            <FieldGroup
              title="Household"
              fields={householdFields}
              form={form}
              onChange={updateField}
            />
          </div>

          <div className="field-column">
            <label>
              Education
              <select
                name="Education"
                value={form.Education}
                onChange={updateField}
              >
                <option>Basic</option>
                <option>Graduation</option>
                <option>Master</option>
                <option>PhD</option>
              </select>
            </label>
            <label>
              Marital status
              <select
                name="Marital_Status"
                value={form.Marital_Status}
                onChange={updateField}
              >
                <option>Single</option>
                <option>Married</option>
                <option>Together</option>
                <option>Divorced</option>
                <option>Widow</option>
                <option>Alone</option>
                <option>YOLO</option>
              </select>
            </label>
            <FieldGroup
              title="Purchase channels"
              fields={channelFields}
              form={form}
              onChange={updateField}
            />
          </div>
        </div>

        <FieldGroup
          title="Product spending"
          fields={spendingFields}
          form={form}
          onChange={updateField}
        />
        <FieldGroup
          title="Campaign history"
          fields={campaignFields}
          form={form}
          onChange={updateField}
        />

        <button
          className="streamlit-button"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Finding segment..." : "Find segment"}
        </button>
        <button className="reset-button" type="button" onClick={resetForm}>
          Reset sample
        </button>
        {status === "error" && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </form>

      {prediction !== null && (
        <section className="streamlit-result">
          <h2>Predicted segment</h2>
          <p className="streamlit-metric">Cluster {prediction}</p>
          <p className="caption">
            This customer was assigned to segment {prediction} by the trained
            K-Means model.
          </p>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

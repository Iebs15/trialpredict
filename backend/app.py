from flask import Flask, request, jsonify
from openai import AzureOpenAI
import os
import pandas as pd
from dotenv import load_dotenv
import re
# from phase_2_user import generate_user_prompt, get_prediction
from dropdown import generate_user_prompt, get_prediction
from user_input import generate_user_prompt_userinput, get_prediction_userinput
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Azure OpenAI configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"

# Load dataset
try:
    df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')
except Exception:
    df = pd.read_csv("final_granted_plus_pregarnted_v2.xlsx", encoding='ISO-8859-1')

required_cols = {"Title", "Abstract", "Claim", "prefName", "targetName"}
missing_cols = required_cols - set(df.columns)
if missing_cols:
    raise ValueError(f"Missing required columns: {missing_cols}")

# Flask app
app = Flask(__name__)
CORS(app)

# @app.route("/predict", methods=["POST"])
# def predict():
#     data = request.get_json()
#     query = data.get("query", "").strip()

#     if not query:
#         return jsonify({"error": "Missing input in 'query' field."}), 400

#     filtered_df = df[(df['prefName'].str.lower() == query.lower()) |
#                      (df['targetName'].str.lower() == query.lower())]

#     if filtered_df.empty:
#         return jsonify({"error": "No matching records found."}), 404

#     results = []
#     for _, row in filtered_df.iterrows():
#         user_prompt = generate_user_prompt(row)
#         drug_name, target_name, prob, justify = get_prediction(user_prompt,row['prefName'], row['targetName'])
#         results.append({
#             "prefName": drug_name,
#             "targetName": target_name,
#             "probability": prob,
#             "justification": justify
#         })

#     return jsonify({"results": results}), 200


@app.route("/preclinical-eval", methods=["POST"])
def preclinical_eval():
    data = request.json
    user_input = data.get("input")

    if not user_input:
        return jsonify({"error": "Missing input for drug or target name."}), 400

    filtered_df = df[(df['prefName'].str.lower() == user_input.lower()) |
                     (df['targetName'].str.lower() == user_input.lower())]

    if filtered_df.empty:
        return jsonify({"error": "No matching records found for the provided drug name or target."}), 404

    results = []
    for _, row in filtered_df.iterrows():
        user_prompt = generate_user_prompt(row)
        drug_name, target_name, prob, explain = get_prediction(user_prompt, row['prefName'], row['targetName'])

        result = {
            "drug_name": drug_name,
            "target_name": target_name,
            "disease": row.get('Disease', ""),
            "assignee_name": row.get('Assignee_Applicant', ""),
            "pg_pubid": row['pgpub_id'] if pd.notna(row['pgpub_id']) else row.get('Display_Key', ""),
            "inventor": row.get('Inventor', ""),
            "publication_date": str(row.get('Publication_Date', "")),
            "probability": prob,
            "justification": explain
        }
        results.append(result)

    return jsonify({"results": results})


@app.route("/predict-preclinical-success", methods=["POST"])
def predict():
    data = request.get_json()

    # Input validation
    required_fields = ["drug_name", "target_name", "disease", "study", "synonym"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing one or more required fields."}), 400

    # Generate prompt and get prediction
    user_prompt = generate_user_prompt_userinput(
        data["drug_name"],
        data["target_name"],
        data["disease"],
        data["study"],
        data["synonym"]
    )
    drug_name, target_name, prob, explain, disease, synonym = get_prediction_userinput(user_prompt, data["drug_name"], data["target_name"], data["disease"], data["synonym"])
    result = {
        "drug_name": drug_name,
        "target_name": target_name,
        "probability": prob,
        "justification": explain,
        "disease": disease,
        "synonym": synonym
    }
    return jsonify(result)


@app.route("/api/search-drugs", methods=["GET"])
def search_drugs():
    query = request.args.get("query", "").lower()
    if not query or len(query) < 3:
        return jsonify({"options": []})

    try:
        df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')

        filtered = df[
            df['prefName'].str.lower().str.contains(query, na=False) |
            df['targetName'].str.lower().str.contains(query, na=False)
        ]

        matched = pd.concat([filtered['prefName'], filtered['targetName']]).dropna().unique()

        return jsonify({"options": sorted(matched.tolist())})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
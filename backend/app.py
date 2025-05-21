# from flask import Flask, request, jsonify
# from openai import AzureOpenAI
# import os
# import pandas as pd
# from dotenv import load_dotenv
# import re
# # from phase_2_user import generate_user_prompt, get_prediction
# from dropdown import generate_user_prompt, get_prediction
# from user_input import generate_user_prompt_userinput, get_prediction_userinput
# from flask_cors import CORS
# from flask import Response, stream_with_context
# import json

# # Load environment variables
# load_dotenv()

# # Azure OpenAI configuration
# client = AzureOpenAI(
#     api_key=os.getenv("AZURE_API"),
#     api_version=os.getenv("AZURE_API_VERSION"),
#     azure_endpoint=os.getenv("AZURE_BASE_URL")
# )
# MODEL = "gpt-4o-mini"

# # # Load dataset
# # try:
# #     df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')
# # except Exception:
# #     df = pd.read_csv("final_granted_plus_pregarnted_v2.xlsx", encoding='ISO-8859-1')

# # required_cols = {"Title", "Abstract", "Claim", "prefName", "targetName"}
# # missing_cols = required_cols - set(df.columns)
# # if missing_cols:
# #     raise ValueError(f"Missing required columns: {missing_cols}")

# # Flask app
# app = Flask(__name__)
# CORS(app)

# # @app.route("/predict", methods=["POST"])
# # def predict():
# #     data = request.get_json()
# #     query = data.get("query", "").strip()

# #     if not query:
# #         return jsonify({"error": "Missing input in 'query' field."}), 400

# #     filtered_df = df[(df['prefName'].str.lower() == query.lower()) |
# #                      (df['targetName'].str.lower() == query.lower())]

# #     if filtered_df.empty:
# #         return jsonify({"error": "No matching records found."}), 404

# #     results = []
# #     for _, row in filtered_df.iterrows():
# #         user_prompt = generate_user_prompt(row)
# #         drug_name, target_name, prob, justify = get_prediction(user_prompt,row['prefName'], row['targetName'])
# #         results.append({
# #             "prefName": drug_name,
# #             "targetName": target_name,
# #             "probability": prob,
# #             "justification": justify
# #         })

# #     return jsonify({"results": results}), 200


# @app.route("/preclinical-eval", methods=["GET"])
# def preclinical_eval():
#     user_input = request.args.get("input")
#     df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')
#     if not user_input:
#         return jsonify({"error": "Missing input for drug or target name."}), 400

#     filtered_df = df[(df['prefName'].str.lower() == user_input.lower()) |
#                      (df['targetName'].str.lower() == user_input.lower())]

#     if filtered_df.empty:
#         return jsonify({"error": "No matching records found for the provided drug name or target."}), 404

#     @stream_with_context
#     def generate_stream():
#         for _, row in filtered_df.iterrows():
#             user_prompt = generate_user_prompt(row)
#             drug_name, target_name, prob, explain = get_prediction(user_prompt, row['prefName'], row['targetName'])

#             result = {
#                 "drug_name": drug_name,
#                 "target_name": target_name,
#                 "disease": row.get('Disease', ""),
#                 "assignee_name": row.get('Assignee_Applicant', ""),
#                 "pg_pubid": row['pgpub_id'] if pd.notna(row['pgpub_id']) else row.get('Display_Key', ""),
#                 "inventor": row.get('Inventor', ""),
#                 "publication_date": str(row.get('Publication_Date', "")),
#                 "probability": prob,
#                 "justification": explain
#             }

#             yield f"data: {json.dumps(result)}\n\n"

#     return Response(generate_stream(), mimetype='text/event-stream')

# @app.route("/predict-preclinical-success", methods=["POST"])
# def predict():
#     data = request.get_json()
#     df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')
#     # Input validation
#     required_fields = ["drug_name", "target_name", "disease", "study", "synonym"]
#     if not all(field in data for field in required_fields):
#         return jsonify({"error": "Missing one or more required fields."}), 400

#     # Generate prompt and get prediction
#     user_prompt = generate_user_prompt_userinput(
#         data["drug_name"],
#         data["target_name"],
#         data["disease"],
#         data["study"],
#         data["synonym"]
#     )
#     drug_name, target_name, prob, explain, disease, synonym = get_prediction_userinput(user_prompt, data["drug_name"], data["target_name"], data["disease"], data["synonym"])
#     result = {
#         "drug_name": drug_name,
#         "target_name": target_name,
#         "probability": prob,
#         "justification": explain,
#         "disease": disease,
#         "synonym": synonym
#     }
#     return jsonify(result)


# @app.route("/api/search-drugs", methods=["GET"])
# def search_drugs():
#     query = request.args.get("query", "").lower()
#     if not query or len(query) < 3:
#         return jsonify({"options": []})

#     try:
#         df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')

#         filtered = df[
#             # df['prefName'].str.lower().str.contains(query, na=False) |
#             df['targetName'].str.lower().str.contains(query, na=False)
#         ]

#         matched = pd.concat([filtered['targetName']]).dropna().unique()
#         # matched = pd.concat([filtered['prefName'], filtered['targetName']]).dropna().unique()

#         return jsonify({"options": sorted(matched.tolist())})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
# # Run the app
# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8000)


from flask import Flask, request, jsonify
from openai import AzureOpenAI
import os
import pandas as pd
from dotenv import load_dotenv
import re
# from phase_2_user import generate_user_prompt, get_prediction
from dropdown import generate_user_prompt, get_prediction, generate_system_prompt
# from user_input import generate_user_prompt_userinput, get_prediction_userinput
from flask_cors import CORS
from flask import Response, stream_with_context
import json
from biomarker_landscape import build_hetero_knowledge_graph,map_target_name_to_id,predict_diseases_for_target
from disease_landscape import generate_biomarker_association_matrix_by_name
 
# Load environment variables
load_dotenv()
 
# Azure OpenAI configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"
 
# # Load dataset
# try:
#     df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')
# except Exception:
#     df = pd.read_csv("final_granted_plus_pregarnted_v2.xlsx", encoding='ISO-8859-1')
 
# required_cols = {"Title", "Abstract", "Claim", "prefName", "targetName"}
# missing_cols = required_cols - set(df.columns)
# if missing_cols:
#     raise ValueError(f"Missing required columns: {missing_cols}")
 
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
 
@app.route("/predict", methods=["GET"])
def preclinical_eval():
    user_input = request.args.get("input")
    df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
    if not user_input:
        return jsonify({"error": "Missing input for target name."}), 400
 
    filtered_df = df[df['targetName'].str.lower() == user_input.lower()]
 
    if filtered_df.empty:
        return jsonify({"error": "No matching records found for the provided drug name or target."}), 404
 
    @stream_with_context
    def generate_stream():
        for _, row in filtered_df.iterrows():
            user_prompt = generate_user_prompt(row)
            system_prompt = generate_system_prompt(row)
            target_name, _, explain = get_prediction(user_prompt, system_prompt, row['targetName'])
 
            result = {
                "drug_name": row.get('prefName', ""),
                "target_name": target_name,
                "disease": row.get('Disease Name', ""),
                "assignee_name": row.get('Assignee_Applicant', ""),
                "Abstract": row.get("Abstract", ""),
                "Claim": row.get("Claim", ""),
                "pg_pubid": row['pgpub_id'] if pd.notna(row['pgpub_id']) else row.get('Display_Key', ""),
                "inventor": row.get('Inventor', ""),
                "publication_date": str(row.get('Publication_Date', "")),
                "Disease Traget Explaination": row.get("Disease_Target_Explanation", ""),
                # "probability": prob,
                "justification": explain,
                "Sources": row.get("urls", "")
            }
 
            yield f"data: {json.dumps(result)}\n\n"
 
    return Response(generate_stream(), mimetype='text/event-stream')
 
@app.route("/predict-preclinical-success", methods=["POST"])
def predict():
    data = request.get_json()
    df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
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
    drug_name, target_name,_, explain, disease, synonym = get_prediction_userinput(user_prompt, data["drug_name"], data["target_name"], data["disease"], data["synonym"])
    result = {
        "drug_name": drug_name,
        "target_name": target_name,
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
        df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
 
        filtered = df[
            df['targetName'].str.lower().str.contains(query, na=False)
        ]
 
        # matched = pd.concat([filtered['targetName']]).dropna().unique()
       
        matched = filtered['targetName'].dropna().unique()
 
        return jsonify({"options": sorted(matched.tolist())})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
   
# @app.route('/api/search-disease',methods=["GET"])
# def get_disease():
#     target = request.args.get("target", "").lower()
#     df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
#     filtered = df[
#             df['targetName'].str.lower().str.contains(target, na=False)]
   
#     unique_diseases = list(filtered['Disease Name'].dropna().unique())
#     return jsonify({"disease": sorted(unique_diseases)})
   
   
# @app.route('/api/search-disease', methods=["GET"])
# def get_disease():
#     target = request.args.get("target", "").lower()
#     try:
#         df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
#         filtered = df[df['targetName'].str.lower().str.contains(target, na=False)]
#         unique_diseases = list(filtered['Disease Name'].dropna().unique())
#         return jsonify({"diseases": sorted(unique_diseases)})
#     except Exception as e:
#         app.logger.error(f"Error processing disease search: {str(e)}")
#         return jsonify({"error": str(e)}), 500
   
   

@app.route('/api/search-disease', methods=["GET"])
def get_disease():
    target = request.args.get("target", "")
    # logger.info(f"Received request for target: {target}")
    
    if not target:
        # logger.warning("No target parameter provided")
        return jsonify({"diseases": [], "message": "No target specified"}), 200
    
    try:
        # Check if file exists
        file_path = "Clinical_trails_SkinData_only.xlsx"
        if not os.path.exists(file_path):
            # logger.error(f"Excel file not found: {file_path}")
            return jsonify({"error": f"Excel file not found: {file_path}"}), 500
        
        # logger.info(f"Reading Excel file: {file_path}")
        df = pd.read_excel(file_path, engine='openpyxl')
        
        # Check if required columns exist
        if 'targetName' not in df.columns or 'Disease Name' not in df.columns:
            # logger.error(f"Required columns not found in Excel file. Available columns: {df.columns.tolist()}")
            return jsonify({"error": "Required columns not found in Excel file"}), 500
        
        # Convert target to lowercase for case-insensitive search
        target_lower = target.lower()
        # logger.info(f"Searching for target (lowercase): {target_lower}")
        
        # Handle NaN values safely
        df['targetName'] = df['targetName'].fillna('')
        df['Disease Name'] = df['Disease Name'].fillna('')
        
        # Filter the dataframe
        filtered = df[df['targetName'].str.lower().str.contains(target_lower)]
        # logger.info(f"Found {len(filtered)} matching rows")
        
        # Get unique disease names
        unique_diseases = list(filtered['Disease Name'].unique())
        # Remove empty strings
        unique_diseases = [d for d in unique_diseases if d]
        
        # logger.info(f"Returning {len(unique_diseases)} unique diseases")
        return jsonify({"diseases": sorted(unique_diseases)})
    
    except Exception as e:
        # logger.exception(f"Error processing disease search: {str(e)}")
        return jsonify({"error": str(e)}), 500
    


#Biomarker Landscape

df = pd.read_excel(r"backend\Open_target_data.xlsx")
G = build_hetero_knowledge_graph(df)
name_to_id = map_target_name_to_id(df)

@app.route("/biomarker_landscape", methods=["GET"])
def predict_diseases():
    target_name = request.args.get("targetName")
    if not target_name:
        return jsonify({"error": "Missing target name"}), 400

    target_id = name_to_id.get(target_name.lower())
    if not target_id:
        return jsonify({"error": f"Target '{target_name}' not found"}), 404

    predictions = predict_diseases_for_target(G, target_id, top_k=10)
    print(predictions)
    return jsonify(predictions)


@app.route("/disease_landscape", methods=["GET"])
def disease_association():
    disease_name= request.args.get("disease")
    if not disease_name:
        return jsonify({"error": "Missing 'disease' query parameter"}), 400
    
    matrix = generate_biomarker_association_matrix_by_name(df, disease_name)
    return jsonify(matrix)
   
   
# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
import datetime
from flask import Flask, request, jsonify, abort
from openai import AzureOpenAI
import os
import pandas as pd
from openpyxl import load_workbook
from collections import defaultdict
from dotenv import load_dotenv
import re
from flask_cors import CORS
from flask import Response, stream_with_context
import json
from biomarker_landscape import build_hetero_knowledge_graph,map_target_name_to_id,predict_diseases_for_target
from disease_landscape import generate_biomarker_association_matrix_by_name
from dropdown import get_preclinical_study_results_by_disease_and_target
from cache_utiities import load_from_cache, save_to_cache, clean_old_caches
from symptom_utilities import (
    collect_biomarker_scores_by_color,
    build_weighted_association,
)
import matplotlib
matplotlib.use("Agg")  # non‐interactive backend
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import io
import time
import base64
import numpy as np

# Load environment variables
load_dotenv()
 
# Azure OpenAI configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"
EXCEL_PATH = "processed_target_scores_colored_final_v5.xlsx"
GLOBAL_WB = load_workbook(EXCEL_PATH, data_only=True)

plots_cache = {}

# We only need the labels here; key used in symptom_utilities is implied
VALID_CATEGORIES = ["Inhibitor", "Promoter", "Unknown"]

app = Flask(__name__)
CORS(app)

@app.route("/search-drugs", methods=["GET"])
def search_drugs():
    disease = request.args.get("disease", "").lower()
    if not disease:
        return jsonify({"options": []})

    try:
        df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
        df['Disease Name'] = df['Disease Name'].fillna('')
        df['targetName'] = df['targetName'].fillna('')

        # Filter rows matching the disease exactly (case-insensitive)
        filtered = df[df['Disease Name'].str.lower() == disease]
        matched = filtered['targetName'].dropna().unique()

        return jsonify({"options": sorted(matched.tolist())})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 

@app.route('/search-disease', methods=["GET"])
def search_disease():
    query = request.args.get("query", "").lower()
    if not query or len(query) < 1:
        return jsonify({"diseases": []})

    try:
        df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
        df['Disease Name'] = df['Disease Name'].fillna('')

        # Filter by partial disease name match (case insensitive)
        filtered = df[df['Disease Name'].str.lower().str.contains(query)]
        matched = filtered['Disease Name'].dropna().unique()

        return jsonify({"diseases": sorted(matched.tolist())})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 


#Biomarker Landscape

df = pd.read_excel("Open_target_data.xlsx")
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


# @app.route("/disease_landscape", methods=["GET"])
# def disease_landscape():
#     disease_name = request.args.get('disease')
#     if not disease_name:
#         return jsonify({"error": "Missing 'disease' query parameter"}), 400

#     GREEN_HEX = "C6EFCE"  # Inhibitor color
#     YELLOW_HEX = "FFEB9C"  # Promoter color
#     file_path = "processed_target_scores_colored_final_v5.xlsx"

#     # Load dataframe and filter disease
#     df = pd.read_excel(file_path)
#     df_filtered = df[df['MappedDisease'].str.lower() == disease_name.lower()]
#     if df_filtered.empty:
#         return jsonify({"error": f"No data found for disease: {disease_name}"}), 404

#     # Load workbook for fill colors
#     wb = load_workbook(filename=file_path, data_only=True)
#     ws = wb[wb.sheetnames[0]]

#     header = list(df.columns)
#     id_col = "drugId"
#     symptom_col = "unique_symptom"
#     mapped_disease_col = "MappedDisease"
#     biomarker_cols = [col for col in header if col not in [symptom_col, mapped_disease_col, id_col]]

#     # Map dataframe index to Excel row (header is row 1)
#     df_index_to_excel_row = {idx: idx + 2 for idx in df_filtered.index}
#     col_name_to_excel_col = {cell.value: cell.col_idx for cell in ws[1]}

#     fill_cache = {}
#     for df_idx, excel_row in df_index_to_excel_row.items():
#         for biomarker in biomarker_cols:
#             excel_col = col_name_to_excel_col.get(biomarker)
#             if not excel_col:
#                 continue
#             cell = ws.cell(row=excel_row, column=excel_col)
#             fill = cell.fill
#             if fill.patternType == 'solid':
#                 color = fill.start_color.rgb
#             else:
#                 color = None
#             fill_cache[(excel_row, excel_col)] = color

#     # Structure: biomarker -> symptom -> {green, yellow} values
#     data = defaultdict(lambda: defaultdict(lambda: {'green': [], 'yellow': []}))

#     for df_idx, row in df_filtered.iterrows():
#         symptom = row[symptom_col]
#         excel_row = df_index_to_excel_row[df_idx]

#         for biomarker in biomarker_cols:
#             value = row[biomarker]
#             if pd.isna(value):
#                 continue
#             excel_col = col_name_to_excel_col.get(biomarker)
#             if not excel_col:
#                 continue
#             color_rgb = fill_cache.get((excel_row, excel_col))
#             if not color_rgb:
#                 continue
#             color_hex = color_rgb[-6:]  # last 6 chars RGB hex
#             if color_hex == GREEN_HEX:
#                 data[biomarker][symptom]['green'].append(value)
#             elif color_hex == YELLOW_HEX:
#                 data[biomarker][symptom]['yellow'].append(value)

#     # Prepare final JSON output
#     output = {}

#     for biomarker, symptoms in data.items():
#         output[biomarker] = {}
#         for symptom, vals in symptoms.items():
#             green_vals = vals['green']
#             yellow_vals = vals['yellow']

#             avg_inhibitor = sum(green_vals) / len(green_vals) if green_vals else 0
#             avg_promoter = sum(yellow_vals) / len(yellow_vals) if yellow_vals else 0
#             total_avg = avg_inhibitor + avg_promoter

#             if total_avg == 0:
#                 percent_inhibitor = 0
#                 percent_promoter = 0
#             else:
#                 percent_inhibitor = (avg_inhibitor / total_avg) * 100
#                 percent_promoter = (avg_promoter / total_avg) * 100

#             output[biomarker][symptom] = {
#                 "percent_inhibitor": round(percent_inhibitor, 3),
#                 "avg_inhibitor":round(avg_inhibitor,6),
#                 "avg_promoter": round(avg_promoter, 6),
#                 "percent_promoter": round(percent_promoter, 3),
#                 "total_avg": round(total_avg, 6)
#             }

#     return jsonify(output)



from new_disease_logic import process_disease_data

@app.route("/disease_landscape", methods=["GET"])
def disease_landscape():
    t0 = time.time()
    disease_name = request.args.get('disease')
    if not disease_name:
        return jsonify({"error": "Missing 'disease' query parameter"}), 400
    t1 = time.time()
    # Process disease data
    result = process_disease_data(disease_name)
    t2 = time.time()
    # If there's an error, return it
    if isinstance(result, dict) and "error" in result:
        return jsonify(result), 404
    t3 = time.time()
    print(f"Timings: selection {t1-t0:.2f}s, parse_args {t2-t1:.2f}s, table {t3-t2:.2f}s")
    return jsonify(result)


class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        return super().default(obj)

@app.route("/clinical-trial-journey", methods=["GET"])
def clinical_trial_journey():
    disease = request.args.get("disease")
    target = request.args.get("target")
    
    if not disease:
        return jsonify({"error": "Missing 'disease' query parameter"}), 400

    def event_stream():
        found = False
        for result in get_preclinical_study_results_by_disease_and_target(disease, target):
            yield f"data: {json.dumps(result, cls=EnhancedJSONEncoder)}\n\n"
            found = True
        if not found:
            yield f"data: {json.dumps({'message': 'No results found'})}\n\n"
        
        # Final "done" message
        yield f"event: done\ndata: done\n\n"

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    }
    return Response(stream_with_context(event_stream()), headers=headers)
   
# @app.route("/symptom", methods=["GET"])
# def symptom_page():
#     """
#     GET /symptom?name=<symptom>
#     Returns JSON with two keys:
#       - nested_assoc: the weighted‐association dict
#       - plots: { 'Inhibitor': <base64‐PNG>, 'Promoter': <base64‐PNG>, 'Unknown': <base64‐PNG> }
#     """
#     # 1) Purge old caches (older than 2 days)
#     clean_old_caches(days=2)

#     # 2) Read query param
#     symptom = request.args.get("name", "").strip()
#     if not symptom:
#         abort(400, description="Missing required query parameter: name")

#     # 3) Load or rebuild nested association
#     nested_assoc = load_from_cache(symptom)
#     if nested_assoc is None:
#         try:
#             nested_assoc = build_weighted_association(EXCEL_PATH, symptom)
#         except ValueError as e:
#             abort(400, description=str(e))
#         except Exception as e:
#             abort(500, description=f"Internal error: {e}")
#         save_to_cache(symptom, nested_assoc)

#     # 4) Collect raw scores for all three categories
#     try:
#         biomarker_names, inh_dict, prm_dict, unk_dict = collect_biomarker_scores_by_color(
#             EXCEL_PATH, symptom
#         )
#     except Exception as e:
#         abort(500, description=f"Error collecting scores: {e}")

#     # 5) Generate all three PNGs in memory and base64‐encode them
#     encoded_images = {}
#     for category_label in VALID_CATEGORIES:
#         if category_label == "Inhibitor":
#             cat_data = inh_dict
#         elif category_label == "Promoter":
#             cat_data = prm_dict
#         else:
#             cat_data = unk_dict

#         buf = _make_stacked_bar_png(biomarker_names, cat_data, symptom, category_label)
#         encoded_images[category_label] = base64.b64encode(buf.getvalue()).decode("ascii")

#     # 6) Return JSON response
#     return jsonify({
#         "symptom": symptom,
#         "nested_assoc": nested_assoc,
#         "plots": encoded_images
#     })


# def _make_stacked_bar_png(biomarker_names, category_avg, symptom, category_name):
#     """
#     Generate a stacked‐bar PNG (BytesIO) for the given category.
#     - biomarker_names: list of all biomarker column names
#     - category_avg: dict[biomarker → (dict[disease → avg_score])]
#     - symptom: the symptom string
#     - category_name: one of "Inhibitor", "Promoter", "Unknown"
#     """
#     filtered_bio = [b for b in biomarker_names if b in category_avg and category_avg[b]]
#     buf = io.BytesIO()

#     if not filtered_bio:
#         fig, ax = plt.subplots(figsize=(6, 2))
#         ax.text(0.5, 0.5, f"No {category_name} data for '{symptom}'",
#                 ha="center", va="center", fontsize=12)
#         ax.axis("off")
#         fig.savefig(buf, format="png", bbox_inches="tight")
#         plt.close(fig)
#         buf.seek(0)
#         return buf

#     # Gather all diseases across filtered biomarkers
#     all_diseases = sorted({d for b in filtered_bio for d in category_avg[b].keys()})
#     cmap = plt.get_cmap("tab20")
#     disease_to_color = {d: cmap(i % cmap.N) for i, d in enumerate(all_diseases)}

#     N = len(filtered_bio)
#     x = np.arange(N)
#     width = 0.8

#     fig, ax = plt.subplots(figsize=(max(8, N * 0.3), 5))
#     for i, bio in enumerate(filtered_bio):
#         bottom = 0.0
#         disease_scores = list(category_avg[bio].items())
#         disease_scores.sort(key=lambda it: it[1])  # ascending by avg_score

#         for disease, avg_score in disease_scores:
#             if avg_score <= 0:
#                 continue
#             color = disease_to_color[disease]
#             ax.bar(x[i], avg_score, bottom=bottom, color=color,
#                    width=width, edgecolor="white")
#             mid = bottom + avg_score / 2.0
#             ax.text(x[i], mid, f"{avg_score:.3f}",
#                     ha="center", va="center", fontsize=6, color="black", clip_on=True)
#             bottom += avg_score

#         if bottom > 0:
#             ax.text(x[i], bottom + (0.01 * bottom),
#                     f"sum={bottom:.3f}", ha="center", va="bottom",
#                     fontsize=8, rotation=90)

#     ax.set_xticks(x)
#     ax.set_xticklabels(filtered_bio, rotation=90, fontsize=7)
#     ax.set_ylabel("Average Score (stacked by disease)", fontsize=10)
#     ax.set_xlabel("Biomarker", fontsize=10)
#     ax.set_title(f"{category_name} Averages for '{symptom}'", fontsize=12)

#     legend_handles = [
#         Patch(facecolor=disease_to_color[d], edgecolor="black", label=d)
#         for d in all_diseases
#     ]
#     ax.legend(handles=legend_handles, title="Disease",
#               bbox_to_anchor=(1.02, 1), loc="upper left")

#     plt.tight_layout()
#     fig.savefig(buf, format="png", bbox_inches="tight")
#     plt.close(fig)
#     buf.seek(0)
#     return buf

@app.route("/symptom", methods=["GET"])
def symptom_page():
    """
    GET /symptom?name=<symptom>
    Returns JSON with two keys:
      - nested_assoc: the weighted‐association dict
      - plots: { 'Inhibitor': <base64‐PNG>, 'Promoter': <base64‐PNG>, 'Unknown': <base64‐PNG> }
    """
    t0 = time.time()
    # 1) Purge old caches (older than 2 days)
    clean_old_caches(days=2)
    t1 = time.time()
    # 2) Read query param
    symptom = request.args.get("name", "").strip()
    if not symptom:
        abort(400, description="Missing required query parameter: name")

    t2 = time.time()
    # 3) Load or rebuild nested association
    nested_assoc = load_from_cache(symptom)
    if nested_assoc is None:
        try:
            nested_assoc = build_weighted_association(GLOBAL_WB, symptom)
        except ValueError as e:
            abort(400, description=str(e))
        except Exception as e:
            abort(500, description=f"Internal error: {e}")
        save_to_cache(symptom, nested_assoc)
    t3 = time.time()

    # 4) Collect raw scores for all three categories
    score_cache_key = f"score_{symptom}"
    scores_data = load_from_cache(score_cache_key)
    if scores_data is None:
        try:
            biomarker_names, inh_dict, prm_dict, unk_dict = collect_biomarker_scores_by_color(
                GLOBAL_WB, symptom
            )
            save_to_cache(score_cache_key, (biomarker_names, inh_dict, prm_dict, unk_dict))
        except Exception as e:
            abort(500, description=f"Error collecting scores: {e}")
    else: 
        biomarker_names, inh_dict, prm_dict, unk_dict = scores_data
        
    t4 = time.time()
            
    # 5) Generate all three PNGs in memory and base64‐encode them
    encoded_images = {}
    for category_label in VALID_CATEGORIES:
        if category_label == "Inhibitor":
            cat_data = inh_dict
        elif category_label == "Promoter":
            cat_data = prm_dict
        else:
            cat_data = unk_dict

        buf = _make_stacked_bar_png(biomarker_names, cat_data, symptom, category_label)
        encoded_images[category_label] = base64.b64encode(buf.getvalue()).decode("ascii")
    t5 = time.time()
    
    print(f"Timings: cache_clean {t1-t0:.2f}s, parse_args {t2-t1:.2f}s, build_assoc {t3-t2:.2f}s, collect_scores {t4-t3:.2f}s, plots {t5-t4:.2f}s")

    # 6) Return JSON response
    return jsonify({
        "symptom": symptom,
        "nested_assoc": nested_assoc,
        "plots": encoded_images
    })

def get_plot_bytes(bio_names, cat_dict, symptom, category_label):
    cache_key = f"{symptom}_{category_label}"
    if cache_key in plots_cache:
        return plots_cache[cache_key]

    buf = _make_stacked_bar_png(bio_names, cat_dict, symptom, category_label)
    raw_bytes = buf.getvalue()
    plots_cache[cache_key] = raw_bytes
    return raw_bytes


def _make_stacked_bar_png(biomarker_names, category_avg, symptom, category_name):
    """
    Generate a stacked‐bar PNG (BytesIO) for the given category.
    - biomarker_names: list of all biomarker column names
    - category_avg: dict[biomarker → (dict[disease → avg_score])]
    - symptom: the symptom string
    - category_name: one of "Inhibitor", "Promoter", "Unknown"
    """
    filtered_bio = [b for b in biomarker_names if b in category_avg and category_avg[b]]
    buf = io.BytesIO()

    if not filtered_bio:
        fig, ax = plt.subplots(figsize=(6, 2))
        ax.text(0.5, 0.5, f"No {category_name} data for '{symptom}'",
                ha="center", va="center", fontsize=12)
        ax.axis("off")
        fig.savefig(buf, format="png", bbox_inches="tight")
        plt.close(fig)
        buf.seek(0)
        return buf

    # Gather all diseases across filtered biomarkers
    all_diseases = sorted({d for b in filtered_bio for d in category_avg[b].keys()})
    cmap = plt.get_cmap("tab20")
    disease_to_color = {d: cmap(i % cmap.N) for i, d in enumerate(all_diseases)}

    N = len(filtered_bio)
    x = np.arange(N)
    width = 0.8

    fig, ax = plt.subplots(figsize=(max(8, N * 0.3), 5))
    for i, bio in enumerate(filtered_bio):
        bottom = 0.0
        disease_scores = list(category_avg[bio].items())
        disease_scores.sort(key=lambda it: it[1])  # ascending by avg_score

        for disease, avg_score in disease_scores:
            if avg_score <= 0:
                continue
            color = disease_to_color[disease]
            ax.bar(x[i], avg_score, bottom=bottom, color=color,
                   width=width, edgecolor="white")
            mid = bottom + avg_score / 2.0
            ax.text(x[i], mid, f"{avg_score:.3f}",
                    ha="center", va="center", fontsize=6, color="black", clip_on=True)
            bottom += avg_score

        if bottom > 0:
            ax.text(x[i], bottom + (0.01 * bottom),
                    f"sum={bottom:.3f}", ha="center", va="bottom",
                    fontsize=8, rotation=90)

    ax.set_xticks(x)
    ax.set_xticklabels(filtered_bio, rotation=90, fontsize=7)
    ax.set_ylabel("Average Score (stacked by disease)", fontsize=10)
    ax.set_xlabel("Biomarker", fontsize=10)
    ax.set_title(f"{category_name} Averages for '{symptom}'", fontsize=12)

    legend_handles = [
        Patch(facecolor=disease_to_color[d], edgecolor="black", label=d)
        for d in all_diseases
    ]
    ax.legend(handles=legend_handles, title="Disease",
              bbox_to_anchor=(1.02, 1), loc="upper left")

    plt.tight_layout()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf


# Run the app
if __name__ == "__main__":
    app.run(debug=True)
from flask import Flask, request, abort, jsonify
from flask_cors import CORS
import io
import time
import base64

import numpy as np
from openpyxl import load_workbook

# ---- Cache utilities (your own functions) ----
from cache_utiities import load_from_cache, save_to_cache, clean_old_caches


# ---- Disease‐logic function (your own file) ----
# from new_disease_logic import process_disease_data
from from_disease import process_disease_landscape, get_top_biomarkers

from from_symptom import process_symptom_data, process_symptom_landscape, get_top_biomarkers_for_disease

# ---- Top‐5 biomarker utility from utilities.py ----
# from utilities import get_top_biomarkers_from_df

import matplotlib
matplotlib.use("Agg")  # non‐interactive backend for plotting
import matplotlib.pyplot as plt
from matplotlib.patches import Patch


app = Flask(__name__)
CORS(app)


# ────────────────────────────────

VALID_CATEGORIES = ["inhibitor", "promoter"]
# ────────────────────────────────


# ─────── /symptom Route ────────
@app.route("/symptom", methods=["GET"])
def symptom_page():
    """
    GET /symptom?name=<symptom>
    Returns JSON:
      {
        "symptom": <str>,
        "nested_assoc": <dict>,
        "plots": {
            "Inhibitor": <base64‐png>,
            "Promoter":  <base64‐png>,
            "Unknown":   <base64‐png>
        }
      }
    """
    t0 = time.time()
    clean_old_caches(days=2)
    t1 = time.time()

    symptom = request.args.get("name", "").strip()
    if not symptom:
        abort(400, description="Missing required query parameter: name")
    t2 = time.time()

    # 1) Load or build nested association
    nested_assoc = load_from_cache(symptom)
    if nested_assoc is None:
        try:
            nested_assoc = process_symptom_landscape(symptom)
        except ValueError as e:
            abort(400, description=str(e))
        except Exception as e:
            abort(500, description=f"Internal error: {e}")
        save_to_cache(symptom, nested_assoc)
    t3 = time.time()

    # 2) Collect raw scores (dicts by category) for this symptom
    score_cache_key = f"score_{symptom}"
    scores_data = load_from_cache(score_cache_key)
    if scores_data is None:
        try:
            biomarker_names, inh_dict, prm_dict = process_symptom_data(symptom)
            save_to_cache(score_cache_key, (biomarker_names, inh_dict, prm_dict))
        except Exception as e:
            abort(500, description=f"Error collecting scores: {e}")
    else:
        biomarker_names, inh_dict, prm_dict = scores_data
    t4 = time.time()

    # Build plot data instead of PNGs
    plot_data = {}
    for category_label, cat_data in zip(VALID_CATEGORIES, [inh_dict, prm_dict]):
        data_points = []
        for bio in biomarker_names:
            if bio in cat_data and cat_data[bio]:
                disease_scores = [
                    {"disease": d, "score": round(score, 4)}
                    for d, score in sorted(cat_data[bio].items(), key=lambda it: -it[1])
                ]
                data_points.append({
                    "biomarker": bio,
                    "diseases": disease_scores,
                    "total_score": round(sum(item["score"] for item in disease_scores), 4)
                })
        plot_data[category_label] = data_points

    
    t5 = time.time()
    print(
        f"Timings: clean_cache {t1-t0:.2f}s, parse_args {t2-t1:.2f}s, "
        f"build_assoc {t3-t2:.2f}s, collect_scores {t4-t3:.2f}s, plots {t5-t4:.2f}s"
    )
    return jsonify({
        "symptom": symptom,
        "nested_assoc": nested_assoc,
        "plot_data": plot_data
    })


# ───── /disease_landscape Route ─────
@app.route("/disease_landscape", methods=["GET"])
def disease_landscape():
    """
    GET /disease_landscape?disease=<name>
    Returns the JSON produced by process_disease_data(disease).
    """
    t0 = time.time()
    disease_name = request.args.get("disease", "").strip()
    if not disease_name:
        return jsonify({"error": "Missing 'disease' query parameter"}), 400
    t1 = time.time()

    result = process_disease_landscape(disease_name)
    ## store the result in cache
    cache_key = f"disease_{disease_name}"
    save_to_cache(cache_key, result)
    # need to remove the 'symptoms' key from the result
    if "symptoms" in result:
        del result["symptoms"]
    t2 = time.time()
    if isinstance(result, dict) and "error" in result:
        return jsonify(result), 404
    t3 = time.time()

    print(
        f"Timings: parse_args {t1-t0:.2f}s, process_data {t2-t1:.2f}s, return {t3-t2:.2f}s"
    )
    return jsonify(result)


# ─────── /biomarkers Route ───────
@app.route("/biomarkers_disease", methods=["GET"])
def biomarkers():
    """
    GET /biomarkers_disease?disease=<disease>&symptom=<symptom>&top_n=<n>
    Returns the top_n biomarkers and their average scores for the given disease and symptom.
    """
    disease  = request.args.get("disease",  "").strip()
    symptom  = request.args.get("symptom",  "").strip()
    top_n    = int(request.args.get("top_n", 5))

    if not disease or not symptom:
        return jsonify({"error": "Missing 'disease' or 'symptom' query parameter"}), 400

    # 1) Try cache
    cache_key = f"top_biomarkers_{disease}_{symptom}_{top_n}"
    cached = load_from_cache(cache_key)
    if cached:
        return jsonify(cached)

    # 2) Load full disease data
    cache_key_disease = f"disease_{disease}"
    disease_data = load_from_cache(cache_key_disease)
    if not disease_data or "error" in disease_data:
        return jsonify({"error": f"Disease '{disease}' not found"}), 404

    # 3) Check symptom validity
    valid_symptoms = {s 
        for bm in disease_data.values()
        for s in bm.keys()
    }
    if symptom not in valid_symptoms:
        return jsonify({
            "error":
                f"Symptom '{symptom}' not valid for disease '{disease}'. "
                f"Valid symptoms: {sorted(valid_symptoms)}"
        }), 400

    # 4) Compute top biomarkers
    try:
        result = get_top_biomarkers(disease_data, symptom, top_n)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # 5) Save + return
    save_to_cache(cache_key, result)
    return jsonify(result)
        
# ─────── /biomarkers_symptom Route ───────
@app.route("/biomarkers_symptom", methods=["GET"])
def biomarkers_symptom():
    """
    GET /biomarkers_symptom?symptom=<symptom>&disease=<disease>&top_n=<n>
    Returns the top_n biomarkers and their average scores for the given symptom and disease.
    """
    symptom = request.args.get("symptom", "").strip()
    disease = request.args.get("disease", "").strip()
    try:
        top_n = int(request.args.get("top_n", 5))
    except ValueError:
        return jsonify({"error": "'top_n' must be an integer"}), 400

    # 1) Basic validation
    if not symptom or not disease:
        return jsonify({"error": "Missing 'symptom' or 'disease' query parameter"}), 400

    # 2) Attempt to return from cache
    cache_key = f"top_biomarkers_{symptom}_{disease}_{top_n}"
    cached = load_from_cache(cache_key)
    if cached:
        return jsonify(cached)

    # 3) Load the symptom_data (must be a dict of biomarker → { disease_name: metrics, … })
    symptom_data = load_from_cache(symptom)
    if not symptom_data or "error" in symptom_data:
        return jsonify({"error": f"Symptom '{symptom}' not found"}), 404

    # 4) (Optional) Validate that this disease actually appears under your symptom_data
    #    This depends on how you structured `symptom_data`, but if you stored a list:
    valid_diseases = symptom_data.get("diseases", [])
    if valid_diseases and disease not in valid_diseases:
        return jsonify({
            "error": f"Disease '{disease}' not valid for symptom '{symptom}'. "
                     f"Valid diseases: {valid_diseases}"
        }), 400

    # 5) Compute top biomarkers
    try:
        result = get_top_biomarkers_for_disease(disease, symptom_data, top_n)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # 6) Cache + return
    save_to_cache(cache_key, result)
    return jsonify(result)



if __name__ == "__main__":
    # By default, Flask runs on http://127.0.0.1:5000
    app.run(debug=True)

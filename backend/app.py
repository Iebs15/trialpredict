# from flask import Flask, request, abort, jsonify
# from flask_cors import CORS
# import io
# import time
# import base64
# import pandas as pd
# import numpy as np
# from openpyxl import load_workbook
# from elasticsearch import Elasticsearch
# from collections import defaultdict
# from datetime import datetime
# import os

# # ---- Cache utilities (your own functions) ----
# from cache_utiities import load_from_cache, save_to_cache, clean_old_caches


# # ---- Disease‐logic function (your own file) ----
# # from new_disease_logic import process_disease_data
# from from_disease import process_disease_landscape, get_top_biomarkers

# from from_symptom import process_symptom_data, process_symptom_landscape, get_top_biomarkers_for_disease

# # ---- Top‐5 biomarker utility from utilities.py ----
# # from utilities import get_top_biomarkers_from_df

# import matplotlib
# matplotlib.use("Agg")  # non‐interactive backend for plotting
# import matplotlib.pyplot as plt
# from matplotlib.patches import Patch


# app = Flask(__name__)
# CORS(app)


# # ────────────────────────────────

# VALID_CATEGORIES = ["inhibitor", "promoter"]
# # ────────────────────────────────
# # Elasticsearch configuration
# ES_HOST = os.getenv('ELASTICSEARCH_HOST', 'https://a25cbf64ca0d465a9d3eb5d9479121b6.eastus2.azure.elastic-cloud.com:443')
# ES_INDEX = 'trialpredict_biomarkers'

# # ─────── /symptom Route ────────
# @app.route("/symptom", methods=["GET"])
# def symptom_page():
#     """
#     GET /symptom?name=<symptom>
#     Returns JSON:
#       {
#         "symptom": <str>,
#         "nested_assoc": <dict>,
#         "plots": {
#             "Inhibitor": <base64‐png>,
#             "Promoter":  <base64‐png>,
#             "Unknown":   <base64‐png>
#         }
#       }
#     """
#     t0 = time.time()
#     clean_old_caches(days=2)
#     t1 = time.time()

#     symptom = request.args.get("name", "").strip()
#     if not symptom:
#         abort(400, description="Missing required query parameter: name")
#     t2 = time.time()

#     # 1) Load or build nested association
#     nested_assoc = load_from_cache(symptom)
#     if nested_assoc is None:
#         try:
#             nested_assoc = process_symptom_landscape(symptom)
#         except ValueError as e:
#             abort(400, description=str(e))
#         except Exception as e:
#             abort(500, description=f"Internal error: {e}")
#         save_to_cache(symptom, nested_assoc)
#     t3 = time.time()

#     # 2) Collect raw scores (dicts by category) for this symptom
#     score_cache_key = f"score_{symptom}"
#     scores_data = load_from_cache(score_cache_key)
#     if scores_data is None:
#         try:
#             biomarker_names, inh_dict, prm_dict = process_symptom_data(symptom)
#             save_to_cache(score_cache_key, (biomarker_names, inh_dict, prm_dict))
#         except Exception as e:
#             abort(500, description=f"Error collecting scores: {e}")
#     else:
#         biomarker_names, inh_dict, prm_dict = scores_data
#     t4 = time.time()

#     # Build plot data instead of PNGs
#     plot_data = {}
#     for category_label, cat_data in zip(VALID_CATEGORIES, [inh_dict, prm_dict]):
#         data_points = []
#         for bio in biomarker_names:
#             if bio in cat_data and cat_data[bio]:
#                 disease_scores = [
#                     {"disease": d, "score": round(score, 4)}
#                     for d, score in sorted(cat_data[bio].items(), key=lambda it: -it[1])
#                 ]
#                 data_points.append({
#                     "biomarker": bio,
#                     "diseases": disease_scores,
#                     "total_score": round(sum(item["score"] for item in disease_scores), 4)
#                 })
#         plot_data[category_label] = data_points

    
#     t5 = time.time()
#     print(
#         f"Timings: clean_cache {t1-t0:.2f}s, parse_args {t2-t1:.2f}s, "
#         f"build_assoc {t3-t2:.2f}s, collect_scores {t4-t3:.2f}s, plots {t5-t4:.2f}s"
#     )
#     return jsonify({
#         "symptom": symptom,
#         "nested_assoc": nested_assoc,
#         "plot_data": plot_data
#     })


# # ───── /disease_landscape Route ─────
# @app.route("/disease_landscape", methods=["GET"])
# def disease_landscape():
#     """
#     GET /disease_landscape?disease=<name>
#     Returns the JSON produced by process_disease_data(disease).
#     """
#     t0 = time.time()
#     disease_name = request.args.get("disease", "").strip()
#     if not disease_name:
#         return jsonify({"error": "Missing 'disease' query parameter"}), 400
#     t1 = time.time()

#     result = process_disease_landscape(disease_name)
#     ## store the result in cache
#     cache_key = f"disease_{disease_name}"
#     save_to_cache(cache_key, result)
#     # need to remove the 'symptoms' key from the result
#     if "symptoms" in result:
#         del result["symptoms"]
#     t2 = time.time()
#     if isinstance(result, dict) and "error" in result:
#         return jsonify(result), 404
#     t3 = time.time()

#     print(
#         f"Timings: parse_args {t1-t0:.2f}s, process_data {t2-t1:.2f}s, return {t3-t2:.2f}s"
#     )
#     return jsonify(result)


# # ─────── /biomarkers Route ───────
# @app.route("/biomarkers_disease", methods=["GET"])
# def biomarkers():
#     """
#     GET /biomarkers_disease?disease=<disease>&symptom=<symptom>&top_n=<n>
#     Returns the top_n biomarkers and their average scores for the given disease and symptom.
#     """
#     disease  = request.args.get("disease",  "").strip()
#     symptom  = request.args.get("symptom",  "").strip()
#     top_n    = int(request.args.get("top_n", 5))

#     if not disease or not symptom:
#         return jsonify({"error": "Missing 'disease' or 'symptom' query parameter"}), 400

#     # 1) Try cache
#     cache_key = f"top_biomarkers_{disease}_{symptom}_{top_n}"
#     cached = load_from_cache(cache_key)
#     if cached:
#         return jsonify(cached)

#     # 2) Load full disease data
#     cache_key_disease = f"disease_{disease}"
#     disease_data = load_from_cache(cache_key_disease)
#     if not disease_data or "error" in disease_data:
#         return jsonify({"error": f"Disease '{disease}' not found"}), 404

#     # 3) Check symptom validity
#     valid_symptoms = {s 
#         for bm in disease_data.values()
#         for s in bm.keys()
#     }
#     if symptom not in valid_symptoms:
#         return jsonify({
#             "error":
#                 f"Symptom '{symptom}' not valid for disease '{disease}'. "
#                 f"Valid symptoms: {sorted(valid_symptoms)}"
#         }), 400

#     # 4) Compute top biomarkers
#     try:
#         result = get_top_biomarkers(disease_data, symptom, top_n)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     # 5) Save + return
#     save_to_cache(cache_key, result)
#     return jsonify(result)
        
# # ─────── /biomarkers_symptom Route ───────
# @app.route("/biomarkers_symptom", methods=["GET"])
# def biomarkers_symptom():
#     """
#     GET /biomarkers_symptom?symptom=<symptom>&disease=<disease>&top_n=<n>
#     Returns the top_n biomarkers and their average scores for the given symptom and disease.
#     """
#     symptom = request.args.get("symptom", "").strip()
#     disease = request.args.get("disease", "").strip()
#     try:
#         top_n = int(request.args.get("top_n", 5))
#     except ValueError:
#         return jsonify({"error": "'top_n' must be an integer"}), 400

#     # 1) Basic validation
#     if not symptom or not disease:
#         return jsonify({"error": "Missing 'symptom' or 'disease' query parameter"}), 400

#     # 2) Attempt to return from cache
#     cache_key = f"top_biomarkers_{symptom}_{disease}_{top_n}"
#     cached = load_from_cache(cache_key)
#     if cached:
#         return jsonify(cached)

#     # 3) Load the symptom_data (must be a dict of biomarker → { disease_name: metrics, … })
#     symptom_data = load_from_cache(symptom)
#     if not symptom_data or "error" in symptom_data:
#         return jsonify({"error": f"Symptom '{symptom}' not found"}), 404

#     # 4) (Optional) Validate that this disease actually appears under your symptom_data
#     #    This depends on how you structured `symptom_data`, but if you stored a list:
#     valid_diseases = symptom_data.get("diseases", [])
#     if valid_diseases and disease not in valid_diseases:
#         return jsonify({
#             "error": f"Disease '{disease}' not valid for symptom '{symptom}'. "
#                      f"Valid diseases: {valid_diseases}"
#         }), 400

#     # 5) Compute top biomarkers
#     try:
#         result = get_top_biomarkers_for_disease(disease, symptom_data, top_n)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     # 6) Cache + return
#     save_to_cache(cache_key, result)
#     return jsonify(result)



# @app.route('/ligmaballs', methods=["POST"])
# def match_disease_and_biomarker():
#     disease_name = request.json.get('disease', '').strip()
#     biomarker = request.json.get('biomarker', '').strip()
#     symptom_data = request.json.get('symptom_data', {})

#     if not disease_name or not biomarker:
#         return {"error": "Disease name and biomarker are required."}, 400

#     excel_file_path = './Test_output_o4_mini_new.xlsx'
#     quantified_biomarker_file_path = './Quantified_Biomarkers_AK.xlsx'

#     # Load files
#     df = pd.read_excel(excel_file_path)
#     df_qb = pd.read_excel(quantified_biomarker_file_path)

#     relevant_diseases = []
#     if "nested_assoc" in symptom_data:
#         for key, value in symptom_data["nested_assoc"].items():
#             for disease in value:
#                 if disease_name.lower() in disease.lower():
#                     relevant_diseases.append(disease)

#     # Proceed even if no relevant diseases found
#     disease_matches = df[df['Disease_Name'].apply(
#         lambda x: any(disease.strip().lower() == disease_name.lower() for disease in str(x).split(','))
#     )] if relevant_diseases else pd.DataFrame()

#     biomarker_match = disease_matches[disease_matches['Biomarker_Mapped'].apply(
#         lambda x: any(bm.strip().lower() == biomarker.lower() for bm in str(x).split(','))
#     )] if not disease_matches.empty else pd.DataFrame()

#     def get_matching_biomarker(row_biomarker, biomarker_input):
#         biomarker_list = [bm.strip() for bm in str(row_biomarker).split(',')]
#         matching_biomarker = [bm for bm in biomarker_list if bm.lower() == biomarker_input.lower()]
#         return matching_biomarker[0] if matching_biomarker else ''

#     if not biomarker_match.empty:
#         biomarker_match['Matched_Biomarker'] = biomarker_match['Biomarker_Mapped'].apply(
#             lambda x: get_matching_biomarker(x, biomarker)
#         )
#         result = biomarker_match[['Matched_Biomarker', 'Reference Point', 'Quantified Changes',
#                                   'Comparison to Reference', 'Direction', 'Insights']]
#     else:
#         result = pd.DataFrame(columns=['Matched_Biomarker', 'Reference Point', 'Quantified Changes',
#                                        'Comparison to Reference', 'Direction', 'Insights'])

#     # Normalize and match quantified biomarker
#     df_qb['Biomarker'] = df_qb['Biomarker'].astype(str).str.strip().str.lower()
#     normalized_input = biomarker.strip().lower()
#     qb_result = df_qb[df_qb['Biomarker'] == normalized_input]
#     qb_dict = qb_result.iloc[0].to_dict() if not qb_result.empty else {}

#     return jsonify({
#         "result": result.to_dict(orient='records'),
#         "quantified_biomarker": qb_dict
#     }), 200


# # Initialize Elasticsearch client
# try:
#     es = Elasticsearch([ES_HOST])
#     if not es.ping():
#         app.logger.error("Cannot connect to Elasticsearch")
#     else:
#         app.logger.info("Connected to Elasticsearch successfully")
# except Exception as e:
#     app.logger.error(f"Elasticsearch connection error: {e}")
#     es = None



# class BiomarkerService:
#     def __init__(self, es_client):
#         self.es = es_client
#         self.index = ES_INDEX
    
#     def get_all_biomarkers(self):
#         """Get all unique biomarker names from the index"""
#         try:
#             query = {
#                 "size": 0,
#                 "aggs": {
#                     "biomarkers": {
#                         "terms": {
#                             "field": "Biomarker Name.keyword",
#                             "size": 10000
#                         }
#                     }
#                 }
#             }
            
#             response = self.es.search(index=self.index, body=query)
#             biomarkers = [bucket['key'] for bucket in response['aggregations']['biomarkers']['buckets']]
            
#             return {
#                 'success': True,
#                 'biomarkers': sorted(biomarkers),
#                 'count': len(biomarkers)
#             }
#         except Exception as e:
#             app.logger.error(f"Error fetching biomarkers: {e}")
#             return {'success': False, 'error': str(e)}
    
#     def get_conditions(self):
#         """Get all unique conditions from the index"""
#         try:
#             query = {
#                 "size": 0,
#                 "aggs": {
#                     "conditions": {
#                         "terms": {
#                             "field": "Condition.keyword",
#                             "size": 1000
#                         }
#                     }
#                 }
#             }
            
#             response = self.es.search(index=self.index, body=query)
#             conditions = [bucket['key'] for bucket in response['aggregations']['conditions']['buckets']]
            
#             return {
#                 'success': True,
#                 'conditions': sorted(conditions),
#                 'count': len(conditions)
#             }
#         except Exception as e:
#             app.logger.error(f"Error fetching conditions: {e}")
#             return {'success': False, 'error': str(e)}
    
#     def calculate_biomarker_score(self, biomarker_name, condition):
#         """Calculate score for a biomarker in a specific condition"""
#         try:
#             # Get total PDFs for the condition
#             total_pdfs_query = {
#                 "size": 0,
#                 "query": {
#                     "term": {"Condition.keyword": condition}
#                 },
#                 "aggs": {
#                     "unique_pdfs": {
#                         "cardinality": {
#                             "field": "PDF_name.keyword"
#                         }
#                     }
#                 }
#             }
            
#             # Get PDFs containing the biomarker for the condition
#             biomarker_pdfs_query = {
#                 "size": 0,
#                 "query": {
#                     "bool": {
#                         "must": [
#                             {"term": {"Condition.keyword": condition}},
#                             {"term": {"Biomarker Name.keyword": biomarker_name}}
#                         ]
#                     }
#                 },
#                 "aggs": {
#                     "unique_pdfs": {
#                         "cardinality": {
#                             "field": "PDF_name.keyword"
#                         }
#                     }
#                 }
#             }
            
#             total_response = self.es.search(index=self.index, body=total_pdfs_query)
#             biomarker_response = self.es.search(index=self.index, body=biomarker_pdfs_query)
            
#             total_pdfs = total_response['aggregations']['unique_pdfs']['value']
#             biomarker_pdfs = biomarker_response['aggregations']['unique_pdfs']['value']
            
#             score = (biomarker_pdfs / total_pdfs) if total_pdfs > 0 else 0
            
#             return {
#                 'success': True,
#                 'biomarker': biomarker_name,
#                 'condition': condition,
#                 'score': round(score, 4),
#                 'biomarker_pdfs': biomarker_pdfs,
#                 'total_pdfs': total_pdfs
#             }
#         except Exception as e:
#             app.logger.error(f"Error calculating score for {biomarker_name}: {e}")
#             return {'success': False, 'error': str(e)}
    
#     def get_biomarker_data(self, biomarker_name, condition, page=1, size=20):
#         """Get all data for a specific biomarker in a condition"""
#         try:
#             from_offset = (page - 1) * size
            
#             query = {
#                 "from": from_offset,
#                 "size": size,
#                 "query": {
#                     "bool": {
#                         "must": [
#                             {"term": {"Condition.keyword": condition}},
#                             {"term": {"Biomarker Name.keyword": biomarker_name}}
#                         ]
#                     }
#                 },
#                 "sort": [
#                     {"_score": {"order": "desc"}},
#                     {"PDF_name.keyword": {"order": "asc"}}
#                 ]
#             }
            
#             response = self.es.search(index=self.index, body=query)
            
#             # Get total count
#             count_query = {
#                 "query": {
#                     "bool": {
#                         "must": [
#                             {"term": {"Condition.keyword": condition}},
#                             {"term": {"Biomarker Name.keyword": biomarker_name}}
#                         ]
#                     }
#                 }
#             }
#             count_response = self.es.count(index=self.index, body=count_query)
            
#             total_count = count_response['count']
#             documents = [hit['_source'] for hit in response['hits']['hits']]
            
#             return {
#                 'success': True,
#                 'biomarker': biomarker_name,
#                 'condition': condition,
#                 'data': documents,
#                 'total_count': total_count,
#                 'page': page,
#                 'size': size,
#                 'total_pages': (total_count + size - 1) // size
#             }
#         except Exception as e:
#             app.logger.error(f"Error fetching data for {biomarker_name}: {e}")
#             return {'success': False, 'error': str(e)}
    
#     def compare_treatments(self, treatment1, treatment2):
#         """Compare two treatments with their biomarkers"""
#         try:
#             results = {
#                 'treatment1': {
#                     'name': treatment1['name'],
#                     'condition': treatment1['condition'],
#                     'biomarkers': []
#                 },
#                 'treatment2': {
#                     'name': treatment2['name'],
#                     'condition': treatment2['condition'],
#                     'biomarkers': []
#                 }
#             }
            
#             # Calculate scores for treatment 1
#             for biomarker in treatment1['biomarkers']:
#                 if biomarker['name'].strip():
#                     score_data = self.calculate_biomarker_score(
#                         biomarker['name'], 
#                         treatment1['condition']
#                     )
#                     if score_data['success']:
#                         results['treatment1']['biomarkers'].append(score_data)
            
#             # Calculate scores for treatment 2
#             for biomarker in treatment2['biomarkers']:
#                 if biomarker['name'].strip():
#                     score_data = self.calculate_biomarker_score(
#                         biomarker['name'], 
#                         treatment2['condition']
#                     )
#                     if score_data['success']:
#                         results['treatment2']['biomarkers'].append(score_data)
            
#             # Calculate comparison metrics
#             comparison_metrics = self._calculate_comparison_metrics(results)
            
#             return {
#                 'success': True,
#                 'comparison': results,
#                 'metrics': comparison_metrics
#             }
#         except Exception as e:
#             app.logger.error(f"Error comparing treatments: {e}")
#             return {'success': False, 'error': str(e)}
    
#     def _calculate_comparison_metrics(self, results):
#         """Calculate comparison metrics between treatments"""
#         t1_scores = [b['score'] for b in results['treatment1']['biomarkers']]
#         t2_scores = [b['score'] for b in results['treatment2']['biomarkers']]
        
#         t1_avg = sum(t1_scores) / len(t1_scores) if t1_scores else 0
#         t2_avg = sum(t2_scores) / len(t2_scores) if t2_scores else 0
        
#         # Find common biomarkers
#         t1_biomarkers = set(b['biomarker'] for b in results['treatment1']['biomarkers'])
#         t2_biomarkers = set(b['biomarker'] for b in results['treatment2']['biomarkers'])
#         common_biomarkers = t1_biomarkers.intersection(t2_biomarkers)
        
#         return {
#             'treatment1_avg_score': round(t1_avg, 4),
#             'treatment2_avg_score': round(t2_avg, 4),
#             'score_difference': round(abs(t1_avg - t2_avg), 4),
#             'common_biomarkers': list(common_biomarkers),
#             'common_biomarkers_count': len(common_biomarkers),
#             'treatment1_unique': list(t1_biomarkers - t2_biomarkers),
#             'treatment2_unique': list(t2_biomarkers - t1_biomarkers)
#         }
    
#     def search_biomarkers(self, query, condition=None, limit=50):
#         """Search biomarkers with optional condition filter"""
#         try:
#             search_query = {
#                 "size": limit,
#                 "query": {
#                     "bool": {
#                         "must": [
#                             {
#                                 "multi_match": {
#                                     "query": query,
#                                     "fields": [
#                                         "Biomarker Name^2",
#                                         "Key Outcome",
#                                         "Treatment_Name"
#                                     ],
#                                     "type": "best_fields",
#                                     "fuzziness": "AUTO"
#                                 }
#                             }
#                         ]
#                     }
#                 },
#                 "highlight": {
#                     "fields": {
#                         "Biomarker Name": {},
#                         "Key Outcome": {},
#                         "Treatment_Name": {}
#                     }
#                 }
#             }
            
#             if condition:
#                 search_query["query"]["bool"]["must"].append({
#                     "term": {"Condition.keyword": condition}
#                 })
            
#             response = self.es.search(index=self.index, body=search_query)
            
#             results = []
#             for hit in response['hits']['hits']:
#                 result = hit['_source'].copy()
#                 result['_score'] = hit['_score']
#                 if 'highlight' in hit:
#                     result['_highlight'] = hit['highlight']
#                 results.append(result)
            
#             return {
#                 'success': True,
#                 'results': results,
#                 'total_hits': response['hits']['total']['value'],
#                 'query': query
#             }
#         except Exception as e:
#             app.logger.error(f"Error searching biomarkers: {e}")
#             return {'success': False, 'error': str(e)}

# # Initialize service
# biomarker_service = BiomarkerService(es) if es else None

# # API Routes
# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint"""
#     return jsonify({
#         'status': 'healthy',
#         'elasticsearch_connected': es is not None and es.ping(),
#         'timestamp': datetime.now().isoformat()
#     })

# @app.route('/api/biomarkers', methods=['GET'])
# def get_biomarkers():
#     """Get all available biomarkers"""
#     if not biomarker_service:
#         return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
#     result = biomarker_service.get_all_biomarkers()
#     return jsonify(result)

# @app.route('/api/conditions', methods=['GET'])
# def get_conditions():
#     """Get all available conditions"""
#     if not biomarker_service:
#         return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
#     result = biomarker_service.get_conditions()
#     return jsonify(result)

# @app.route('/api/biomarker/score', methods=['POST'])
# def calculate_score():
#     """Calculate biomarker score for a condition"""
#     if not biomarker_service:
#         return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
#     data = request.get_json()
#     biomarker_name = data.get('biomarker_name')
#     condition = data.get('condition')
    
#     if not biomarker_name or not condition:
#         return jsonify({'success': False, 'error': 'biomarker_name and condition are required'}), 400
    
#     result = biomarker_service.calculate_biomarker_score(biomarker_name, condition)
#     return jsonify(result)

# @app.route('/api/biomarker/data', methods=['POST'])
# def get_biomarker_data():
#     """Get all data for a biomarker in a condition"""
#     if not biomarker_service:
#         return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
#     data = request.get_json()
#     biomarker_name = data.get('biomarker_name')
#     condition = data.get('condition')
#     page = data.get('page', 1)
#     size = data.get('size', 20)
    
#     if not biomarker_name or not condition:
#         return jsonify({'success': False, 'error': 'biomarker_name and condition are required'}), 400
    
#     result = biomarker_service.get_biomarker_data(biomarker_name, condition, page, size)
#     return jsonify(result)

# @app.route('/api/treatments/compare', methods=['POST'])
# def compare_treatments():
#     """Compare two treatments"""
#     if not biomarker_service:
#         return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
#     data = request.get_json()
#     treatment1 = data.get('treatment1')
#     treatment2 = data.get('treatment2')
    
#     if not treatment1 or not treatment2:
#         return jsonify({'success': False, 'error': 'Both treatments are required'}), 400
    
#     result = biomarker_service.compare_treatments(treatment1, treatment2)
#     return jsonify(result)

# @app.route('/api/search', methods=['POST'])
# def search_biomarkers():
#     """Search biomarkers with query"""
#     if not biomarker_service:
#         return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
#     data = request.get_json()
#     query = data.get('query')
#     condition = data.get('condition')
#     limit = data.get('limit', 50)
    
#     if not query:
#         return jsonify({'success': False, 'error': 'query is required'}), 400
    
#     result = biomarker_service.search_biomarkers(query, condition, limit)
#     return jsonify(result)

# @app.route('/api/treatment/scores', methods=['POST'])
# def get_treatment_scores():
#     """Get scores for all biomarkers in a treatment"""
#     if not biomarker_service:
#         return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
#     data = request.get_json()
#     treatment = data.get('treatment')
    
#     if not treatment:
#         return jsonify({'success': False, 'error': 'treatment is required'}), 400
    
#     scores = []
#     for biomarker in treatment.get('biomarkers', []):
#         if biomarker.get('name', '').strip():
#             score_data = biomarker_service.calculate_biomarker_score(
#                 biomarker['name'], 
#                 treatment.get('condition', 'Aging')
#             )
#             if score_data['success']:
#                 scores.append(score_data)
    
#     return jsonify({
#         'success': True,
#         'treatment': treatment,
#         'scores': scores
#     })

# @app.errorhandler(404)
# def not_found(error):
#     return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

# @app.errorhandler(500)
# def internal_error(error):
#     return jsonify({'success': False, 'error': 'Internal server error'}), 500





# if __name__ == "__main__":
#     # By default, Flask runs on http://127.0.0.1:5000
#     app.run(debug=True)




from flask import Flask, request, abort, jsonify
from flask_cors import CORS
import io
import time
import base64
import pandas as pd
import numpy as np
from openpyxl import load_workbook
from elasticsearch import Elasticsearch
from collections import defaultdict
from datetime import datetime
import os
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# ---- Cache utilities (your own functions) ----
from cache_utiities import load_from_cache, save_to_cache, clean_old_caches

# ---- Disease‐logic function (your own file) ----
from from_disease import process_disease_landscape, get_top_biomarkers
from from_symptom import process_symptom_data, process_symptom_landscape, get_top_biomarkers_for_disease

import matplotlib
matplotlib.use("Agg")  # non‐interactive backend for plotting
import matplotlib.pyplot as plt
from matplotlib.patches import Patch

app = Flask(__name__)
CORS(app)

# ────────────────────────────────
VALID_CATEGORIES = ["inhibitor", "promoter"]

# ────────────────────────────────
# Elasticsearch configuration with authentication
ES_ENDPOINT = os.getenv('elasticsearchendpoint', 'https://a25cbf64ca0d465a9d3eb5d9479121b6.eastus2.azure.elastic-cloud.com:443')
ES_API_KEY = os.getenv('elasticapikey', '')
ES_INDEX = 'trialpredict_biomarkers'


# Add this environment variable loading
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Initialize OpenAI client (add after your existing configurations)
openai.api_key = OPENAI_API_KEY

# Cache for biomarkers and conditions to avoid repeated ES calls
_biomarkers_cache = None
_conditions_cache = None
_cache_timestamp = None
CACHE_DURATION = 3600  # 1 hour in seconds

def get_elasticsearch_client():
    """Initialize Elasticsearch client with proper authentication"""
    try:
        if ES_API_KEY:
            # Using API Key authentication
            es = Elasticsearch(
                [ES_ENDPOINT],
                api_key=ES_API_KEY,
                verify_certs=True,
                ssl_show_warn=False
            )
        else:
            # Fallback without authentication (for local testing)
            es = Elasticsearch([ES_ENDPOINT])
        
        # Test connection
        if es.ping():
            app.logger.info("Connected to Elasticsearch successfully")
            return es
        else:
            app.logger.error("Cannot ping Elasticsearch")
            return None
    except Exception as e:
        app.logger.error(f"Elasticsearch connection error: {e}")
        return None

# Initialize Elasticsearch client
es = get_elasticsearch_client()

class BiomarkerService:
    def __init__(self, es_client):
        self.es = es_client
        self.index = ES_INDEX
    
    def get_all_biomarkers(self):
        """Get all unique biomarker names from the index with caching"""
        global _biomarkers_cache, _cache_timestamp
        
        # Check cache first
        current_time = time.time()
        if (_biomarkers_cache is not None and 
            _cache_timestamp is not None and 
            current_time - _cache_timestamp < CACHE_DURATION):
            return {
                'success': True,
                'biomarkers': _biomarkers_cache,
                'count': len(_biomarkers_cache),
                'cached': True
            }
        
        try:
            query = {
                "size": 0,
                "aggs": {
                    "biomarkers": {
                        "terms": {
                            "field": "Biomarker Name.keyword",
                            "size": 10000
                        }
                    }
                }
            }
            
            response = self.es.search(index=self.index, body=query)
            biomarkers = [bucket['key'] for bucket in response['aggregations']['biomarkers']['buckets']]
            
            # Cache the results
            _biomarkers_cache = sorted(biomarkers)
            _cache_timestamp = current_time
            
            return {
                'success': True,
                'biomarkers': _biomarkers_cache,
                'count': len(_biomarkers_cache),
                'cached': False
            }
        except Exception as e:
            app.logger.error(f"Error fetching biomarkers: {e}")
            # Return fallback data if ES fails
            fallback_biomarkers = [
                'IL-6', 'MCP-1', 'Angiogenin', 'IL-8', 'Osteoprotegerin', 'HGF', 
                'TIMP-1', 'IGFBP-2', 'TIMP-2', 'TNF-α', 'Collagen I', 'Elastin', 
                'Hyaluronic Acid', 'Melanin', 'Tyrosinase', 'Filaggrin', 'VEGF',
                'TGF-β', 'MMP-1', 'MMP-3', 'Ceramides', 'Squalene'
            ]
            return {
                'success': True,
                'biomarkers': fallback_biomarkers,
                'count': len(fallback_biomarkers),
                'fallback': True,
                'error': str(e)
            }
    
    def get_conditions(self):
        """Get all unique conditions from the index with caching"""
        global _conditions_cache, _cache_timestamp
        
        # Check cache first
        current_time = time.time()
        if (_conditions_cache is not None and 
            _cache_timestamp is not None and 
            current_time - _cache_timestamp < CACHE_DURATION):
            return {
                'success': True,
                'conditions': _conditions_cache,
                'count': len(_conditions_cache),
                'cached': True
            }
        
        try:
            query = {
                "size": 0,
                "aggs": {
                    "conditions": {
                        "terms": {
                            "field": "Condition.keyword",
                            "size": 1000
                        }
                    }
                }
            }
            
            response = self.es.search(index=self.index, body=query)
            conditions = [bucket['key'] for bucket in response['aggregations']['conditions']['buckets']]
            
            # Cache the results
            _conditions_cache = sorted(conditions)
            if _cache_timestamp is None:  # Only update if not already set by biomarkers
                _cache_timestamp = current_time
            
            return {
                'success': True,
                'conditions': _conditions_cache,
                'count': len(_conditions_cache),
                'cached': False
            }
        except Exception as e:
            app.logger.error(f"Error fetching conditions: {e}")
            # Return fallback data if ES fails
            fallback_conditions = ['Aging', 'Pigmentation', 'Wrinkles', 'Acne', 'Dryness', 'Sensitivity']
            return {
                'success': True,
                'conditions': fallback_conditions,
                'count': len(fallback_conditions),
                'fallback': True,
                'error': str(e)
            }
    
    def calculate_biomarker_score(self, biomarker_name, condition):
        """Calculate score for a biomarker in a specific condition"""
        try:
            # Get total PDFs for the condition
            total_pdfs_query = {
                "size": 0,
                "query": {
                    "term": {"Condition.keyword": condition}
                },
                "aggs": {
                    "unique_pdfs": {
                        "cardinality": {
                            "field": "PDF_name.keyword"
                        }
                    }
                }
            }
            
            # Get PDFs containing the biomarker for the condition
            biomarker_pdfs_query = {
                "size": 0,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"Condition.keyword": condition}},
                            {"term": {"Biomarker Name.keyword": biomarker_name}}
                        ]
                    }
                },
                "aggs": {
                    "unique_pdfs": {
                        "cardinality": {
                            "field": "PDF_name.keyword"
                        }
                    }
                }
            }
            
            total_response = self.es.search(index=self.index, body=total_pdfs_query)
            biomarker_response = self.es.search(index=self.index, body=biomarker_pdfs_query)
            
            total_pdfs = total_response['aggregations']['unique_pdfs']['value']
            biomarker_pdfs = biomarker_response['aggregations']['unique_pdfs']['value']
            
            score = (biomarker_pdfs / total_pdfs) if total_pdfs > 0 else 0
            
            return {
                'success': True,
                'biomarker': biomarker_name,
                'condition': condition,
                'score': round(score, 4),
                'biomarker_pdfs': biomarker_pdfs,
                'total_pdfs': total_pdfs
            }
        except Exception as e:
            app.logger.error(f"Error calculating score for {biomarker_name}: {e}")
            # Return mock score if ES fails
            mock_scores = {
                'IL-6': {'Aging': 0.75, 'Pigmentation': 0.45, 'Wrinkles': 0.65},
                'MCP-1': {'Aging': 0.68, 'Pigmentation': 0.52, 'Wrinkles': 0.58},
                'Melanin': {'Aging': 0.35, 'Pigmentation': 0.85, 'Wrinkles': 0.42},
                'Tyrosinase': {'Aging': 0.42, 'Pigmentation': 0.78, 'Wrinkles': 0.38}
            }
            
            score = mock_scores.get(biomarker_name, {}).get(condition, 0.5)
            return {
                'success': True,
                'biomarker': biomarker_name,
                'condition': condition,
                'score': round(score, 4),
                'biomarker_pdfs': int(score * 20),
                'total_pdfs': 20,
                'fallback': True,
                'error': str(e)
            }
    
    def get_biomarker_data(self, biomarker_name, condition, page=1, size=20):
        """Get all data for a specific biomarker in a condition"""
        try:
            from_offset = (page - 1) * size
            
            query = {
                "from": from_offset,
                "size": size,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"Condition.keyword": condition}},
                            {"term": {"Biomarker Name.keyword": biomarker_name}}
                        ]
                    }
                },
                "sort": [
                    {"_score": {"order": "desc"}},
                    {"PDF_name.keyword": {"order": "asc"}}
                ]
            }
            
            response = self.es.search(index=self.index, body=query)
            
            # Get total count
            count_query = {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"Condition.keyword": condition}},
                            {"term": {"Biomarker Name.keyword": biomarker_name}}
                        ]
                    }
                }
            }
            count_response = self.es.count(index=self.index, body=count_query)
            
            total_count = count_response['count']
            documents = [hit['_source'] for hit in response['hits']['hits']]
            
            return {
                'success': True,
                'biomarker': biomarker_name,
                'condition': condition,
                'data': documents,
                'total_count': total_count,
                'page': page,
                'size': size,
                'total_pages': (total_count + size - 1) // size
            }
        except Exception as e:
            app.logger.error(f"Error fetching data for {biomarker_name}: {e}")
            # Return mock data if ES fails
            mock_data = [
                {
                    'Subject ID': 'BA001',
                    'PDF_name': f'{condition}_study_001.pdf',
                    'Treatment_Name': 'Test Treatment A',
                    'Biomarker_Level_Change': 'increase',
                    'Skin_Change_Type': condition.lower(),
                    'Type of Study': 'Clinical trial',
                    'Age': 35,
                    'Sex': 'Female',
                    'Treatment_Status': 'Completed',
                    'Key Outcome': f'Significant improvement in {biomarker_name} levels observed after treatment.'
                }
            ]
            
            return {
                'success': True,
                'biomarker': biomarker_name,
                'condition': condition,
                'data': mock_data,
                'total_count': len(mock_data),
                'page': page,
                'size': size,
                'total_pages': 1,
                'fallback': True,
                'error': str(e)
            }
    
    def search_biomarkers(self, query, condition=None, limit=50):
        """Search biomarkers with optional condition filter"""
        try:
            search_query = {
                "size": limit,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "multi_match": {
                                    "query": query,
                                    "fields": [
                                        "Biomarker Name^2",
                                        "Key Outcome",
                                        "Treatment_Name"
                                    ],
                                    "type": "best_fields",
                                    "fuzziness": "AUTO"
                                }
                            }
                        ]
                    }
                },
                "highlight": {
                    "fields": {
                        "Biomarker Name": {},
                        "Key Outcome": {},
                        "Treatment_Name": {}
                    }
                }
            }
            
            if condition:
                search_query["query"]["bool"]["must"].append({
                    "term": {"Condition.keyword": condition}
                })
            
            response = self.es.search(index=self.index, body=search_query)
            
            results = []
            for hit in response['hits']['hits']:
                result = hit['_source'].copy()
                result['_score'] = hit['_score']
                if 'highlight' in hit:
                    result['_highlight'] = hit['highlight']
                results.append(result)
            
            return {
                'success': True,
                'results': results,
                'total_hits': response['hits']['total']['value'],
                'query': query
            }
        except Exception as e:
            app.logger.error(f"Error searching biomarkers: {e}")
            return {'success': False, 'error': str(e)}

    def compare_treatments(self, treatment1, treatment2):
        """Compare two treatments with their biomarkers"""
        try:
            results = {
                'treatment1': {
                    'name': treatment1['name'],
                    'condition': treatment1['condition'],
                    'biomarkers': []
                },
                'treatment2': {
                    'name': treatment2['name'],
                    'condition': treatment2['condition'],
                    'biomarkers': []
                }
            }
            
            # Calculate scores for treatment 1
            for biomarker in treatment1['biomarkers']:
                if biomarker['name'].strip():
                    score_data = self.calculate_biomarker_score(
                        biomarker['name'], 
                        treatment1['condition']
                    )
                    if score_data['success']:
                        results['treatment1']['biomarkers'].append(score_data)
            
            # Calculate scores for treatment 2
            for biomarker in treatment2['biomarkers']:
                if biomarker['name'].strip():
                    score_data = self.calculate_biomarker_score(
                        biomarker['name'], 
                        treatment2['condition']
                    )
                    if score_data['success']:
                        results['treatment2']['biomarkers'].append(score_data)
            
            # Calculate comparison metrics
            comparison_metrics = self._calculate_comparison_metrics(results)
            
            return {
                'success': True,
                'comparison': results,
                'metrics': comparison_metrics
            }
        except Exception as e:
            app.logger.error(f"Error comparing treatments: {e}")
            return {'success': False, 'error': str(e)}
    
    def _calculate_comparison_metrics(self, results):
        """Calculate comparison metrics between treatments"""
        t1_scores = [b['score'] for b in results['treatment1']['biomarkers']]
        t2_scores = [b['score'] for b in results['treatment2']['biomarkers']]
        
        t1_avg = sum(t1_scores) / len(t1_scores) if t1_scores else 0
        t2_avg = sum(t2_scores) / len(t2_scores) if t2_scores else 0
        
        # Find common biomarkers
        t1_biomarkers = set(b['biomarker'] for b in results['treatment1']['biomarkers'])
        t2_biomarkers = set(b['biomarker'] for b in results['treatment2']['biomarkers'])
        common_biomarkers = t1_biomarkers.intersection(t2_biomarkers)
        
        return {
            'treatment1_avg_score': round(t1_avg, 4),
            'treatment2_avg_score': round(t2_avg, 4),
            'score_difference': round(abs(t1_avg - t2_avg), 4),
            'common_biomarkers': list(common_biomarkers),
            'common_biomarkers_count': len(common_biomarkers),
            'treatment1_unique': list(t1_biomarkers - t2_biomarkers),
            'treatment2_unique': list(t2_biomarkers - t1_biomarkers)
        }

# Initialize service
biomarker_service = BiomarkerService(es) if es else None

# Pre-load biomarkers and conditions on startup
if biomarker_service:
    app.logger.info("Pre-loading biomarkers and conditions...")
    biomarker_service.get_all_biomarkers()
    biomarker_service.get_conditions()
    app.logger.info("Biomarkers and conditions cached successfully")

# ─────── Your existing routes ────────
@app.route("/symptom", methods=["GET"])
def symptom_page():
    """GET /symptom?name=<symptom>"""
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

@app.route("/disease_landscape", methods=["GET"])
def disease_landscape():
    """GET /disease_landscape?disease=<name>"""
    t0 = time.time()
    disease_name = request.args.get("disease", "").strip()
    if not disease_name:
        return jsonify({"error": "Missing 'disease' query parameter"}), 400
    t1 = time.time()

    result = process_disease_landscape(disease_name)
    cache_key = f"disease_{disease_name}"
    save_to_cache(cache_key, result)
    if "symptoms" in result:
        del result["symptoms"]
    t2 = time.time()
    if isinstance(result, dict) and "error" in result:
        return jsonify(result), 404
    t3 = time.time()

    print(f"Timings: parse_args {t1-t0:.2f}s, process_data {t2-t1:.2f}s, return {t3-t2:.2f}s")
    return jsonify(result)

@app.route("/biomarkers_disease", methods=["GET"])
def biomarkers():
    """GET /biomarkers_disease?disease=<disease>&symptom=<symptom>&top_n=<n>"""
    disease  = request.args.get("disease",  "").strip()
    symptom  = request.args.get("symptom",  "").strip()
    top_n    = int(request.args.get("top_n", 5))

    if not disease or not symptom:
        return jsonify({"error": "Missing 'disease' or 'symptom' query parameter"}), 400

    cache_key = f"top_biomarkers_{disease}_{symptom}_{top_n}"
    cached = load_from_cache(cache_key)
    if cached:
        return jsonify(cached)

    cache_key_disease = f"disease_{disease}"
    disease_data = load_from_cache(cache_key_disease)
    if not disease_data or "error" in disease_data:
        return jsonify({"error": f"Disease '{disease}' not found"}), 404

    valid_symptoms = {s for bm in disease_data.values() for s in bm.keys()}
    if symptom not in valid_symptoms:
        return jsonify({
            "error": f"Symptom '{symptom}' not valid for disease '{disease}'. Valid symptoms: {sorted(valid_symptoms)}"
        }), 400

    try:
        result = get_top_biomarkers(disease_data, symptom, top_n)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    save_to_cache(cache_key, result)
    return jsonify(result)

@app.route("/biomarkers_symptom", methods=["GET"])
def biomarkers_symptom():
    """GET /biomarkers_symptom?symptom=<symptom>&disease=<disease>&top_n=<n>"""
    symptom = request.args.get("symptom", "").strip()
    disease = request.args.get("disease", "").strip()
    try:
        top_n = int(request.args.get("top_n", 5))
    except ValueError:
        return jsonify({"error": "'top_n' must be an integer"}), 400

    if not symptom or not disease:
        return jsonify({"error": "Missing 'symptom' or 'disease' query parameter"}), 400

    cache_key = f"top_biomarkers_{symptom}_{disease}_{top_n}"
    cached = load_from_cache(cache_key)
    if cached:
        return jsonify(cached)

    symptom_data = load_from_cache(symptom)
    if not symptom_data or "error" in symptom_data:
        return jsonify({"error": f"Symptom '{symptom}' not found"}), 404

    valid_diseases = symptom_data.get("diseases", [])
    if valid_diseases and disease not in valid_diseases:
        return jsonify({
            "error": f"Disease '{disease}' not valid for symptom '{symptom}'. Valid diseases: {valid_diseases}"
        }), 400

    try:
        result = get_top_biomarkers_for_disease(disease, symptom_data, top_n)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    save_to_cache(cache_key, result)
    return jsonify(result)

@app.route('/ligmaballs', methods=["POST"])
def match_disease_and_biomarker():
    disease_name = request.json.get('disease', '').strip()
    biomarker = request.json.get('biomarker', '').strip()
    symptom_data = request.json.get('symptom_data', {})

    if not disease_name or not biomarker:
        return {"error": "Disease name and biomarker are required."}, 400

    excel_file_path = './Test_output_o4_mini_new.xlsx'
    quantified_biomarker_file_path = './Quantified_Biomarkers_AK.xlsx'

    df = pd.read_excel(excel_file_path)
    df_qb = pd.read_excel(quantified_biomarker_file_path)

    relevant_diseases = []
    if "nested_assoc" in symptom_data:
        for key, value in symptom_data["nested_assoc"].items():
            for disease in value:
                if disease_name.lower() in disease.lower():
                    relevant_diseases.append(disease)

    disease_matches = df[df['Disease_Name'].apply(
        lambda x: any(disease.strip().lower() == disease_name.lower() for disease in str(x).split(','))
    )] if relevant_diseases else pd.DataFrame()

    biomarker_match = disease_matches[disease_matches['Biomarker_Mapped'].apply(
        lambda x: any(bm.strip().lower() == biomarker.lower() for bm in str(x).split(','))
    )] if not disease_matches.empty else pd.DataFrame()

    def get_matching_biomarker(row_biomarker, biomarker_input):
        biomarker_list = [bm.strip() for bm in str(row_biomarker).split(',')]
        matching_biomarker = [bm for bm in biomarker_list if bm.lower() == biomarker_input.lower()]
        return matching_biomarker[0] if matching_biomarker else ''

    if not biomarker_match.empty:
        biomarker_match['Matched_Biomarker'] = biomarker_match['Biomarker_Mapped'].apply(
            lambda x: get_matching_biomarker(x, biomarker)
        )
        result = biomarker_match[['Matched_Biomarker', 'Reference Point', 'Quantified Changes',
                                  'Comparison to Reference', 'Direction', 'Insights']]
    else:
        result = pd.DataFrame(columns=['Matched_Biomarker', 'Reference Point', 'Quantified Changes',
                                       'Comparison to Reference', 'Direction', 'Insights'])

    df_qb['Biomarker'] = df_qb['Biomarker'].astype(str).str.strip().str.lower()
    normalized_input = biomarker.strip().lower()
    qb_result = df_qb[df_qb['Biomarker'] == normalized_input]
    qb_dict = qb_result.iloc[0].to_dict() if not qb_result.empty else {}

    return jsonify({
        "result": result.to_dict(orient='records'),
        "quantified_biomarker": qb_dict
    }), 200

# ─────── Biomarker Comparison API Routes ────────
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'elasticsearch_connected': es is not None and es.ping() if es else False,
        'cache_status': {
            'biomarkers_cached': _biomarkers_cache is not None,
            'conditions_cached': _conditions_cache is not None,
            'cache_age': time.time() - _cache_timestamp if _cache_timestamp else None
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/biomarkers', methods=['GET'])
def get_biomarkers():
    """Get all available biomarkers"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    result = biomarker_service.get_all_biomarkers()
    return jsonify(result)

@app.route('/api/conditions', methods=['GET'])
def get_conditions():
    """Get all available conditions"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    result = biomarker_service.get_conditions()
    return jsonify(result)

@app.route('/api/biomarker/score', methods=['POST'])
def calculate_score():
    """Calculate biomarker score for a condition"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    data = request.get_json()
    biomarker_name = data.get('biomarker_name')
    condition = data.get('condition')
    
    if not biomarker_name or not condition:
        return jsonify({'success': False, 'error': 'biomarker_name and condition are required'}), 400
    
    result = biomarker_service.calculate_biomarker_score(biomarker_name, condition)
    return jsonify(result)

@app.route('/api/biomarker/data', methods=['POST'])
def get_biomarker_data():
    """Get all data for a biomarker in a condition"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    data = request.get_json()
    biomarker_name = data.get('biomarker_name')
    condition = data.get('condition')
    page = data.get('page', 1)
    size = data.get('size', 20)
    
    if not biomarker_name or not condition:
        return jsonify({'success': False, 'error': 'biomarker_name and condition are required'}), 400
    
    result = biomarker_service.get_biomarker_data(biomarker_name, condition, page, size)
    return jsonify(result)

@app.route('/api/treatments/compare', methods=['POST'])
def compare_treatments():
    """Compare two treatments"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    data = request.get_json()
    treatment1 = data.get('treatment1')
    treatment2 = data.get('treatment2')
    
    if not treatment1 or not treatment2:
        return jsonify({'success': False, 'error': 'Both treatments are required'}), 400
    
    result = biomarker_service.compare_treatments(treatment1, treatment2)
    return jsonify(result)

@app.route('/api/search', methods=['POST'])
def search_biomarkers():
    """Search biomarkers with query"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    data = request.get_json()
    query = data.get('query')
    condition = data.get('condition')
    limit = data.get('limit', 50)
    
    if not query:
        return jsonify({'success': False, 'error': 'query is required'}), 400
    
    result = biomarker_service.search_biomarkers(query, condition, limit)
    return jsonify(result)

@app.route('/api/biomarker/scores-all', methods=['POST'])
def get_all_biomarker_scores():
    """Get scores for a biomarker across all conditions"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    data = request.get_json()
    biomarker_name = data.get('biomarker_name')
    
    if not biomarker_name:
        return jsonify({'success': False, 'error': 'biomarker_name is required'}), 400
    
    # Get all conditions first
    conditions_result = biomarker_service.get_conditions()
    if not conditions_result['success']:
        return jsonify({'success': False, 'error': 'Failed to get conditions'}), 500
    
    scores = {}
    for condition in conditions_result['conditions']:
        score_data = biomarker_service.calculate_biomarker_score(biomarker_name, condition)
        if score_data['success']:
            scores[condition] = score_data
    
    return jsonify({
        'success': True,
        'biomarker': biomarker_name,
        'scores': scores,
        'total_conditions': len(scores)
    })

@app.route('/api/treatment/scores', methods=['POST'])
def get_treatment_scores():
    """Get scores for all biomarkers in a treatment across all conditions"""
    if not biomarker_service:
        return jsonify({'success': False, 'error': 'Elasticsearch not available'}), 500
    
    data = request.get_json()
    treatment = data.get('treatment')
    
    if not treatment:
        return jsonify({'success': False, 'error': 'treatment is required'}), 400
    
    # Get all conditions first
    conditions_result = biomarker_service.get_conditions()
    if not conditions_result['success']:
        return jsonify({'success': False, 'error': 'Failed to get conditions'}), 500
    
    biomarker_scores = []
    for biomarker in treatment.get('biomarkers', []):
        if biomarker.get('name', '').strip():
            biomarker_data = {
                'biomarker': biomarker['name'],
                'scores': {},
                'summary': {}
            }
            
            # Calculate scores for all conditions
            all_scores = []
            for condition in conditions_result['conditions']:
                score_data = biomarker_service.calculate_biomarker_score(
                    biomarker['name'], 
                    condition
                )
                if score_data['success']:
                    biomarker_data['scores'][condition] = score_data
                    all_scores.append(score_data['score'])
            
            # Calculate summary statistics
            if all_scores:
                biomarker_data['summary'] = {
                    'average_score': round(sum(all_scores) / len(all_scores), 4),
                    'max_score': round(max(all_scores), 4),
                    'min_score': round(min(all_scores), 4),
                    'best_condition': max(biomarker_data['scores'].items(), key=lambda x: x[1]['score'])[0],
                    'total_conditions': len(all_scores)
                }
            
            biomarker_scores.append(biomarker_data)
    
    return jsonify({
        'success': True,
        'treatment': treatment,
        'biomarker_scores': biomarker_scores
    })


# Fixed version of the OpenAI routes without async/await
# Add these routes to your existing app.py file (replacing the async versions)

import hashlib
from functools import wraps
import logging
from datetime import timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting decorator (fixed)
def rate_limit(max_requests=10, window_seconds=60):
    request_times = {}
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.environ.get('REMOTE_ADDR', 'unknown')
            current_time = time.time()
            
            # Clean old entries
            if client_ip in request_times:
                request_times[client_ip] = [
                    req_time for req_time in request_times[client_ip]
                    if current_time - req_time < window_seconds
                ]
            else:
                request_times[client_ip] = []
            
            # Check rate limit
            if len(request_times[client_ip]) >= max_requests:
                return jsonify({
                    'success': False,
                    'error': 'Rate limit exceeded. Please try again later.'
                }), 429
            
            # Add current request
            request_times[client_ip].append(current_time)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Enhanced error handler
def handle_api_error(error, context="Unknown"):
    """Enhanced error handling with detailed logging"""
    error_id = hashlib.md5(f"{str(error)}{time.time()}".encode()).hexdigest()[:8]
    
    app.logger.error(f"API Error [{error_id}] in {context}: {str(error)}")
    
    return {
        'success': False,
        'error': str(error),
        'error_id': error_id,
        'context': context,
        'timestamp': datetime.now().isoformat()
    }

# Fixed OpenAI route (synchronous)
@app.route('/api/insights/generate', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=300)
def generate_treatment_insights():
    """Generate AI insights for treatment comparison (synchronous version)"""
    if not OPENAI_API_KEY:
        return jsonify(handle_api_error(
            "OpenAI API key not configured", 
            "insights_generation"
        )), 500
    
    try:
        request_start_time = time.time()
        data = request.get_json()
        
        # Validate input
        validation_result = validate_insights_request(data)
        if not validation_result['valid']:
            return jsonify(handle_api_error(
                validation_result['error'], 
                "input_validation"
            )), 400
        
        user_query = data.get('query', '').strip()
        treatment_data = data.get('treatment_data', {})
        comparison_context = data.get('comparison_context', {})
        options = data.get('options', {})
        
        # Gather comprehensive data from Elasticsearch (synchronous)
        app.logger.info(f"Starting insights generation for query: {user_query[:50]}...")
        insights_data = gather_treatment_insights_data_sync(treatment_data, comparison_context)
        
        # Generate OpenAI insights (synchronous)
        ai_response = generate_openai_insights_sync(user_query, insights_data, options)
        
        processing_time = time.time() - request_start_time
        
        response_data = {
            'success': True,
            'insights': ai_response['insights'],
            'metadata': {
                'query': user_query,
                'timestamp': datetime.now().isoformat(),
                'processing_time_seconds': round(processing_time, 2),
                'data_points': insights_data.get('total_data_points', 0),
                'treatments_analyzed': len(treatment_data.get('treatments', [])),
                'biomarkers_analyzed': insights_data.get('unique_biomarkers_count', 0),
                'analysis_depth': determine_analysis_depth(insights_data),
                'confidence_score': calculate_confidence_score(insights_data),
                'data_quality': assess_data_quality(insights_data)
            },
            'suggestions': generate_follow_up_suggestions(user_query, insights_data),
            'export_options': ['json', 'txt']
        }
        
        # Log successful generation
        app.logger.info(f"Successfully generated insights in {processing_time:.2f}s")
        
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"Error generating insights: {e}")
        return jsonify(handle_api_error(e, "insights_generation")), 500

def validate_insights_request(data):
    """Validate insights generation request"""
    if not data:
        return {'valid': False, 'error': 'No data provided'}
    
    if not data.get('query', '').strip():
        return {'valid': False, 'error': 'Query is required'}
    
    treatment_data = data.get('treatment_data', {})
    if not treatment_data or not treatment_data.get('treatments'):
        return {'valid': False, 'error': 'Treatment data is required'}
    
    # Validate treatment structure
    for treatment in treatment_data.get('treatments', []):
        if not treatment.get('name') or not treatment.get('biomarkers'):
            return {'valid': False, 'error': 'Each treatment must have a name and biomarkers'}
    
    return {'valid': True}

def gather_treatment_insights_data_sync(treatment_data, comparison_context):
    """Synchronous data gathering with better error handling and caching"""
    cache_key = f"insights_data_{hashlib.md5(str(treatment_data).encode()).hexdigest()}"
    
    # Try to get from cache first
    cached_data = load_from_cache(cache_key)
    if cached_data:
        app.logger.info("Using cached insights data")
        return cached_data
    
    insights_data = {
        'treatments': [],
        'biomarker_details': {},
        'comparative_analysis': {},
        'statistical_summary': {},
        'total_data_points': 0,
        'unique_biomarkers_count': 0,
        'data_completeness': 0.0,
        'processing_notes': []
    }
    
    if not biomarker_service or not es:
        app.logger.warning("Elasticsearch not available, using mock data")
        insights_data = create_enhanced_mock_insights_data(treatment_data)
        save_to_cache(cache_key, insights_data)
        return insights_data
    
    try:
        all_biomarkers = set()
        treatment_scores_summary = []
        
        for treatment_info in treatment_data.get('treatments', []):
            treatment_analysis = process_single_treatment_sync(treatment_info, all_biomarkers)
            insights_data['treatments'].append(treatment_analysis)
            
            # Calculate treatment summary statistics
            if treatment_analysis['biomarker_scores']:
                scores = [data.get('score', 0) for data in treatment_analysis['biomarker_scores'].values()]
                treatment_scores_summary.append({
                    'treatment': treatment_info.get('name'),
                    'avg_score': sum(scores) / len(scores),
                    'max_score': max(scores),
                    'min_score': min(scores),
                    'score_variance': calculate_variance(scores),
                    'biomarker_count': len(scores)
                })
        
        insights_data['unique_biomarkers_count'] = len(all_biomarkers)
        insights_data['statistical_summary'] = generate_statistical_summary(treatment_scores_summary)
        
        # Generate comparative analysis if multiple treatments
        if len(insights_data['treatments']) >= 2:
            insights_data['comparative_analysis'] = generate_enhanced_comparative_analysis(
                insights_data['treatments']
            )
        
        # Calculate data completeness
        insights_data['data_completeness'] = calculate_data_completeness(insights_data)
        
        # Cache the results
        save_to_cache(cache_key, insights_data)
        
        return insights_data
        
    except Exception as e:
        app.logger.error(f"Error gathering insights data: {e}")
        insights_data['processing_notes'].append(f"Error in data gathering: {str(e)}")
        return create_enhanced_mock_insights_data(treatment_data)

def process_single_treatment_sync(treatment_info, all_biomarkers):
    """Process a single treatment and gather its biomarker data (synchronous)"""
    treatment_analysis = {
        'name': treatment_info.get('name', ''),
        'condition': treatment_info.get('condition', ''),
        'biomarkers': [],
        'biomarker_scores': {},
        'detailed_data': [],
        'quality_metrics': {
            'completeness': 0.0,
            'reliability': 0.0,
            'coverage': 0.0
        }
    }
    
    valid_biomarkers = 0
    total_biomarkers = len(treatment_info.get('biomarkers', []))
    total_coverage = 0
    
    for biomarker_info in treatment_info.get('biomarkers', []):
        biomarker_name = biomarker_info.get('name', '').strip()
        if not biomarker_name:
            continue
            
        all_biomarkers.add(biomarker_name)
        
        try:
            # Get biomarker score
            score_data = biomarker_service.calculate_biomarker_score(
                biomarker_name, 
                treatment_info.get('condition', '')
            )
            
            if score_data and score_data.get('success'):
                treatment_analysis['biomarker_scores'][biomarker_name] = score_data
                valid_biomarkers += 1
                total_coverage += score_data.get('biomarker_pdfs', 0) / max(score_data.get('total_pdfs', 1), 1)
                
                # Get sample detailed data for context
                detailed_data = biomarker_service.get_biomarker_data(
                    biomarker_name, 
                    treatment_info.get('condition', ''), 
                    page=1, 
                    size=3  # Limited sample for efficiency
                )
                
                if detailed_data.get('success'):
                    treatment_analysis['detailed_data'].extend(detailed_data.get('data', []))
            
        except Exception as e:
            app.logger.warning(f"Error processing biomarker {biomarker_name}: {e}")
    
    # Calculate quality metrics
    treatment_analysis['quality_metrics']['completeness'] = valid_biomarkers / max(total_biomarkers, 1)
    treatment_analysis['quality_metrics']['coverage'] = total_coverage / max(valid_biomarkers, 1) if valid_biomarkers > 0 else 0
    treatment_analysis['quality_metrics']['reliability'] = min(
        treatment_analysis['quality_metrics']['completeness'],
        treatment_analysis['quality_metrics']['coverage']
    )
    
    return treatment_analysis

def generate_openai_insights_sync(user_query, insights_data, options={}):
    """Synchronous OpenAI insights generation"""
    try:
        # Prepare context
        context = prepare_enhanced_openai_context(insights_data)
        
        # Determine analysis type from query
        analysis_type = determine_analysis_type(user_query)
        
        # Custom system prompt
        system_prompt = get_custom_system_prompt(analysis_type, options)
        
        # Enhanced user prompt
        user_prompt = build_enhanced_user_prompt(user_query, context, insights_data, analysis_type)
        
        # Make OpenAI API call
        response = openai.ChatCompletion.create(
            model=options.get('model', 'gpt-3.5-turbo'),  # Changed to more stable model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=options.get('max_tokens', 1500),
            temperature=options.get('temperature', 0.7)
        )
        
        insights_text = response.choices[0].message.content.strip()
        
        return {
            'success': True,
            'insights': insights_text,
            'tokens_used': response.usage.total_tokens if hasattr(response, 'usage') else 0,
            'model_used': options.get('model', 'gpt-3.5-turbo'),
            'analysis_type': analysis_type
        }
        
    except Exception as e:
        app.logger.error(f"OpenAI API error: {e}")
        # Enhanced fallback
        return generate_enhanced_fallback_insights(user_query, insights_data)

# Helper functions
def calculate_variance(scores):
    """Calculate variance of scores"""
    if len(scores) < 2:
        return 0
    mean = sum(scores) / len(scores)
    return sum((score - mean) ** 2 for score in scores) / len(scores)

def determine_analysis_depth(insights_data):
    """Determine the depth of analysis based on available data"""
    data_points = insights_data.get('total_data_points', 0)
    biomarker_count = insights_data.get('unique_biomarkers_count', 0)
    
    if data_points > 1000 and biomarker_count > 10:
        return 'comprehensive'
    elif data_points > 500 and biomarker_count > 5:
        return 'detailed'
    elif data_points > 100:
        return 'moderate'
    else:
        return 'basic'

def calculate_confidence_score(insights_data):
    """Calculate confidence score based on data quality"""
    completeness = insights_data.get('data_completeness', 0)
    data_points = insights_data.get('total_data_points', 0)
    treatment_count = len(insights_data.get('treatments', []))
    
    # Weighted confidence calculation
    data_weight = min(data_points / 1000, 1.0) * 0.4
    completeness_weight = completeness * 0.4
    treatment_weight = min(treatment_count / 3, 1.0) * 0.2
    
    return min(data_weight + completeness_weight + treatment_weight, 1.0)

def assess_data_quality(insights_data):
    """Assess overall data quality"""
    confidence = calculate_confidence_score(insights_data)
    
    if confidence >= 0.8:
        return 'high'
    elif confidence >= 0.6:
        return 'medium'
    elif confidence >= 0.4:
        return 'low'
    else:
        return 'insufficient'

def determine_analysis_type(query):
    """Determine the type of analysis based on the user query"""
    query_lower = query.lower()
    
    if any(word in query_lower for word in ['compare', 'comparison', 'versus', 'vs', 'difference']):
        return 'comparison'
    elif any(word in query_lower for word in ['recommend', 'suggest', 'best', 'optimal']):
        return 'recommendation'
    elif any(word in query_lower for word in ['mechanism', 'how', 'why', 'pathway']):
        return 'mechanistic'
    elif any(word in query_lower for word in ['safety', 'risk', 'side effect', 'adverse']):
        return 'safety'
    elif any(word in query_lower for word in ['efficacy', 'effectiveness', 'performance']):
        return 'efficacy'
    else:
        return 'general'

def get_custom_system_prompt(analysis_type, options):
    """Get customized system prompt based on analysis type"""
    base_prompt = """You are a senior biomarker research analyst with expertise in dermatology, cosmetics, and clinical research. 
    You help researchers and clinicians understand complex biomarker data and treatment comparisons."""
    
    type_specific = {
        'comparison': "Focus on detailed comparative analysis, highlighting key differences, similarities, and relative advantages.",
        'recommendation': "Provide clear, actionable recommendations based on the data, with rationale and confidence levels.",
        'mechanistic': "Explain the biological mechanisms and pathways involved, connecting biomarkers to physiological processes.",
        'safety': "Emphasize safety considerations, potential risks, and contraindications based on biomarker profiles.",
        'efficacy': "Focus on treatment effectiveness, clinical outcomes, and biomarker performance metrics.",
        'general': "Provide a comprehensive overview addressing multiple aspects of the biomarker data."
    }
    
    formatting_instructions = """
    Structure your response with:
    - **Executive Summary** (2-3 key points)
    - **Detailed Analysis** (evidence-based insights)
    - **Clinical Implications** (practical applications)
    - **Recommendations** (actionable next steps)
    
    Use markdown formatting, include specific data points, and maintain scientific rigor while being accessible.
    """
    
    return f"{base_prompt}\n\n{type_specific.get(analysis_type, type_specific['general'])}\n\n{formatting_instructions}"

def build_enhanced_user_prompt(user_query, context, insights_data, analysis_type):
    """Build enhanced user prompt"""
    return f"""
    Based on the following biomarker comparison data, please analyze and answer this question: "{user_query}"
    
    ## Treatment Data:
    {context.get('treatments_summary', 'No treatment data available')}
    
    ## Biomarker Analysis:
    {context.get('biomarker_summary', 'No biomarker data available')}
    
    ## Data Statistics:
    - Total data points analyzed: {insights_data.get('total_data_points', 0)}
    - Unique biomarkers: {insights_data.get('unique_biomarkers_count', 0)}
    - Treatments compared: {len(insights_data.get('treatments', []))}
    - Data quality: {assess_data_quality(insights_data)}
    
    Please provide a comprehensive analysis that addresses the user's question with specific recommendations and clinical insights.
    """

def prepare_enhanced_openai_context(insights_data):
    """Prepare structured context for OpenAI analysis"""
    context = {
        'treatments_summary': '',
        'biomarker_summary': ''
    }
    
    # Treatments summary
    treatments_list = []
    for treatment in insights_data.get('treatments', []):
        biomarker_count = len(treatment.get('biomarker_scores', {}))
        avg_score = 0
        if treatment.get('biomarker_scores'):
            scores = [data.get('score', 0) for data in treatment['biomarker_scores'].values()]
            avg_score = sum(scores) / len(scores) if scores else 0
        
        treatments_list.append(
            f"- **{treatment.get('name', 'Unknown')}** (Condition: {treatment.get('condition', 'Unknown')}): "
            f"{biomarker_count} biomarkers, Average score: {avg_score:.3f}"
        )
    
    context['treatments_summary'] = '\n'.join(treatments_list)
    
    # Biomarker summary
    biomarker_list = []
    for biomarker, details in insights_data.get('biomarker_details', {}).items():
        condition_count = len(details.get('conditions', {}))
        biomarker_list.append(f"- **{biomarker}**: {condition_count} conditions analyzed")
    
    context['biomarker_summary'] = '\n'.join(biomarker_list[:10])  # Limit to top 10
    
    return context

def generate_enhanced_fallback_insights(user_query, insights_data):
    """Generate enhanced rule-based insights when OpenAI is not available"""
    treatment_count = len(insights_data.get('treatments', []))
    biomarker_count = insights_data.get('unique_biomarkers_count', 0)
    
    insights = f"""# Treatment Analysis Report

## Query: {user_query}

### Overview
Based on the analysis of **{treatment_count} treatments** with **{biomarker_count} unique biomarkers**:

### Key Findings

#### Treatment Performance
"""
    
    # Analyze each treatment
    for i, treatment in enumerate(insights_data.get('treatments', []), 1):
        name = treatment.get('name', f'Treatment {i}')
        condition = treatment.get('condition', 'Unknown')
        biomarker_scores = treatment.get('biomarker_scores', {})
        
        if biomarker_scores:
            scores = [data.get('score', 0) for data in biomarker_scores.values()]
            avg_score = sum(scores) / len(scores)
            max_score = max(scores)
            
            insights += f"""
**{name}** (Condition: {condition})
- Average biomarker score: {avg_score:.2%}
- Highest scoring biomarker: {max_score:.2%}
- Total biomarkers analyzed: {len(biomarker_scores)}
"""
        else:
            insights += f"""
**{name}** (Condition: {condition})
- No biomarker scores available
"""
    
    # Add recommendations based on query keywords
    insights += "\n### Recommendations\n"
    
    query_lower = user_query.lower()
    if any(word in query_lower for word in ['best', 'better', 'optimal', 'recommend']):
        insights += "- Based on the biomarker scores, consider the treatment with the highest average performance\n"
        insights += "- Look for treatments with consistent scores across multiple biomarkers\n"
    
    if any(word in query_lower for word in ['aging', 'anti-aging', 'wrinkle']):
        insights += "- Focus on biomarkers related to collagen synthesis and skin elasticity\n"
        insights += "- Consider treatments targeting inflammation markers like IL-6\n"
    
    insights += f"""
### Data Quality
- Analysis based on {insights_data.get('total_data_points', 0)} data points
- Results generated using rule-based analysis (OpenAI unavailable)
- Data quality: {assess_data_quality(insights_data)}

*Note: For more detailed insights, ensure OpenAI API is properly configured.*
"""
    
    return {
        'success': True,
        'insights': insights,
        'fallback': True
    }

def generate_statistical_summary(treatment_scores_summary):
    """Generate statistical summary"""
    if not treatment_scores_summary:
        return {}
    
    all_scores = [t['avg_score'] for t in treatment_scores_summary]
    return {
        'overall_avg': sum(all_scores) / len(all_scores),
        'best_treatment': max(treatment_scores_summary, key=lambda x: x['avg_score'])['treatment'],
        'score_range': {
            'min': min(all_scores),
            'max': max(all_scores)
        }
    }

def generate_enhanced_comparative_analysis(treatments):
    """Generate enhanced comparative analysis between treatments"""
    analysis = {
        'treatment_count': len(treatments),
        'biomarker_overlap': {},
        'score_comparisons': {}
    }
    
    # Simple biomarker overlap analysis
    treatment_biomarkers = {}
    for treatment in treatments:
        name = treatment['name']
        treatment_biomarkers[name] = set(treatment['biomarker_scores'].keys())
    
    # Calculate pairwise comparisons
    treatment_names = list(treatment_biomarkers.keys())
    for i, t1 in enumerate(treatment_names):
        for j, t2 in enumerate(treatment_names[i+1:], i+1):
            overlap = treatment_biomarkers[t1].intersection(treatment_biomarkers[t2])
            
            analysis['biomarker_overlap'][f"{t1}_vs_{t2}"] = {
                'common_biomarkers': list(overlap),
                'count': len(overlap),
                't1_unique': list(treatment_biomarkers[t1] - treatment_biomarkers[t2]),
                't2_unique': list(treatment_biomarkers[t2] - treatment_biomarkers[t1])
            }
    
    return analysis

def calculate_data_completeness(insights_data):
    """Calculate data completeness score"""
    total_treatments = len(insights_data.get('treatments', []))
    if total_treatments == 0:
        return 0.0
    
    complete_treatments = 0
    for treatment in insights_data.get('treatments', []):
        if treatment.get('biomarker_scores') and len(treatment['biomarker_scores']) > 0:
            complete_treatments += 1
    
    return complete_treatments / total_treatments

def create_enhanced_mock_insights_data(treatment_data):
    """Create enhanced mock data when Elasticsearch is not available"""
    return {
        'treatments': treatment_data.get('treatments', []),
        'biomarker_details': {},
        'comparative_analysis': {
            'summary': 'Limited analysis available - using mock data'
        },
        'statistical_summary': {},
        'total_data_points': 100,
        'unique_biomarkers_count': len(set(
            biomarker.get('name', '') 
            for treatment in treatment_data.get('treatments', [])
            for biomarker in treatment.get('biomarkers', [])
            if biomarker.get('name', '').strip()
        )),
        'data_completeness': 0.5,
        'processing_notes': ['Using mock data - Elasticsearch not available']
    }

def generate_follow_up_suggestions(user_query, insights_data):
    """Generate follow-up question suggestions"""
    suggestions = [
        "How can I improve the biomarker performance?",
        "What are the potential side effects of these treatments?",
        "Which biomarkers are most reliable for this condition?",
        "How do these results compare to industry standards?"
    ]
    
    # Add context-specific suggestions based on data
    if insights_data.get('unique_biomarkers_count', 0) > 5:
        suggestions.append("Which biomarkers show the strongest correlation?")
    
    if len(insights_data.get('treatments', [])) > 2:
        suggestions.append("What combination therapy would you recommend?")
    
    return suggestions[:4]  # Return top 4 suggestions

@app.route('/api/insights/export', methods=['POST'])
def export_insights():
    """Export insights to various formats"""
    try:
        data = request.get_json()
        insights_text = data.get('insights', '')
        format_type = data.get('format', 'json')
        metadata = data.get('metadata', {})
        
        if format_type == 'json':
            export_data = {
                'insights': insights_text,
                'metadata': metadata,
                'export_timestamp': datetime.now().isoformat(),
                'version': '2.0'
            }
            
            return jsonify({
                'success': True,
                'data': export_data,
                'filename': f"biomarker_insights_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            })
        
        elif format_type == 'txt':
            formatted_text = f"""Biomarker Analysis Insights
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Query: {metadata.get('query', 'N/A')}

{insights_text}

---
Analysis Details:
- Treatments analyzed: {metadata.get('treatments_analyzed', 'N/A')}
- Biomarkers analyzed: {metadata.get('biomarkers_analyzed', 'N/A')}
- Data points: {metadata.get('data_points', 'N/A')}
"""
            
            return jsonify({
                'success': True,
                'data': formatted_text,
                'filename': f"biomarker_insights_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            })
        
        else:
            return jsonify({
                'success': False,
                'error': 'Unsupported export format'
            }), 400
            
    except Exception as e:
        app.logger.error(f"Error exporting insights: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Add these functions to your app.py for biomarker normalization

def normalize_biomarker_name(biomarker_name):
    """
    Normalize biomarker names to handle case sensitivity and whitespace
    """
    if not biomarker_name or not isinstance(biomarker_name, str):
        return ""
    
    # Remove leading/trailing whitespace and convert to title case
    normalized = biomarker_name.strip()
    
    # Handle common variations
    biomarker_mappings = {
        'il-6': 'IL-6',
        'il6': 'IL-6',
        'interleukin-6': 'IL-6',
        'interleukin 6': 'IL-6',
        'tnf-α': 'TNF-α',
        'tnf-alpha': 'TNF-α',
        'tnfa': 'TNF-α',
        'tumor necrosis factor alpha': 'TNF-α',
        'mcp-1': 'MCP-1',
        'mcp1': 'MCP-1',
        'vegf': 'VEGF',
        'vascular endothelial growth factor': 'VEGF',
        'tgf-β': 'TGF-β',
        'tgf-beta': 'TGF-β',
        'tgfb': 'TGF-β',
        'transforming growth factor beta': 'TGF-β',
        'hyaluronic acid': 'Hyaluronic Acid',
        'ha': 'Hyaluronic Acid',
        'collagen': 'Collagen',
        'collagen i': 'Collagen I',
        'collagen 1': 'Collagen I',
        'elastin': 'Elastin',
        'melanin': 'Melanin',
        'tyrosinase': 'Tyrosinase'
    }
    
    # Check for exact matches (case-insensitive)
    normalized_lower = normalized.lower()
    if normalized_lower in biomarker_mappings:
        return biomarker_mappings[normalized_lower]
    
    # Return the trimmed version with proper capitalization
    return normalized

def get_biomarker_variations(biomarker_name):
    """
    Get all possible variations of a biomarker name for searching
    """
    if not biomarker_name:
        return []
    
    variations = set()
    normalized = normalize_biomarker_name(biomarker_name)
    
    # Add the normalized version
    variations.add(normalized)
    
    # Add original
    variations.add(biomarker_name.strip())
    
    # Add lowercase version
    variations.add(normalized.lower())
    
    # Add uppercase version
    variations.add(normalized.upper())
    
    # Add variations with different spacing/hyphens
    if '-' in normalized:
        variations.add(normalized.replace('-', ' '))
        variations.add(normalized.replace('-', ''))
    
    if ' ' in normalized:
        variations.add(normalized.replace(' ', '-'))
        variations.add(normalized.replace(' ', ''))
    
    return list(variations)

# Enhanced biomarker service with normalization
class EnhancedBiomarkerService(BiomarkerService):
    def __init__(self, es_client):
        super().__init__(es_client)
        self._biomarker_cache = {}
        self._normalized_mapping = {}
    
    def get_all_biomarkers(self):
        """Get all unique biomarker names with normalization"""
        result = super().get_all_biomarkers()
        
        if result.get('success') and result.get('biomarkers'):
            # Normalize and deduplicate biomarkers
            normalized_biomarkers = {}
            
            for biomarker in result['biomarkers']:
                normalized = normalize_biomarker_name(biomarker)
                if normalized and normalized not in normalized_biomarkers:
                    normalized_biomarkers[normalized] = biomarker
                    # Store mapping for reverse lookup
                    self._normalized_mapping[biomarker.lower().strip()] = normalized
            
            result['biomarkers'] = sorted(normalized_biomarkers.keys())
            result['original_count'] = len(result.get('biomarkers', []))
            result['normalized_count'] = len(normalized_biomarkers)
            
        return result
    
    def calculate_biomarker_score(self, biomarker_name, condition):
        """Calculate score with biomarker normalization"""
        normalized_biomarker = normalize_biomarker_name(biomarker_name)
        
        # Try with normalized name first
        try:
            result = super().calculate_biomarker_score(normalized_biomarker, condition)
            if result.get('success'):
                result['normalized_biomarker'] = normalized_biomarker
                result['original_biomarker'] = biomarker_name
                return result
        except Exception as e:
            app.logger.warning(f"Failed with normalized name {normalized_biomarker}: {e}")
        
        # Try with original name as fallback
        try:
            result = super().calculate_biomarker_score(biomarker_name, condition)
            if result.get('success'):
                result['normalized_biomarker'] = normalized_biomarker
                result['original_biomarker'] = biomarker_name
                return result
        except Exception as e:
            app.logger.warning(f"Failed with original name {biomarker_name}: {e}")
        
        # Try with variations
        variations = get_biomarker_variations(biomarker_name)
        for variation in variations:
            try:
                result = super().calculate_biomarker_score(variation, condition)
                if result.get('success'):
                    result['normalized_biomarker'] = normalized_biomarker
                    result['original_biomarker'] = biomarker_name
                    result['matched_variation'] = variation
                    return result
            except Exception:
                continue
        
        # Return error if no variation works
        return {
            'success': False,
            'error': f'Biomarker not found: {biomarker_name}',
            'normalized_biomarker': normalized_biomarker,
            'original_biomarker': biomarker_name,
            'tried_variations': variations
        }
    
    def search_biomarkers(self, query, condition=None, limit=50):
        """Enhanced search with normalization"""
        normalized_query = normalize_biomarker_name(query)
        query_variations = get_biomarker_variations(query)
        
        # Try with original query first
        result = super().search_biomarkers(query, condition, limit)
        
        # If no results, try with normalized query
        if result.get('success') and result.get('total_hits', 0) == 0:
            for variation in query_variations:
                if variation != query:
                    variation_result = super().search_biomarkers(variation, condition, limit)
                    if variation_result.get('success') and variation_result.get('total_hits', 0) > 0:
                        variation_result['search_variation_used'] = variation
                        variation_result['original_query'] = query
                        return variation_result
        
        return result

# Update the biomarker service initialization
if es:
    biomarker_service = EnhancedBiomarkerService(es)
else:
    biomarker_service = None

# Enhanced route for biomarker suggestions
@app.route('/api/biomarkers/suggestions', methods=['GET'])
def get_biomarker_suggestions():
    """Get biomarker suggestions with smart filtering"""
    query = request.args.get('q', '').strip()
    limit = int(request.args.get('limit', 20))
    
    try:
        if not biomarker_service:
            # Fallback suggestions
            fallback_biomarkers = [
                'IL-6', 'MCP-1', 'Angiogenin', 'IL-8', 'Osteoprotegerin', 'HGF', 
                'TIMP-1', 'IGFBP-2', 'TIMP-2', 'TNF-α', 'Collagen I', 'Elastin', 
                'Hyaluronic Acid', 'Melanin', 'Tyrosinase', 'Filaggrin', 'VEGF',
                'TGF-β', 'MMP-1', 'MMP-3', 'Ceramides', 'Squalene'
            ]
            
            if query:
                filtered = [b for b in fallback_biomarkers 
                          if query.lower() in b.lower()]
                return jsonify({
                    'success': True,
                    'suggestions': filtered[:limit],
                    'fallback': True
                })
            
            return jsonify({
                'success': True,
                'suggestions': fallback_biomarkers[:limit],
                'fallback': True
            })
        
        # Get all biomarkers
        biomarkers_result = biomarker_service.get_all_biomarkers()
        
        if not biomarkers_result.get('success'):
            return jsonify({
                'success': False,
                'error': 'Failed to fetch biomarkers'
            }), 500
        
        biomarkers = biomarkers_result.get('biomarkers', [])
        
        if query:
            # Normalize query for matching
            normalized_query = query.lower().strip()
            
            # Smart filtering with scoring
            suggestions = []
            for biomarker in biomarkers:
                normalized_biomarker = biomarker.lower()
                score = 0
                
                # Exact match (highest score)
                if normalized_biomarker == normalized_query:
                    score = 100
                # Starts with query
                elif normalized_biomarker.startswith(normalized_query):
                    score = 80
                # Contains query
                elif normalized_query in normalized_biomarker:
                    score = 60
                # Fuzzy match (simple)
                elif any(word in normalized_biomarker for word in normalized_query.split()):
                    score = 40
                
                if score > 0:
                    suggestions.append({
                        'biomarker': biomarker,
                        'score': score
                    })
            
            # Sort by score and return
            suggestions.sort(key=lambda x: (-x['score'], x['biomarker']))
            filtered_biomarkers = [s['biomarker'] for s in suggestions[:limit]]
            
            return jsonify({
                'success': True,
                'suggestions': filtered_biomarkers,
                'total_matches': len(suggestions),
                'query': query
            })
        
        return jsonify({
            'success': True,
            'suggestions': biomarkers[:limit],
            'total_available': len(biomarkers)
        })
        
    except Exception as e:
        app.logger.error(f"Error getting biomarker suggestions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Enhanced route for biomarker validation
@app.route('/api/biomarkers/validate', methods=['POST'])
def validate_biomarker():
    """Validate and normalize a biomarker name"""
    try:
        data = request.get_json()
        biomarker_name = data.get('biomarker_name', '').strip()
        
        if not biomarker_name:
            return jsonify({
                'success': False,
                'error': 'Biomarker name is required'
            }), 400
        
        # Normalize the biomarker name
        normalized = normalize_biomarker_name(biomarker_name)
        variations = get_biomarker_variations(biomarker_name)
        
        # Check if it exists in our database
        valid = False
        suggestion = None
        
        if biomarker_service:
            biomarkers_result = biomarker_service.get_all_biomarkers()
            if biomarkers_result.get('success'):
                available_biomarkers = biomarkers_result.get('biomarkers', [])
                available_lower = [b.lower() for b in available_biomarkers]
                
                # Check if normalized version exists
                if normalized.lower() in available_lower:
                    valid = True
                    suggestion = normalized
                else:
                    # Find closest match
                    for biomarker in available_biomarkers:
                        if biomarker.lower() in [v.lower() for v in variations]:
                            valid = True
                            suggestion = biomarker
                            break
        
        return jsonify({
            'success': True,
            'original': biomarker_name,
            'normalized': normalized,
            'variations': variations,
            'valid': valid,
            'suggestion': suggestion
        })
        
    except Exception as e:
        app.logger.error(f"Error validating biomarker: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500




if __name__ == "__main__":
    print("Starting Flask application...")
    print(f"Elasticsearch endpoint: {ES_ENDPOINT}")
    print(f"API Key configured: {'Yes' if ES_API_KEY else 'No'}")
    app.run(debug=True, host='0.0.0.0', port=5000)
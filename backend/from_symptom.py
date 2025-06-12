

import json
from elasticsearch import Elasticsearch
from collections import defaultdict
from dotenv import load_dotenv
import os
import pandas as pd

load_dotenv()

# Initialize the Elasticsearch client
es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)  # Update with your Elasticsearch instance details

es_index = "trial_predict_dataset"  # Define the Elasticsearch index globally

def process_symptom_landscape(symptom_name):
    # Elasticsearch query to filter by symptom
    query = {
        "query": {
            "match": {
                "unique_symptom": symptom_name.lower()
            }
        }
    }

    # Fetch data from Elasticsearch
    response = es.search(index=es_index, body=query, size=10000)  # Adjust size as needed
    hits = response['hits']['hits']

    if not hits:
        return {"error": f"No data found for symptom: {symptom_name}"}

    # Columns in the new file structure (assumed to be similar to the Excel columns)
    symptom_col = "unique_symptom"
    classification_col = "Classification"  # Classifier column: "promoter" or "inhibitor"
    biomarker_col = "targetName"  # Single column for biomarkers
    value_col = "Score"  # Column for the biomarker value
    disease_col = "MappedDisease"  # Add the disease column to map diseases

    # Structure: biomarker -> disease -> {inhibitor, promoter} values
    data = defaultdict(lambda: defaultdict(lambda: {'inhibitor': [], 'promoter': []}))

    # Process hits from Elasticsearch
    for hit in hits:
        source = hit["_source"]
        symptom = source.get(symptom_col, "").lower()
        biomarker = source.get(biomarker_col, "")
        classification = source.get(classification_col, "")
        disease = source.get(disease_col, "")

        if not symptom or pd.isna(biomarker) or pd.isna(classification) or pd.isna(disease):
            continue

        # Add values to respective classification lists
        if classification.lower() == 'inhibitor':
            data[biomarker][disease]['inhibitor'].append(source.get(value_col, 0))
        elif classification.lower() == 'promoter':
            data[biomarker][disease]['promoter'].append(source.get(value_col, 0))

    # Prepare final output in dictionary format
    output = {}

    for biomarker, diseases in data.items():
        output[biomarker] = {}
        for disease, vals in diseases.items():
            inhibitor_vals = vals['inhibitor']
            promoter_vals = vals['promoter']

            avg_inhibitor = sum(inhibitor_vals) / len(inhibitor_vals) if inhibitor_vals else 0
            avg_promoter = sum(promoter_vals) / len(promoter_vals) if promoter_vals else 0
            total_avg = avg_inhibitor + avg_promoter

            # Only include non-zero values in the output
            if total_avg > 0:
                percent_inhibitor = (avg_inhibitor / total_avg) * 100 if total_avg != 0 else 0
                percent_promoter = (avg_promoter / total_avg) * 100 if total_avg != 0 else 0

                output[biomarker][disease] = {
                    "percent_inhibitor": round(percent_inhibitor, 3),
                    "avg_inhibitor": round(avg_inhibitor, 6),
                    "avg_promoter": round(avg_promoter, 6),
                    "percent_promoter": round(percent_promoter, 3),
                    "total_avg": round(total_avg, 6)
                }

    return output

# Function to extract top 5 biomarkers for a specific disease
def get_top_biomarkers_for_disease(disease_name, symptom_data, top_n=5):
    if not symptom_data:
        return {"error": "Symptom data is missing."}

    # Filter the disease data for the specific symptom
    filtered_data = {biomarker: symptoms for biomarker, symptoms in symptom_data.items() if disease_name in symptoms}

    if not filtered_data:
        return {"Biomarkers": [], "Scores": []}

    # Calculate average score for each biomarker for the given disease
    averages = {}
    for biomarker, diseases in filtered_data.items():
        if disease_name in diseases:
            disease_data = diseases[disease_name]
            avg_score = disease_data.get('total_avg', 0)
            averages[biomarker] = avg_score

    # Sort biomarkers by their average score and return the top_n
    sorted_biomarkers = sorted(averages.items(), key=lambda x: x[1], reverse=True)[:top_n]

    biomarkers, scores = zip(*sorted_biomarkers) if sorted_biomarkers else ([], [])
    return {"Biomarkers": list(biomarkers), "Scores": list(scores)}


def process_symptom_data(symptom_name):
    # Elasticsearch query to filter by symptom
    query = {
        "query": {
            "match": {
                "unique_symptom": symptom_name.lower()
            }
        }
    }
    
    # Fetch data from Elasticsearch
    response = es.search(index=es_index, body=query, size=1000)  # Adjust the index and size as needed
    hits = response['hits']['hits']
    
    if not hits:
        return {"error": f"No data found for symptom: {symptom_name}"}
    
    # Initialize result structures
    biomarker_names = []
    inhibitor_avg = defaultdict(lambda: defaultdict(float))  # biomarker -> disease -> avg score
    promoter_avg = defaultdict(lambda: defaultdict(float))   # biomarker -> disease -> avg score
    inhibitor_count = defaultdict(lambda: defaultdict(int))   # biomarker -> disease -> count
    promoter_count = defaultdict(lambda: defaultdict(int))    # biomarker -> disease -> count
    
    # Iterate over the Elasticsearch results and process the data
    for hit in hits:
        source = hit["_source"]
        
        biomarker = source.get("targetName")
        classification = source.get("Classification")
        score = source.get("Score")
        disease = source.get("MappedDisease")
        
        # Ensure the data is valid
        if pd.isna(biomarker) or pd.isna(classification) or pd.isna(score) or pd.isna(disease):
            continue
        
        # Add biomarker to list if not already added
        if biomarker not in biomarker_names:
            biomarker_names.append(biomarker)
        
        # Bucket the score based on classification (inhibitor or promoter)
        if classification.lower() == 'inhibitor':
            inhibitor_avg[biomarker][disease] += score
            inhibitor_count[biomarker][disease] += 1
        elif classification.lower() == 'promoter':
            promoter_avg[biomarker][disease] += score
            promoter_count[biomarker][disease] += 1
    
    # Calculate the average scores for inhibitor and promoter
    for biomarker in biomarker_names:
        for disease in inhibitor_avg[biomarker]:
            if inhibitor_count[biomarker][disease] > 0:
                inhibitor_avg[biomarker][disease] /= inhibitor_count[biomarker][disease]
        
        for disease in promoter_avg[biomarker]:
            if promoter_count[biomarker][disease] > 0:
                promoter_avg[biomarker][disease] /= promoter_count[biomarker][disease]
    
    # Return the results
    return biomarker_names, inhibitor_avg, promoter_avg


if __name__ == "__main__":
    # Example Usage:
    symptom_name = "Anxiety"

    # Step 1: Process the data for the symptom and get the output in dictionary format
    symptom_data = process_symptom_landscape(symptom_name)

    # Step 2: Get top 5 biomarkers for a disease (e.g., "Alopecia areata")
    disease_name = "Alopecia areata"
    top_biomarkers = get_top_biomarkers_for_disease(disease_name, symptom_data)
    
    symptom_data_best = process_symptom_data(symptom_name)

    # Step 3: Display the results
    if "error" not in symptom_data:
        print(f"Processed data for {symptom_name}:")
        # print(json.dumps(symptom_data, indent=4))
        
        if top_biomarkers["Biomarkers"]:
            print(f"\nTop 5 biomarkers for {disease_name}:")
            for biomarker, score in zip(top_biomarkers["Biomarkers"], top_biomarkers["Scores"]):
                print(f"{biomarker}: {score}")
        else:
            print(f"No biomarkers found for disease: {disease_name}")
    else:
        print(symptom_data["error"])

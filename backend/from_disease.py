from elasticsearch import Elasticsearch
import json
from collections import defaultdict

from openai import AzureOpenAI
from dotenv import load_dotenv
from elasticsearch import Elasticsearch, helpers

import os
load_dotenv()
import pandas as pd

# Initialize the Elasticsearch client
es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
) # Update with your Elasticsearch instance details


es_index = "trial_predict_dataset"

def process_disease_landscape(disease_name):
    # Logic to process the disease data
    query = {
        "query": {
            "match": {
                "MappedDisease": disease_name
            }
        }
    }

    # Perform search (Assume Elasticsearch connection is already made externally)
    response = es.search(index=es_index, body=query, size=10000)

    if not response['hits']['hits']:
        return {"error": f"No data found for disease: {disease_name}"}

    # Columns in the new file structure
    symptom_col = "unique_symptom"
    classification_col = "Classification"  # Classifier column: "promoter" or "inhibitor"
    biomarker_col = "targetName"  # Single column for biomarkers
    value_col = "Score"  # Column for the biomarker value

    # Structure: biomarker -> symptom -> {inhibitor, promoter} values
    data = defaultdict(lambda: defaultdict(lambda: {'inhibitor': [], 'promoter': []}))

    # Iterate through the Elasticsearch hits and populate the data structure
    for hit in response['hits']['hits']:
        source = hit["_source"]
        symptom = source.get(symptom_col)
        biomarker = source.get(biomarker_col)
        classification = source.get(classification_col)
        score = source.get(value_col)

        if not symptom or not biomarker or not classification or score is None:
            continue

        # Add values to respective classification lists
        if classification.lower() == 'inhibitor':
            data[biomarker][symptom]['inhibitor'].append(score)
        elif classification.lower() == 'promoter':
            data[biomarker][symptom]['promoter'].append(score)

    # Prepare final JSON output
    output = {}
    for biomarker, symptoms in data.items():
        output[biomarker] = {}
        for symptom, vals in symptoms.items():
            inhibitor_vals = vals['inhibitor']
            promoter_vals = vals['promoter']

            avg_inhibitor = sum(inhibitor_vals) / len(inhibitor_vals) if inhibitor_vals else 0
            avg_promoter = sum(promoter_vals) / len(promoter_vals) if promoter_vals else 0
            total_avg = avg_inhibitor + avg_promoter

            if total_avg == 0:
                percent_inhibitor = 0
                percent_promoter = 0
            else:
                percent_inhibitor = (avg_inhibitor / total_avg) * 100
                percent_promoter = (avg_promoter / total_avg) * 100

            output[biomarker][symptom] = {
                "percent_inhibitor": round(percent_inhibitor, 3),
                "avg_inhibitor": round(avg_inhibitor, 6),
                "avg_promoter": round(avg_promoter, 6),
                "percent_promoter": round(percent_promoter, 3),
                "total_avg": round(total_avg, 6)
            }

    return output


def get_top_biomarkers(disease_data: dict,
                                  symptom_name: str,
                                  top_n: int = 5):
    # disease_data comes straight from load_from_cache(disease)
    filtered = {
        bm: syms
        for bm, syms in disease_data.items()
        if symptom_name in syms
    }
    if not filtered:
        return {"Biomarkers": [], "Scores": []}

    # grab total_avg under that symptom
    averages = {
        bm: syms[symptom_name]["total_avg"]
        for bm, syms in filtered.items()
    }

    # pick top_n
    top = sorted(averages.items(), key=lambda x: x[1], reverse=True)[:top_n]
    biomarkers, scores = zip(*top) if top else ([], [])
    return {"Biomarkers": list(biomarkers), "Scores": list(scores)}


if __name__ == "__main__":
    
# Call the function with disease name
    disease_name = 'Eczema'  # Replace with the desired disease name

    # Process the disease data
    disease_data = process_disease_landscape(disease_name)

    if "error" in disease_data:
        print(disease_data["error"])
    else:
        # Write output to JSON file
        output_file = f"{disease_name}_output_data.json"
        with open(output_file, 'w') as json_file:
            json.dump(disease_data, json_file, indent=4)

        print(f"Data has been written to {output_file}")

    # Get top biomarkers for a symptom
    symptom_name = 'Bumps'  # Replace with the symptom you're interested in
    top_n = 5  # For example, get the top 5 biomarkers

    top_biomarkers = get_top_biomarkers(disease_name, symptom_name, top_n)
    print(top_biomarkers)  # This will print the top biomarkers and their scores for the given symptom

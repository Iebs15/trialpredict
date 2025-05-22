import pandas as pd
from openai import AzureOpenAI
import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from elasticsearch import NotFoundError
import time
from tqdm import tqdm  # For progress bar
 
# Load environment variables
load_dotenv()

# Elasticsearch Client setup
es = Elasticsearch(
    os.getenv('elasticsearchendpoint'),
    api_key=os.getenv('elasticapikey')
)

 
INDEX_NAME = "op_123456"
 
def search_disease_info(disease_name):
    query = {
        "query": {
            "bool": {
                "should": [
                    {"match": {"Disease_name": disease_name}},
                    {"match": {"synonyms": disease_name}}
                ]
            }
        }
    }
 
    try:
        response = es.search(index=INDEX_NAME, body=query, size=5)
    except NotFoundError:
        return f"Index '{INDEX_NAME}' not found."
    except Exception as e:
        return f"Error during search: {e}"
 
    if response['hits']['total']['value'] == 0:
        return f"No records found for disease: {disease_name}"
 
    results = []
    for hit in response['hits']['hits']:
        source = hit['_source']
        pk_info = {
            "absorption": source.get("rd_absorption"),
            "metabolism": source.get("rd_metabolism"),
            "route_of_elimination": source.get("rd_route-of-elimination"),
            "toxicity": source.get("rd_toxicity"),
        }
 
        pd_info = {
            "pharmacodynamics": source.get("rd_pharmacodynamics"),
            "mechanism_of_action": source.get("mechanismOfAction") or source.get("rd_mechanism-of-action"),
        }
 
        biomarkers = {
            "linked_targets": source.get("linkedTargets"),
            "target_class": source.get("targetClass"),
            "approved_symbol": source.get("approvedSymbol"),
            "approved_name": source.get("approvedName"),
        }
 
        description = source.get("description") or source.get("rd_description")
 
        results.append({
            "Disease_name": source.get("Disease_name"),
            "Description": description,
            "Pharmacokinetics": pk_info,
            "Pharmacodynamics": pd_info,
            "Biomarkers": biomarkers
        })
 
    return results
 
if __name__ == "__main__":
    disease = input("Enter the dermatology disease name: ").strip()
    info = search_disease_info(disease)
    if isinstance(info, str):
        print(info)
    else:
        for idx, record in enumerate(info, 1):
            print(f"\nRecord {idx}:")
            print(f"Disease: {record['Disease_name']}")
            print(f"Description: {record['Description']}\n")
 
            print("Pharmacokinetics:")
            for k, v in record['Pharmacokinetics'].items():
                print(f"  {k.replace('_', ' ').capitalize()}: {v}")
 
            print("\nPharmacodynamics:")
            for k, v in record['Pharmacodynamics'].items():
                print(f"  {k.replace('_', ' ').capitalize()}: {v}")
 
            print("\nAssociated Biomarkers:")
            for k, v in record['Biomarkers'].items():
                print(f"  {k.replace('_', ' ').capitalize()}: {v}")
            print("-" * 50)
 
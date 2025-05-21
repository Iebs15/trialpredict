import pandas as pd
import json

def generate_biomarker_association_matrix_by_name(df, disease_name):
    # Filter data for the selected disease name (case-insensitive, partial match)
    df_filtered = df[df['Disease_name'].str.contains(disease_name, case=False, na=False)]
    
    if df_filtered.empty:
        return {
            "diseaseId": "",
            "diseaseName": disease_name,
            "targets": []
        }

    # Use first diseaseId and exact disease name found in filtered data
    disease_id = df_filtered['diseaseId'].iloc[0]
    exact_disease_name = df_filtered['Disease_name'].iloc[0]

    result = {
        "diseaseId": disease_id,
        "diseaseName": exact_disease_name,
        "targets": []
    }

    grouped = df_filtered.groupby(['targetId', 'approvedSymbol', 'targetName'])

    for (targetId, approvedSymbol, targetName), group in grouped:
        # Aggregate scores and evidence counts by datasourceId
        datasource_scores_raw = group.groupby('datasourceId').agg({
            'score': 'sum',
            'evidenceCount': 'sum'
        }).to_dict(orient='index')

        datasource_scores = {
            k: round(v['score'], 4) for k, v in datasource_scores_raw.items()
        }

        target_entry = {
            "targetId": targetId,
            "targetName": targetName,
            "approvedSymbol": approvedSymbol,
            "score": round(group['score'].sum(), 4),
            "evidenceCount": int(group['evidenceCount'].sum()),
            "datasourceScores": datasource_scores
        }

        result["targets"].append(target_entry)

    return result

def main():
    # Load the dataset
    file_path = r"C:\Users\nirmiti.deshmukh\trialpredict\backend\Open_target_data.xlsx"  # Replace with your actual CSV file path
    df = pd.read_excel(file_path)

    # Prompt user for disease name
    disease_name = input("Enter the disease name: ")

    # Generate biomarker association matrix
    matrix = generate_biomarker_association_matrix_by_name(df, disease_name)

    # Print the result as formatted JSON
    print(json.dumps(matrix, indent=2))

if __name__ == "__main__":
    main()

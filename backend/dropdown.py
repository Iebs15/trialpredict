import pandas as pd
from openai import AzureOpenAI
import os
from dotenv import load_dotenv
import time
from tqdm import tqdm  # For progress bar
 
# Load environment variables
load_dotenv()
 
# Azure OpenAI Configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
 
MODEL = "gpt-4o-mini"
 
# Load dataset
try:
    df = pd.read_excel("Clinical_trails_SkinData_only.xlsx", engine='openpyxl')
except Exception:
    df = pd.read_csv("Clinical_trails_SkinData_only.xlsx", encoding='ISO-8859-1')
 
 
 
# def generate_user_prompt(row):
#     return f"""You are a biomedical expert evaluating the success potential of preclinical studies.
 
# The following information is available:
# - **Study Title**: {row['Title']}
# - **Abstract**: {row['Abstract']}
# - **Claim**: {row['Claim']}
# - **Drug Name**: {row['prefName']}
# - **Target Name**: {row['targetName']}
 
# Based on the abstract and claim, estimate the **probability (0-100%)** that the drug **{row['prefName']}** targeting **{row['targetName']}** has **successfully passed preclinical trials**.
 
# Also, provide a **valid scientific justification** referencing the abstract or claim."""
 
# # System message
# SYSTEM_PROMPT = """You are a biomedical AI assistant tasked with evaluating preclinical study data. For each study, you will be given:
# - **Study Title**: The title of the preclinical study.
# - **Abstract**: A summary of the study's background, methods, and findings.
# - **Claim**: The specific claim made by the study.
# - **Drug Name (prefName)**: The name of the drug being tested.
# - **Target Name (targetName)**: The biological target of the drug.
 
# Your task is to:
# 1. **Estimate the likelihood (in percentage)** that the drug **{row['prefName']}** targeting **{row['targetName']}** has **successfully passed preclinical trials** based on the provided information.
# 2. **Provide a scientific justification** for your answer. This justification must be directly supported by details in the **abstract** and **claim**.
 
# **STRICT STRUCTURE GUIDELINES**:
# - The output should be in **two distinct parts**:
#   1. **Probability**: A percentage value from **0 to 100%** (for example, 85%).
#   2. **Justification**: A scientific explanation that **does not mention the probability value** in any way. The justification must be based solely on the data provided in the abstract and claim. You must **NOT** mention the estimated probability value anywhere in the justification section. It should be a purely scientific explanation based on the abstract and claim, addressing why the study is likely to pass preclinical trials or not.
#   3. **DONT EVEN TRY TO MENTION PROBABILITY IN THE JUSTFICATION SECTION**
# - **Do not deviate** from this structure. Ensure that the **Probability** and **Justification** sections are clearly separated and correctly formatted. The response should **never mix the two**.
 
# **SAMPLE OUTPUT**
# **Probability**: 1%
# **Justification**: The study presents an innovative automatic infusion system designed for blood glucose monitoring and intensive insulin therapy in critically ill adult patients. The findings suggest that this system effectively maintains normoglycemia, thereby reducing mortality and morbidity in intensive care settings. The development of a model-based predictive controller that adapts insulin delivery based on real-time patient data is particularly noteworthy. The claim emphasizes the capability of the system to predict the glycemic response and adjust insulin administration accordingly, indicating a sophisticated approach to
# managing patients with varying insulin needs. Furthermore, the emphasis on minimizing deviations from normoglycemia, while preventing potential complications such as hypoglycemia, supports the system's potential relevance in clinical settings. The comprehensive testing of the apparatus's functionality in a critical care environment indicates a strong likelihood of successful preclinical outcomes, especially considering its alignment with established therapeutic goals in managing insulin regulation.
 
# This format is mandatory, and responses that deviate from this structure will be considered invalid."""
 
# def get_prediction(prompt, drug_name, target_name):
#     try:
#         response = client.chat.completions.create(
#             model=MODEL,
#             messages=[{"role": "system", "content": SYSTEM_PROMPT},
#                       {"role": "user", "content": prompt}]
#         )
#         content = response.choices[0].message.content.strip()
 
#         # Extract probability (number value) from response
#         import re
#         match = re.search(r"(\d{1,3})\s*%?", content)
#         probability = match.group(1) if match else "N/A"
 
#         # Ensure no reference to probability in the justification part
#         justification = content.replace(f"**Probability**: {probability}%", "").strip()
#         justification = justification.replace("**Justification**:", "").strip()
 
#         return drug_name, target_name, probability, justification
#     except Exception as e:
#         return drug_name, target_name, "ERROR", str(e)
 
 
 
# Preprocessing
df['Disease Name'] = df['Disease Name'].fillna('').astype(str)
df['targetName'] = df['targetName'].fillna('').astype(str)
df['Publication_Date'] = pd.to_datetime(df['Publication_Date'], errors='coerce')
df['pgpub_id'] = df['pgpub_id'].fillna(df['Display_Key'])

def get_preclinical_study_results_by_disease_and_target(disease_input, target_input):
    # Filter by disease and target
    filtered_df = df[
        (df['Disease Name'].str.lower() == disease_input.lower()) &
        (df['targetName'].str.lower() == target_input.lower())
    ]

    if filtered_df.empty:
        return {"error": "No matching records found for the selected disease and target."}

    # Sort by Publication_Date DESC, then pgpub_id DESC (lexical)
    filtered_df = filtered_df.sort_values(
        by=['Publication_Date', 'pgpub_id'],
        ascending=[False, False]
    )

    for idx, row in filtered_df.iterrows():
        result = {
            "drug_name": row['prefName'],
            "target_name": row['targetName'],
            "disease": row['Disease Name'],
            "title": row['Title'],
            "assignee_name": row['Assignee_Applicant'],
            "pg_pubid": row['pgpub_id'],
            "inventor": row['Inventor'],
            "publication_date": row['Publication_Date'].date() if pd.notna(row['Publication_Date']) else None,
            "justification": row['justification'],
            "biomarker_association": row['Disease_Target_Explanation'],
            "Source": row['url']
        }

        yield result

if __name__ == "__main__":
    # Show diseases
    diseases = sorted(df['Disease Name'].unique())
    print("\nAvailable Diseases:")
    for idx, disease in enumerate(diseases):
        print(f"{idx + 1}. {disease}")

    disease_index = int(input("\nSelect a disease by number: ")) - 1
    selected_disease = diseases[disease_index]

    # Show targets for selected disease
    targets = sorted(df[df['Disease Name'] == selected_disease]['targetName'].unique())
    print(f"\nAvailable Targets for '{selected_disease}':")
    for idx, target in enumerate(targets):
        print(f"{idx + 1}. {target}")

    target_index = int(input("\nSelect a target by number: ")) - 1
    selected_target = targets[target_index]

    print(f"\nFetching preclinical results for Disease: '{selected_disease}', Target: '{selected_target}'...\n")

    results = get_preclinical_study_results_by_disease_and_target(selected_disease, selected_target)
    for res in results:
        print(res)
        print("-" * 60)

 
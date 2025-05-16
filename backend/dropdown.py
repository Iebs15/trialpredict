

 
# import pandas as pd
# from openai import AzureOpenAI
# import os
# from dotenv import load_dotenv
# import time
# from tqdm import tqdm  # For progress bar
 
# # Load environment variables
# load_dotenv()
 
# # Azure OpenAI Configuration
# client = AzureOpenAI(
#     api_key=os.getenv("AZURE_API"),
#     api_version=os.getenv("AZURE_API_VERSION"),
#     azure_endpoint=os.getenv("AZURE_BASE_URL")
# )
 
# MODEL = "gpt-4o-mini"
 
# # Load dataset
# try:
#     df = pd.read_excel("final_granted_plus_pregarnted_v2.xlsx", engine='openpyxl')
# except Exception:
#     df = pd.read_csv("final_granted_plus_pregarnted_v2.xlsx", encoding='ISO-8859-1')
 
 
 
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
 
 
 
# def get_preclinical_study_results(user_input):
#     # Filter the dataframe to find matching rows based on OR condition
#     filtered_df = df[(df['prefName'].str.lower() == user_input.lower()) |
#                      (df['targetName'].str.lower() == user_input.lower())]
 
#     if filtered_df.empty:
#         return {"error": "No matching records found for the provided drug name or target."}
   
#     results = []
   
#     # Generate the prompt for the model and get the results for each matching record
#     for idx, row in filtered_df.iterrows():
#         user_prompt = generate_user_prompt(row)
#         drug_name, target_name, prob, explain = get_prediction(user_prompt, row['prefName'], row['targetName'])
 
#         # Fetch additional information
#         disease = row['Disease']
#         assignee_name = row['Assignee_Applicant']
#         pg_pubid = row['pgpub_id'] if pd.notna(row['pgpub_id']) else row['Display_Key']
#         inventor = row['Inventor']
#         publication_date = row['Publication_Date']
 
#         # Store the result as a dictionary
#         result = {
#             "drug_name": drug_name,
#             "target_name": target_name,
#             "disease": disease,
#             "assignee_name": assignee_name,
#             "pg_pubid": pg_pubid,
#             "inventor": inventor,
#             "publication_date": publication_date,
#             "probability": prob,
#             "justification": explain
#         }
       
#         # Yield the result one by one for frontend processing
#         yield result
 
 
# # Example usage:
# if __name__ == "__main__":
#     user_input = input("Enter the Drug Name (prefName) or Target Name (targetName): ")
 
#     # Get the results one by one
#     result_generator = get_preclinical_study_results(user_input)
 
#     for result in result_generator:
#         print(result)  
 
 
 
 

 
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
 
 
 
def generate_user_prompt(row):
    return f"""You are a biomedical expert evaluating the success potential of preclinical studies.
 
The following information is available:
- **Study Title**: {row['Title']}
- **Abstract**: {row['Abstract']}
- **Claim**: {row['Claim']}
- **Drug Name**: {row['prefName']}
- **Target Name**: {row['targetName']}
 
Based on the abstract and claim, estimate the **probability (0-100%)** that the drug **{row['prefName']}** targeting **{row['targetName']}** has **successfully passed preclinical trials**.
 
Also, provide a **valid scientific justification** referencing the abstract or claim."""
 
# System message
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

# System prompt builder
def generate_system_prompt(row):
    return f"""You are a biomedical AI assistant tasked with evaluating preclinical study data. For each study, you will be given:
- **Study Title**: The title of the preclinical study.
- **Abstract**: A summary of the study's background, methods, and findings.
- **Claim**: The specific claim made by the study.
- **Disease Name**: The disease which is being treated using the drug **{row['prefName']}** and is linked to **{row['targetName']}**
- **Drug Name (prefName)**: The name of the drug being tested (**{row['prefName']}**).
- **Target Name (targetName)**: The biological target of the drug (**{row['targetName']}**).
 
Your task is to:
1. **Estimate the likelihood (in percentage)** that the drug **{row['prefName']}** and the disease **{row['Disease Name']}** targeting **{row['targetName']}** has **successfully passed preclinical trials** based on the provided information.
2. **Provide a scientific justification** for your answer. This justification must be directly supported by details in the **abstract** and **claim** for both disease **{row['Disease Name']}** targeting **{row['targetName']}** .
 
**STRICT STRUCTURE GUIDELINES**:
- The output should be in **two distinct parts**:
  1. **Probability**: A percentage value from **0 to 100%** (for example, 85%).
  2. **Justification**: A scientific explanation that **does not mention the probability value** in any way. The justification must be based solely on the data provided in the abstract and claim. You must **NOT** mention the estimated probability value anywhere in the justification section. It should be a purely scientific explanation based on the abstract and claim, addressing why the study is likely to pass preclinical trials or not.
  3. **DONT EVEN TRY TO MENTION PROBABILITY IN THE JUSTFICATION SECTION**
- **Do not deviate** from this structure. Ensure that the **Probability** and **Justification** sections are clearly separated and correctly formatted. The response should **never mix the two**.
 
**SAMPLE OUTPUT**
**Probability**: 1%
**Justification**: The study presents an innovative automatic infusion system designed for blood glucose monitoring and intensive insulin therapy in critically ill adult patients. The findings suggest that this system effectively maintains normoglycemia, thereby reducing mortality and morbidity in intensive care settings. The development of a model-based predictive controller that adapts insulin delivery based on real-time patient data is particularly noteworthy. The claim emphasizes the capability of the system to predict the glycemic response and adjust insulin administration accordingly, indicating a sophisticated approach to managing patients with varying insulin needs. Furthermore, the emphasis on minimizing deviations from normoglycemia, while preventing potential complications such as hypoglycemia, supports the system's potential relevance in clinical settings. The comprehensive testing of the apparatus's functionality in a critical care environment indicates a strong likelihood of successful preclinical outcomes, especially considering its alignment with established therapeutic goals in managing insulin regulation.
 
This format is mandatory, and responses that deviate from this structure will be considered invalid."""
 
def get_prediction(user_prompt,system_prompt, target_name):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": system_prompt},
                      {"role": "user", "content": user_prompt}]
        )
        content = response.choices[0].message.content.strip()
 
        # Extract probability (number value) from response
        import re
        match = re.search(r"(\d{1,3})\s*%?", content)
        probability = match.group(1) if match else "N/A"
 
        # Ensure no reference to probability in the justification part
        justification = content.replace(f"**Probability**: {probability}%", "").strip()
        justification = justification.replace("**Justification**:", "").strip()
 
        return  target_name, probability, justification
    except Exception as e:
        return  target_name, "ERROR", str(e)
    
# def disease_filter(df):
    
#     # 1. Show available diseases
#     unique_diseases = df['Disease'].dropna().unique()
#     print("Available diseases:")
#     for i, d in enumerate(unique_diseases, start=1):
#         print(f"{i}. {d}")
    
#     # 2. Ask how many diseases to select
#     while True:
#         try:
#             n = int(input("\nEnter the number of diseases you want to select: "))
#             if 1 <= n <= len(unique_diseases):
#                 break
#             print(f"Please enter a number between 1 and {len(unique_diseases)}.")
#         except ValueError:
#             print("That’s not a valid number—please try again.")
    
#     # 3. Collect the disease names
#     selected = []
#     for i in range(1, n+1):
#         while True:
#             choice = input(f"Enter disease #{i} (name exactly as above): ").strip()
#             if choice in unique_diseases:
#                 selected.append(choice)
#                 break
#             print("Invalid disease name—please choose one from the list.")
    
#     # 4. Filter the DataFrame
#     disease_df = df[df['Disease'].isin(selected)].copy()
#     print(f"\nFiltered down to {len(disease_df)} rows for: {selected}\n")
    
#     return disease_df
    
def disease_filter(df):
    """
    Prompt the user to select diseases from df['Disease']:
      - Enter 0 → include *all* diseases
      - Enter N > 0 → pick exactly N diseases
    Returns a filtered DataFrame.
    """
    unique_diseases = list(df['Disease Name'].dropna().unique())
    print("Available diseases:")
    for i, d in enumerate(unique_diseases, start=1):
        print(f"{i}. {d}")

    # Ask how many diseases to select (0 = all)
    while True:
        try:
            n = int(input(
                "\nEnter the number of diseases you want to select "
                "(0 to select ALL): "
            ))
            if 0 <= n <= len(unique_diseases):
                break
            print(f"Please enter a number between 0 and {len(unique_diseases)}.")
        except ValueError:
            print("Invalid input—please enter a number.")

    # If 0, take all
    if n == 0:
        selected = unique_diseases
        print(f"\nSelected all {len(selected)} diseases.")
    else:
        selected = []
        for i in range(1, n+1):
            while True:
                choice = input(f"Enter disease #{i} (exactly as listed): ").strip()
                if choice in unique_diseases:
                    selected.append(choice)
                    break
                print("Invalid name—please choose one from the list.")
        print(f"\nSelected diseases: {selected}")

    # Filter and return
    disease_df = df[df['Disease Name'].isin(selected)].copy()
    print(f"Filtered down to {len(disease_df)} rows.\n")
    return disease_df

    
 
def get_preclinical_study_results(user_input):
    # Filter the dataframe to find matching rows based on OR condition
    filtered_df = df[(df['targetName'].str.lower() == user_input.lower())]
 
    if filtered_df.empty:
        return {"error": "No matching records found for the provided drug name or target."}
    
    
    disease_df = disease_filter(filtered_df)
    if disease_df.empty:
        return {"error": "No records remain after disease filtering."}
    

    results = []
    # Generate the prompt for the model and get the results for each matching record
    for idx, row in disease_df.iterrows():
        user_prompt = generate_user_prompt(row)
        system_prompt = generate_system_prompt(row)
        target_name, _, explain = get_prediction(user_prompt,system_prompt, row['targetName'])
 
        # Fetch additional information
        drug = row['prefName']
        disease = row['Disease Name']
        assignee_name = row['Assignee_Applicant']
        abstract = row['Abstract']
        claim =row['Claim']
        pg_pubid = row['pgpub_id'] if pd.notna(row['pgpub_id']) else row['Display_Key']
        inventor = row['Inventor']
        publication_date = row['Publication_Date']
        urls = row['urls']
        disease_target_exp = row['Disease_Target_Explanation']
 
        # Store the result as a dictionary
        result = {
            "drug_name": drug,
            "target_name": target_name,
            "disease": disease,
            "assignee_name": assignee_name,
            "abstract": abstract,
            "claim": claim,
            "pg_pubid": pg_pubid,
            # "inventor": inventor,
            "Disease Target Explaination" : disease_target_exp,
            "publication_date": publication_date,
            # "probability": prob,
            "justification": explain,
            "Sources": urls
        }
       
        # Yield the result one by one for frontend processing
        yield result
 
 
# Example usage:
if __name__ == "__main__":
    user_input = input("Enter the Target Name (targetName): ")
    
 
    # Get the results one by one
    result_generator = get_preclinical_study_results(user_input)
 
    for result in result_generator:
        print(result)  
 
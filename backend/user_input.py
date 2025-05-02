from openai import AzureOpenAI
import os
from dotenv import load_dotenv
import re
 
# Load environment variables
load_dotenv()
 
# Azure OpenAI Configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
 
MODEL = "gpt-4o-mini"
 
# System message for the LLM to follow strict output structure
SYSTEM_PROMPT = """You are a biomedical AI assistant tasked with evaluating preclinical study data. For each study, you will be given:
- **Drug Name (prefName)**: The name of the drug being tested.
- **Target Name (targetName)**: The biological target of the drug.
- **Disease**: The disease or condition being targeted.
- **Synonym**: This is the molecule on which the study is being done.
- **Study Results**: The preclinical outcomes of the biomarkers and the molecule it is performing on.
 
Your task is to:
1. **Estimate the likelihood (in percentage)** that the drug **{drug_name}** targeting **{target_name}** for **{disease}** has **successfully passed preclinical trials** based on the provided information. The provided information will consist of **{study_results}** and the molecule name **{synonym}** it is being performed upon.
2. **Provide a scientific justification** for your answer. This justification must be directly supported by details in the {study_results} and any relevant information provided by the user.
 
**STRICT STRUCTURE GUIDELINES**:
- The output should be in **two distinct parts**:
  1. **Probability**: A percentage value from **0 to 100%** (for example, 85%).
  2. **Justification**: A scientific explanation that **does not mention the probability value** in any way. The justification must be based solely on the provided information (i.e., study title, disease, and drug/target description). It should explain why the study is likely to pass preclinical trials or not.
  3. **DO NOT mention probability in the justification section at any time**.
- **Do not deviate** from this structure. Ensure that the **Probability** and **Justification** sections are clearly separated and correctly formatted. The response should **never mix the two**.
"""
 
# Generate prompt function
def generate_user_prompt_userinput(drug_name, target_name, disease, study, synonym):
    return f"""You are a biomedical expert evaluating the success potential of preclinical studies.
 
The following information is available:
 
- **Study Title**: {study}
- **Drug Name**: {drug_name}
- **Target Name**: {target_name}
- **Disease**: {disease}
- **Synonym**: {synonym}
 
Based on this information, estimate the **probability (0-100%)** that the drug **{drug_name}** targeting **{target_name}** will successfully pass preclinical trials.
 
Also, provide a **valid scientific justification** referencing the study and disease details."""
 
# Get prediction function
def get_prediction_userinput(prompt, drug_name, target_name, disease, synonym):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": SYSTEM_PROMPT},
                      {"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content.strip()
 
        # Extract probability (number value) from the response
        match = re.search(r"(\d{1,3})\s*%?", content)
        probability = match.group(1) if match else "N/A"
 
        # Split the response to separate probability and justification
        # Remove any first occurrence of probability from the justification text
        justification = content.replace(f"**Probability**: {probability}%", "").strip()
        justification = justification.replace("**Justification**:", "").strip()
 
        # Return all details including disease name and synonyms
        return drug_name, target_name, probability, justification, disease, synonym
    except Exception as e:
        return drug_name, target_name, "ERROR", str(e), disease, synonym
 
# Main function
def main():
    # Input from the user for Drug Name, Target Name, Disease, and Study Title
    drug_name = input("Enter the Drug Name (prefName): ")
    target_name = input("Enter the Target Name (targetName): ")
    disease = input("Enter the Disease: ")
    study = input("Enter the Study Title (abstract/claim text): ")
    synonym = input("Enter synonyms: ")
 
    # Generate the prompt for the model
    user_prompt = generate_user_prompt_userinput(drug_name, target_name, disease, study, synonym)
 
    # Get the prediction
    drug_name, target_name, prob, explain, disease, synonym = get_prediction_userinput(user_prompt, drug_name, target_name, disease, synonym)
 
    # Output results
    print(f"\n**Results for {drug_name} targeting {target_name}**:")
    print(f"**Probability**: {prob}%")
    print(f"**Justification**: {explain}")
    print(f"**Disease Name**: {disease}")
    print(f"**Synonym**: {synonym}")
 
# Run the main function
if __name__ == "__main__":
    main()
 
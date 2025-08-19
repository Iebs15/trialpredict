import pandas as pd 
import json
from elasticsearch import Elasticsearch
from openai import AzureOpenAI
from dotenv import load_dotenv
import os 

load_dotenv()

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_API"),
    api_version=os.getenv("AZURE_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_BASE_URL")
)
MODEL = "gpt-4o-mini"

es = Elasticsearch(
    os.getenv("elasticsearchendpoint"),
    api_key=os.getenv("elasticapikey")
)

INDEX = "trialpredict_ecs"
scroll = "2m"  # Scroll context time (2 minutes to keep scroll open)
size = 10000  # Number of results per scroll

biomarker_name_map = {
    "Aquaporin-3": ["Aquaporin-3", "AQP3"],
    "Aquaporin-4": ["Aquaporin-4", "AQP4"],
    "Collagen XI alpha 1 (COL11A1)": ["COL11A1", "Collagen XI alpha 1"],
    "Corneocyte envelope proteins": ["Corneocyte envelope proteins"],
    "Endothelin receptor type A (EDNRA)": ["EDNRA", "Endothelin receptor type A"],
    "Endothelin receptor type B (EDNRB)": ["EDNRB", "Endothelin receptor type B"],
    "Filaggrin": ["Filaggrin", "FLG", "FLG2"],
    "IGFBP7": ["IGFBP7", "Insulin-like Growth Factor Binding Protein 7"],
    "IL-6": ["IL-6", "Interleukin-6"],
    "IL-8": ["IL-8", "Interleukin-8"],
    "Keratin-10": ["Keratin-10", "K10", "K-10"],
    "Melan-A": ["Melan-A", "MELAN-A"],
    "Melanin": ["Melanin"],
    "MITF": ["MITF", "Microphthalmia-associated transcription factor"],
    "OCA2": ["OCA2", "Oculocutaneous albinism II gene"],
    "Tyrosinase": ["Tyrosinase", "tyrosinase"],
    "VEGFA": ["VEGFA", "Vascular Endothelial Growth Factor A"]
}


def elastic_search(index, scroll, size, Biomarkers, condition=None, case_insensitive=False, source_includes=None) -> pd.DataFrame:
    """
    Fetch all docs for the given Biomarkers list (and optional condition) from Elasticsearch with scrolling.
    - index: ES index name (e.g., "trialpredict-biomarker-ci-t")
    - scroll: scroll context time (e.g., "2m")
    - size: batch size per scroll (e.g., 1000)
    - Biomarkers: iterable of biomarker strings
    - condition: optional string to filter by Condition.keyword
    - case_insensitive: if True, uses many `term` queries with case_insensitive=True
    - source_includes: optional list of fields to return (improves perf)
    """
    BIOMARKER_FIELD = "Biomarker Name.keyword"
    CONDITION_FIELD = "Condition.keyword"

    # Clean biomarkers
    biomarkers = [str(b).strip() for b in (Biomarkers or []) if str(b).strip()]
    if not biomarkers:
        return pd.DataFrame()

    filters = []

    # Biomarker query
    if case_insensitive:
        should_terms = [
            {"term": {BIOMARKER_FIELD: {"value": b, "case_insensitive": True}}}
            for b in biomarkers
        ]
        filters.append({"bool": {"should": should_terms, "minimum_should_match": 1}})
    else:
        filters.append({"terms": {BIOMARKER_FIELD: biomarkers}})

    # Condition query (if provided)
    if condition:
        filters.append({"term": {CONDITION_FIELD: {"value": condition}}})

    query_body = {"query": {"bool": {"filter": filters}}}

    if source_includes:
        query_body["_source"] = source_includes

    rec = []
    res = es.search(index=index, body=query_body, size=size, scroll=scroll)
    scroll_id = res.get("_scroll_id")

    try:
        while True:
            hits = res.get("hits", {}).get("hits", [])
            if not hits:
                break
            for h in hits:
                src = h.get("_source", {}).copy()
                src["_id"] = h.get("_id")
                src["_index"] = h.get("_index")
                rec.append(src)
            res = es.scroll(scroll_id=scroll_id, scroll=scroll)
            scroll_id = res.get("_scroll_id", scroll_id)
    finally:
        if scroll_id:
            try:
                es.clear_scroll(scroll_id=scroll_id)
            except Exception:
                pass

    return pd.DataFrame(rec)


def build_alias_lookup(name_map: dict) -> dict:
    alias2canon = {}
    for canon, aliases in name_map.items():
        for a in aliases:
            alias2canon[a.strip().lower()] = canon  # case-insensitive lookup
        # also allow the canonical itself
        alias2canon[canon.strip().lower()] = canon
    return alias2canon

def standardize_Biomarker_list(Biomarkers, B_map, alias2can):
    out = []
    seen = set()
    for b in Biomarkers or []:
        canon = alias2can.get(str(b).strip().lower(), str(b).strip())
        for alias in B_map.get(canon, [canon]):
            alias_norm = alias.strip()
            if alias_norm not in seen:
                out.append(alias_norm)
                seen.add(alias_norm)
    return out

        

def standardize_name_single(name: str, alias2canon: dict) -> str:
    """
    Standardize a single biomarker name to its canonical using alias2canon.
    Falls back to the stripped original if no match is found.
    """
    if pd.isna(name):
        return name
    s = str(name).strip()
    return alias2canon.get(s.lower(), s)

def standardize_df_column(df: pd.DataFrame, column: str, alias2canon: dict, in_place: bool = True) -> pd.DataFrame:
    """
    Standardize all values in df[column] to canonical names using alias2canon.
    If in_place=False, returns a modified copy. If the column is missing, no-op.
    """
    if column not in df.columns or df.empty:
        return df if in_place else df.copy()

    target = df if in_place else df.copy()
    # Keep original if you want a reference
    if "Biomarker Name (original)" not in target.columns:
        target["Biomarker Name (original)"] = target[column]
    target[column] = target[column].apply(lambda x: standardize_name_single(x, alias2canon))
    return target

def openai_response(rec_json: str, condition: str, biomarker_label: str) -> str:
    system_prompt = f"""
    You are the Skincare Analyst and Treatment Expert.  
    You will be given key insights already classified into three categories:  
    - Causative  
    - Suggestive  
    - Correlative  

    Your tasks are:  
    1. Combine and summarize the insights within each category.  
    2. Produce one clear, coherent summary per category.  
    3. Ensure all treatments and their effects on biomarkers are mentioned, highlighting how each treatment impacts the disease.   

    The final output must strictly be in JSON format only, with the following structure:  

    {{
    "Causality": "combined key insights for causative",
    "Suggestive": "combined key insights for suggestive",
    "Correlative": "combined key insights for correlative"
    }}
    
    
    Note:
    Do not include any extra text, explanations, or formatting (e.g., no markdown code fences).
""".strip()

    user_prompt = rec_json

    resp = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2
    )
    return resp.choices[0].message.content.strip()

        

def main():
    Biomarkers = ["Filaggrin"]
    condition = "Aging"

    ALIAS2CANON = build_alias_lookup(biomarker_name_map)
    Biomark = standardize_Biomarker_list(Biomarkers, biomarker_name_map, ALIAS2CANON)

    result_old = elastic_search(INDEX, scroll, size, Biomark, condition=condition)
    print("old DF:", result_old)
    result = standardize_df_column(result_old, "Biomarker Name", ALIAS2CANON, in_place=True)

    rec = []
    col_bio = "Biomarker Name"
    col_cls = "Classification (Cause/Correlation)"
    col_ins = "Key Insight_ECS"

    missing = [c for c in [col_bio, col_cls, col_ins] if c not in result.columns]
    if missing:
        print(f"Missing columns in dataframe: {missing}")
        return

    for _, row in result.iterrows():
        biomarker = row[col_bio]
        classify = row[col_cls]
        key_insight = row[col_ins]
        if pd.isna(key_insight) or str(key_insight).strip() == "":
            continue
        rec.append({
            "biomarker": None if pd.isna(biomarker) else str(biomarker),
            "Classification": "" if pd.isna(classify) else str(classify),
            "Key Insights": str(key_insight),
            "condition": condition
        })

    if not rec:
        print("No insights found to summarize.")
        return

    # Create a readable label: all unique biomarker names (canonicalized), comma-separated
    unique_biomarkers = sorted({r["biomarker"] for r in rec if r.get("biomarker")})
    biomarker_label = ", ".join(unique_biomarkers) if unique_biomarkers else "N/A"

    rec_json = json.dumps(rec, ensure_ascii=False)
    response = openai_response(rec_json, condition, biomarker_label)

    try:
        response_obj = json.loads(response)
        print(json.dumps(response_obj, indent=2, ensure_ascii=False))
    except json.JSONDecodeError:
        print("Model response (not valid JSON):")
        print(response)

    
        
    # print(f"Result:\n {result.head}")
    
    # result.to_csv("Sample.csv")
if __name__ =="__main__":
    main()

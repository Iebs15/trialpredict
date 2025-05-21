import pandas as pd
import networkx as nx
import openpyxl
import ast
from collections import Counter, defaultdict

# --- 1. Build the Heterogeneous Knowledge Graph ---

def build_hetero_knowledge_graph(df) -> nx.MultiDiGraph:
    G = nx.MultiDiGraph()

    for _, row in df.iterrows():
        disease_id = row['diseaseId']
        disease_name = row['Disease_name']
        target_id = row['targetId']
        biomarker = row['approvedSymbol']
        drug_id = row['drugId']
        drug_name = row['prefName']
        target_name = row['targetName']
        ancestors_raw = row.get('ancestors', None)

        # --- Add Disease Node ---
        G.add_node(disease_id, label=disease_name, type='disease')

        # --- Add Biomarker Node ---
        if pd.notnull(target_id):
            G.add_node(target_id, label=biomarker, type='biomarker')
            G.add_edge(disease_id, target_id, type='associated_with')

        # --- Add Drug Node ---
        if pd.notnull(drug_id):
            G.add_node(drug_id, label=drug_name, type='drug')

            if pd.notnull(target_id):
                G.add_edge(drug_id, target_id, type='targets')

            G.add_edge(drug_id, disease_id, type='used_in_trial')

        # --- Add Ancestors ---
        if pd.notnull(ancestors_raw):
            try:
                ancestors = ast.literal_eval(ancestors_raw)
                for anc_id in ancestors:
                    anc_node = f"anc_{anc_id}"
                    G.add_node(anc_node, label=anc_id, type='ancestor')
                    G.add_edge(anc_node, disease_id, type='is_ancestor_of')
            except Exception as e:
                print(f"Error parsing ancestors: {e}")

    return G

# --- 2. Map Target Name to Target ID (Corrected) ---

def map_target_name_to_id(df) -> dict:
    return {
        str(name).lower(): tid
        for name, tid in zip(df['targetName'], df['targetId'])
        if pd.notnull(name) and pd.notnull(tid)
    }

# --- 3. Predict Diseases for Given Target ---

def predict_diseases_for_target(G, target_id, top_k=15):
    if target_id not in G.nodes:
        print("Target ID not found in graph.")
        return []

    disease_scores = Counter()
    disease_drug_links = defaultdict(set)

    # Step 1: Direct association
    for node in G.nodes:
        if G.nodes[node]['type'] != 'disease':
            continue
        if G.has_edge(node, target_id):
            for key in G[node][target_id]:
                if G[node][target_id][key]['type'] == 'associated_with':
                    disease_scores[node] += 3  # direct evidence

    # Step 2: Drug targets → diseases
    for drug in G.predecessors(target_id):
        if G[drug][target_id].get(0, {}).get('type') == 'targets':
            for disease in G.successors(drug):
                if G[drug][disease].get(0, {}).get('type') == 'used_in_trial':
                    disease_scores[disease] += 1
                    disease_drug_links[disease].add(drug)

    # Step 3: Ancestor-based disease inference
    for anc in G.nodes:
        if G.nodes[anc]['type'] != 'ancestor':
            continue
        for disease in G.successors(anc):
            if G[anc][disease].get(0, {}).get('type') == 'is_ancestor_of':
                if G.has_edge(disease, target_id):
                    for key in G[disease][target_id]:
                        if G[disease][target_id][key]['type'] == 'associated_with':
                            disease_scores[disease] += 1

    ranked = sorted(disease_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
    results = []
    for did, score in ranked:
        label = G.nodes[did].get('label', did)
        drugs = list(disease_drug_links.get(did, []))
        results.append({
            'disease_id': did,
            'disease_name': label,
            'score': score,
            'linked_drugs': [G.nodes[d].get('label', d) for d in drugs]
        })

    return results

# --- 4. Run the Pipeline ---

# Step 1: Load data
df = pd.read_excel(r"Open_target_data.xlsx")  # <-- Update path if needed

# Step 2: Build graph
G = build_hetero_knowledge_graph(df)

# Step 3: Map target name to ID
name_to_id = map_target_name_to_id(df)

# Debug: Print target names for inspection
print("\nAvailable target names (sample):")
for tname in list(name_to_id.keys())[:20]:
    print(f"- {tname}")

# Input target
target_name_input = "PI3-kinase class I"  # Example input

# Step 4: Predict diseases
target_id = name_to_id.get(target_name_input.lower())
if target_id:
    predictions = predict_diseases_for_target(G, target_id, top_k=10)
    print(f"\nPredicted Diseases for Target '{target_name_input}'\n" + "-"*40)
    for p in predictions:
        print(f"{p['disease_name']} (Score: {p['score']}) - Linked Drugs: {p['linked_drugs']}")
else:
    print(f"\n❌ Target name '{target_name_input}' not found. Try checking the name or spelling.")

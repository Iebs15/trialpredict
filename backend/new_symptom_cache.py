import sys
import json
import time
import pandas as pd
from cache_utiities import load_from_cache, save_to_cache, clean_old_caches, CACHE_DIR
from symptom_utilities import (
    build_weighted_association,
    collect_biomarker_scores_by_color,
    plot_stacked_bars_per_disease,
)

# ----------------------------------------------------------
# Constants / Paths
# ----------------------------------------------------------
EXCEL_PATH = "processed_target_scores_colored_final_v5.xlsx"

# ----------------------------------------------------------
# Main logic
# ----------------------------------------------------------
def main():
    # Optionally, clean caches older than 2 days at startup:
    clean_old_caches(days=2)

    symptom = input("Enter the symptom you want to plot (e.g. pimples): ").strip()
    if not symptom:
        print("No symptom provided—exiting.")
        sys.exit(1)

    # 1) Check cache for build_weighted_association
    nested_assoc = load_from_cache(symptom)
    if nested_assoc is not None:
        print(f"Loaded nested association for '{symptom}' from cache.")
    else:
        # Cache miss: rebuild
        t0 = time.time()
        nested_assoc = build_weighted_association(EXCEL_PATH, symptom)
        t1 = time.time()
        print(f"build_weighted_association took {t1 - t0:.4f} seconds (recomputed).")

        # Save to cache for next time
        save_to_cache(symptom, nested_assoc)

    # 2) Collect raw scores by color for plotting
    t2 = time.time()
    biomarker_names, inhibitor_scores, promoter_scores, unknown_scores = collect_biomarker_scores_by_color(
        EXCEL_PATH, symptom
    )
    t3 = time.time()
    print(f"collect_biomarker_scores_by_color took {t3 - t2:.4f} seconds.")

    # 3) Write out JSON for nested_assoc
    output_json = f"{symptom}_weighted_association.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(nested_assoc, f, indent=2)
    print(f"Saved weighted association JSON to: {output_json}")

    # 4) Flatten nested_assoc into a DataFrame and CSV
    rows = []
    for biomarker, diseases_dict in nested_assoc.items():
        for disease, stats in diseases_dict.items():
            rows.append({
                "Biomarker":         biomarker,
                "Disease":           disease,
                "avg_inhibitor":     stats.get("avg_inhibitor"),
                "percent_inhibitor": stats.get("percent_inhibitor"),
                "avg_promoter":      stats.get("avg_promoter"),
                "percent_promoter":  stats.get("percent_promoter"),
                "avg_unknown":       stats.get("avg_unknown"),
                "percent_unknown":   stats.get("percent_unknown"),
                "total_avg":         stats.get("total_avg"),
            })

    df = pd.DataFrame(rows)
    df = df[
        [
            "Biomarker",
            "Disease",
            "avg_inhibitor",
            "percent_inhibitor",
            "avg_promoter",
            "percent_promoter",
            "avg_unknown",
            "percent_unknown",
            "total_avg",
        ]
    ]
    df = df.sort_values(["Biomarker", "Disease"]).reset_index(drop=True)
    csv_path = f"Symptom_selected_{symptom}.csv"
    df.to_csv(csv_path, index=False)
    print(f"Wrote {len(df)} rows to {csv_path}.")

    # 5) Plot Inhibitor stack
    t4 = time.time()
    plot_stacked_bars_per_disease(
        biomarker_names,
        inhibitor_scores,
        symptom,
        category_name="Inhibitor",
        colormap_name="tab20"
    )
    t5 = time.time()
    print(f"plot_stacked_bars_per_disease(Inhibitor) took {t5 - t4:.4f} seconds.")

    # 6) Plot Promoter stack
    t6 = time.time()
    plot_stacked_bars_per_disease(
        biomarker_names,
        promoter_scores,
        symptom,
        category_name="Promoter",
        colormap_name="tab20"
    )
    t7 = time.time()
    print(f"plot_stacked_bars_per_disease(Promoter) took {t7 - t6:.4f} seconds.")

    # 7) Plot Unknown stack
    t8 = time.time()
    plot_stacked_bars_per_disease(
        biomarker_names,
        unknown_scores,
        symptom,
        category_name="Unknown",
        colormap_name="tab20"
    )
    t9 = time.time()
    print(f"plot_stacked_bars_per_disease(Unknown) took {t9 - t8:.4f} seconds.")


if __name__ == "__main__":
    main()

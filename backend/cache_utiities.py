import os
import pickle
import time
from typing import Optional, Dict

# ----------------------------------------------------------
# Constants / Paths (can be overridden by importing script)
# ----------------------------------------------------------
EXCEL_PATH = "processed_target_scores_colored_final_v5.xlsx"
CACHE_DIR = "cache"  # Directory to store per-symptom cache files

# ----------------------------------------------------------
# Ensure cache directory exists
# ----------------------------------------------------------
if not os.path.isdir(CACHE_DIR):
    os.makedirs(CACHE_DIR)

# ----------------------------------------------------------
# Utility: Get file modification time
# ----------------------------------------------------------
def get_file_mtime(path: str) -> float:
    """
    Return the last-modified timestamp of a file as a float (seconds since epoch).
    """
    try:
        return os.path.getmtime(path)
    except OSError:
        return 0.0

# ----------------------------------------------------------
# Load cache for a given symptom
# ----------------------------------------------------------
def load_from_cache(symptom: str) -> Optional[Dict]:
    """
    Attempt to load cached data for a given symptom.
    The cache file stores a tuple: (excel_mtime, nested_assoc_dict).
    If the file exists and excel_mtime matches current EXCEL_PATH mtime, return nested_assoc.
    Otherwise, return None to indicate a cache-miss.
    """
    cache_file = os.path.join(CACHE_DIR, f"{symptom}.pkl")
    if not os.path.isfile(cache_file):
        return None

    try:
        with open(cache_file, "rb") as f:
            cached_mtime, nested_assoc = pickle.load(f)
    except Exception:
        # If unpickling fails, treat as miss
        return None

    current_mtime = get_file_mtime(EXCEL_PATH)
    if abs(cached_mtime - current_mtime) < 1e-6:
        # mtime matches exactly → cache is valid
        return nested_assoc

    # Otherwise → cache is stale
    return None

# ----------------------------------------------------------
# Save cache for a given symptom
# ----------------------------------------------------------
def save_to_cache(symptom: str, nested_assoc: Dict):
    """
    Write (current_excel_mtime, nested_assoc) → cache/<symptom>.pkl.
    """
    cache_file = os.path.join(CACHE_DIR, f"{symptom}.pkl")
    current_mtime = get_file_mtime(EXCEL_PATH)
    try:
        with open(cache_file, "wb") as f:
            pickle.dump((current_mtime, nested_assoc), f, protocol=pickle.HIGHEST_PROTOCOL)
    except Exception as e:
        print(f"Warning: could not write cache file {cache_file} → {e}")

# ----------------------------------------------------------
# Clean old cache files
# ----------------------------------------------------------
def clean_old_caches(days: int = 7):
    """
    Delete any cache file (*.pkl) in CACHE_DIR older than `days` days.
    """
    cutoff = time.time() - (days * 86400)
    for fname in os.listdir(CACHE_DIR):
        if not fname.lower().endswith(".pkl"):
            continue
        fullpath = os.path.join(CACHE_DIR, fname)
        try:
            if os.path.getmtime(fullpath) < cutoff:
                os.remove(fullpath)
                print(f"Removed old cache: {fullpath}")
        except Exception:
            pass

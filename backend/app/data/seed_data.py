import json
import os
from pathlib import Path
from typing import List, Dict, Any

DATA_DIR = Path(__file__).parent


def load_taxonomy() -> Dict[str, Any]:
    tax_path = DATA_DIR / "taxonomy.json"
    if tax_path.exists():
        with open(tax_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"version": "2025.1", "taxonomies": []}


def load_sample_products() -> List[Dict[str, Any]]:
    prod_path = DATA_DIR / "sample_products.json"
    if prod_path.exists():
        with open(prod_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

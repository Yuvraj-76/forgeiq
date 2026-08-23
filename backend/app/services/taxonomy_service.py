from typing import List, Dict, Any, Optional
from ..data.seed_data import load_taxonomy
from ..utils.logger import logger


class TaxonomyService:
    def __init__(self):
        self._taxonomy_data = load_taxonomy()
        self._nodes = self._taxonomy_data.get("taxonomies", [])

    def get_all_categories(self) -> List[Dict[str, Any]]:
        return self._nodes

    def find_best_category_match(self, text: str) -> Dict[str, Any]:
        """Matches text against keyword rules to suggest best taxonomy branch"""
        text_lower = text.lower()
        best_match = None
        highest_score = 0
        
        for node in self._nodes:
            keywords = node.get("keywords", [])
            score = sum(1 for kw in keywords if kw.lower() in text_lower)
            if score > highest_score:
                highest_score = score
                best_match = node
                
        if best_match:
            return best_match
            
        # Fallback to first general category
        return self._nodes[0] if self._nodes else {
            "id": "cat_general_merchandise",
            "path": "General Merchandise > Industrial & Commercial",
            "required_attributes": [],
            "optional_attributes": []
        }

    def get_category_by_id(self, cat_id: str) -> Optional[Dict[str, Any]]:
        for node in self._nodes:
            if node.get("id") == cat_id:
                return node
        return None


taxonomy_service = TaxonomyService()

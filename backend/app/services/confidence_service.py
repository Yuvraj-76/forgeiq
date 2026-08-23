from typing import List, Dict, Any
from ..models.product import ProductAttribute


class ConfidenceService:
    """Calculates weighted confidence scores based on provenance sources and rule validations"""

    SOURCE_WEIGHTS = {
        "supplier_description": 0.98,
        "direct_supplier_text": 0.98,
        "external_spec_db": 0.95,
        "verified_specification_database": 0.95,
        "ai_inference": 0.88,
        "gemini_semantic_inference": 0.88,
        "manual_review": 1.0,
        "default_fallback": 0.70,
    }

    def compute_attribute_confidence(self, source: str, raw_confidence: int = 90) -> int:
        multiplier = self.SOURCE_WEIGHTS.get(source.lower(), 0.85)
        adjusted = int(raw_confidence * multiplier)
        return max(10, min(100, adjusted))

    def compute_overall_confidence(
        self,
        attributes: List[ProductAttribute],
        category_matched: bool = True,
        title_generated: bool = True
    ) -> int:
        if not attributes:
            return 75 if category_matched else 60
            
        attr_scores = [a.confidence for a in attributes]
        avg_attr_score = sum(attr_scores) / len(attr_scores)
        
        # Base weight distribution:
        # Attributes: 60%
        # Category Confidence: 25%
        # Title/Syntax Completeness: 15%
        cat_score = 98 if category_matched else 70
        title_score = 95 if title_generated else 80
        
        composite = (avg_attr_score * 0.60) + (cat_score * 0.25) + (title_score * 0.15)
        return int(round(max(10, min(100, composite))))


confidence_service = ConfidenceService()

from typing import List, Optional, Dict, Any
from datetime import datetime
import copy
from ..models.product import EnrichedProduct, ProductStatus, ReviewStatus, ProductAttribute
from ..data.seed_data import load_sample_products
from ..utils.logger import logger


class ProductRepository:
    """Repository managing catalog state with in-memory persistence and query filtering"""
    
    def __init__(self):
        self._products: Dict[str, EnrichedProduct] = {}
        self._seed_initial_data()
        
    def _seed_initial_data(self):
        samples = load_sample_products()
        for s in samples:
            try:
                prod = EnrichedProduct(**s)
                self._products[prod.id] = prod
            except Exception as e:
                logger.error(f"Error loading sample seed product {s.get('id')}: {e}")
        logger.info(f"Initialized ProductRepository with {len(self._products)} seed products")

    def get_all(
        self,
        search: Optional[str] = None,
        brand: Optional[str] = None,
        category: Optional[str] = None,
        confidence: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[EnrichedProduct]:
        items = list(self._products.values())
        
        # Text search
        if search:
            q = search.lower().strip()
            items = [
                p for p in items
                if q in p.productTitle.lower()
                or q in p.brand.lower()
                or q in p.partNumber.lower()
                or q in p.categoryPath.lower()
                or q in p.sku.lower()
            ]
            
        # Brand filter
        if brand and brand != "All":
            items = [p for p in items if p.brand.lower() == brand.lower() or p.brandStandardized.lower() == brand.lower()]
            
        # Category filter
        if category and category != "All":
            items = [p for p in items if category.lower() in p.categoryPath.lower()]
            
        # Confidence band filter
        if confidence and confidence != "All":
            if confidence == "High":
                items = [p for p in items if p.confidence >= 90]
            elif confidence == "Medium":
                items = [p for p in items if 70 <= p.confidence < 90]
            elif confidence == "Low":
                items = [p for p in items if p.confidence < 70]
                
        # Status filter
        if status and status != "All":
            items = [p for p in items if p.status.value == status or p.reviewStatus.value == status]
            
        # Sort by updated_at descending
        items.sort(key=lambda x: x.updatedAt, reverse=True)
        return items[offset : offset + limit]

    def get_by_id(self, product_id: str) -> Optional[EnrichedProduct]:
        return self._products.get(product_id)

    def save(self, product: EnrichedProduct) -> EnrichedProduct:
        product.updatedAt = datetime.utcnow().isoformat()
        self._products[product.id] = product
        return product

    def bulk_save(self, products: List[EnrichedProduct]) -> List[EnrichedProduct]:
        for p in products:
            self.save(p)
        return products

    def update_attribute(
        self, product_id: str, attribute_id: str, update_payload: Dict[str, Any]
    ) -> Optional[EnrichedProduct]:
        prod = self.get_by_id(product_id)
        if not prod:
            return None
            
        attr_idx = next((i for i, a in enumerate(prod.attributes) if a.id == attribute_id), None)
        if attr_idx is None:
            return None
            
        target_attr = prod.attributes[attr_idx]
        action = update_payload.get("action", "approve")
        
        # Apply updates
        if "value" in update_payload and update_payload["value"] is not None:
            target_attr.value = update_payload["value"]
        if "name" in update_payload and update_payload["name"] is not None:
            target_attr.name = update_payload["name"]
        if "unit" in update_payload and update_payload["unit"] is not None:
            target_attr.unit = update_payload["unit"]
            
        target_attr.source = "manual_review"
        target_attr.verifiedByUser = True
        target_attr.validationStatus = "rejected" if action == "reject" else "verified_by_user"
        target_attr.confidence = 100 if action != "reject" else 0
        target_attr.reason = update_payload.get("reason", "Manually verified by catalog specialist")
        
        # Recalculate average confidence
        if prod.attributes:
            avg_conf = int(sum(a.confidence for a in prod.attributes) / len(prod.attributes))
            prod.confidence = avg_conf
            prod.confidenceBand = "High" if avg_conf >= 90 else "Medium" if avg_conf >= 70 else "Low"
            prod.status = ProductStatus.HIGH_CONFIDENCE if avg_conf >= 90 else ProductStatus.MEDIUM_CONFIDENCE if avg_conf >= 70 else ProductStatus.NEEDS_REVIEW
            
        prod.reviewStatus = ReviewStatus.APPROVED if action != "reject" else ReviewStatus.MODIFIED
        return self.save(prod)

    def delete(self, product_id: str) -> bool:
        if product_id in self._products:
            del self._products[product_id]
            return True
        return False

    def get_stats(self) -> Dict[str, Any]:
        total = len(self._products)
        if total == 0:
            return {
                "totalCatalogCount": 0,
                "enrichedCount": 0,
                "needsReviewCount": 0,
                "avgConfidence": 0.0,
                "highConfidencePercent": 0.0,
                "topCategories": [],
                "topBrands": [],
                "enrichmentThroughputPerMin": 142.0,
                "timeSavedHoursEstimated": 0.0,
            }
            
        high_conf = sum(1 for p in self._products.values() if p.confidence >= 90)
        needs_rev = sum(1 for p in self._products.values() if p.status == ProductStatus.NEEDS_REVIEW or p.confidence < 80)
        avg_conf = sum(p.confidence for p in self._products.values()) / total
        
        # Category breakdown
        cat_counts: Dict[str, int] = {}
        brand_counts: Dict[str, int] = {}
        for p in self._products.values():
            cat = p.categoryPath.split(">")[-1].strip() if p.categoryPath else "Uncategorized"
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            brand_counts[p.brand] = brand_counts.get(p.brand, 0) + 1
            
        top_cats = [{"category": k, "count": v} for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        top_brands = [{"brand": k, "count": v} for k, v in sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        return {
            "totalCatalogCount": total,
            "enrichedCount": total,
            "needsReviewCount": needs_rev,
            "avgConfidence": round(avg_conf, 1),
            "highConfidencePercent": round((high_conf / total) * 100, 1),
            "topCategories": top_cats,
            "topBrands": top_brands,
            "enrichmentThroughputPerMin": 142.0,
            "timeSavedHoursEstimated": round(total * 0.45, 1),
        }


product_repo = ProductRepository()

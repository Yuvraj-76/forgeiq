from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Path
from ..models.product import EnrichedProduct, AttributeUpdateRequest
from ..models.enrichment import EnrichmentRequest
from ..services.enrichment_service import enrichment_service
from ..database.repository import product_repo
from ..utils.logger import logger

router = APIRouter()


@router.post("/enrich", response_model=EnrichedProduct, summary="Enrich single supplier product")
async def enrich_product(payload: EnrichmentRequest):
    """
    Transforms raw, incomplete supplier data into an enriched, standardized catalog record
    with full 8-stage traceability and weighted confidence score using Gemini.
    """
    try:
        enriched = await enrichment_service.enrich_single_product(payload, persist=True)
        return enriched
    except Exception as e:
        logger.error(f"Error enriching product: {e}")
        raise HTTPException(status_code=500, detail=f"Enrichment pipeline error: {str(e)}")


@router.get("/products", response_model=List[EnrichedProduct], summary="Query catalog products")
async def get_products(
    search: Optional[str] = Query(None, description="Free text search on title, brand, SKU or MPN"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    category: Optional[str] = Query(None, description="Filter by category subtree"),
    confidence: Optional[str] = Query(None, description="Filter by confidence band (High, Medium, Low)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Retrieve catalog products with rich faceted filtering and sorting."""
    return product_repo.get_all(
        search=search,
        brand=brand,
        category=category,
        confidence=confidence,
        status=status,
        limit=limit,
        offset=offset,
    )


@router.get("/products/{product_id}", response_model=EnrichedProduct, summary="Get single product by ID")
async def get_product(
    product_id: str = Path(..., description="Unique product ID, e.g. prod-101")
):
    """Fetch complete product master record including attributes and provenance."""
    product = product_repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found")
    return product


@router.put("/products/{product_id}/attributes/{attribute_id}", response_model=EnrichedProduct, summary="Human Review attribute update")
async def update_product_attribute(
    product_id: str = Path(...),
    attribute_id: str = Path(...),
    payload: AttributeUpdateRequest = ...
):
    """
    Updates or verifies a specific attribute during Human-in-the-Loop catalog review.
    Automatically recalculates overall product confidence and marks as specialist-verified.
    """
    updated = product_repo.update_attribute(
        product_id=product_id,
        attribute_id=attribute_id,
        update_payload=payload.dict(exclude_unset=True)
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Product or Attribute ID not found")
    return updated


@router.delete("/products/{product_id}", summary="Delete product from catalog")
async def delete_product(product_id: str = Path(...)):
    success = product_repo.delete(product_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")
    return {"message": "Product successfully removed", "productId": product_id}

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Path
from ..models.product import TraceabilityStep
from ..database.repository import product_repo

router = APIRouter()


@router.get("/traceability/{product_id}", response_model=List[TraceabilityStep], summary="Get 8-stage pipeline audit log for product")
async def get_product_traceability(product_id: str = Path(...)):
    """
    Returns step-by-step pipeline execution traces, input sanitization details,
    verbatim evidence snippets, and confidence delta logs for a product.
    """
    product = product_repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found")
    return product.traceability


@router.get("/traceability/{product_id}/graph", summary="Get provenance lineage graph")
async def get_lineage_graph(product_id: str = Path(...)):
    """
    Returns directed lineage DAG nodes and links for visual provenance graphs.
    """
    product = product_repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")

    nodes = [
        {"id": "raw_input", "label": "Raw Supplier Input", "type": "input", "data": {"brand": product.brand, "part": product.partNumber}},
        {"id": "taxonomy_node", "label": product.categoryPath, "type": "category", "data": {"categoryId": product.categoryId}},
        {"id": "master_title", "label": product.productTitle, "type": "title"},
    ]
    
    links = [
        {"source": "raw_input", "target": "taxonomy_node", "relationship": "classified_into"},
        {"source": "raw_input", "target": "master_title", "relationship": "synthesized_from"},
    ]

    for attr in product.attributes:
        attr_node_id = f"node_{attr.id}"
        nodes.append({
            "id": attr_node_id,
            "label": f"{attr.name}: {attr.value}{attr.unit or ''}",
            "type": "attribute",
            "confidence": attr.confidence,
            "source": attr.source,
            "evidence": attr.evidence
        })
        links.append({
            "source": "raw_input" if "supplier" in attr.source else "taxonomy_node",
            "target": attr_node_id,
            "relationship": attr.source
        })

    return {
        "productId": product.id,
        "sku": product.sku,
        "nodes": nodes,
        "links": links
    }

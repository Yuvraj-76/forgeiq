from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from ..models.catalog import CatalogExportRequest
from ..services.export_service import export_service
from ..services.taxonomy_service import taxonomy_service
from ..database.repository import product_repo

router = APIRouter()


@router.get("/catalog/taxonomy", summary="Retrieve system taxonomy structure")
async def get_taxonomy():
    """Returns the full hierarchical category taxonomy and required attribute schemas."""
    return taxonomy_service.get_all_categories()


@router.get("/catalog/template", summary="Download blank Enterprise 252-Column CSV Template")
async def download_template():
    """
    Downloads a blank CSV template pre-configured with all 252 enterprise headers
    matching the exact supplier master structure.
    """
    data_bytes = export_service.get_sample_template_csv()
    return Response(
        content=data_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=catalogai_enterprise_252_headers_template.csv"}
    )


@router.get("/catalog/export", summary="Export full or filtered catalog")
async def export_catalog(
    format: str = Query("csv", description="csv | xlsx | json"),
    schema: str = Query("enterprise", description="enterprise (252 headers) | standard"),
    search: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    confidence: Optional[str] = Query(None),
):
    """
    Downloads catalog products in CSV, Excel (.xlsx) or JSON format with all 252 enterprise headers.
    """
    products = product_repo.get_all(
        search=search,
        brand=brand,
        category=category,
        confidence=confidence,
        limit=5000,
        offset=0
    )
    
    fmt = format.lower().strip()
    data_bytes = export_service.export_products(products, fmt, schema_type=schema)
    
    if fmt in ["xlsx", "excel"]:
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = "catalogai_enterprise_master_catalog.xlsx"
    elif fmt == "json":
        media_type = "application/json"
        filename = "catalogai_enterprise_master_catalog.json"
    else:
        media_type = "text/csv"
        filename = "catalogai_enterprise_master_catalog.csv"

    return Response(
        content=data_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/catalog/export", summary="Export specific selected product IDs")
async def export_selected_products(payload: CatalogExportRequest):
    """Exports only selected product IDs or filtered subsets with all 252 enterprise headers."""
    if payload.productIds:
        products = [
            product_repo.get_by_id(pid)
            for pid in payload.productIds
            if product_repo.get_by_id(pid) is not None
        ]
    else:
        products = product_repo.get_all(limit=5000)

    fmt = payload.format.lower().strip()
    data_bytes = export_service.export_products(products, fmt, schema_type="enterprise")

    if fmt in ["xlsx", "excel"]:
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = "catalogai_selection_master_export.xlsx"
    elif fmt == "json":
        media_type = "application/json"
        filename = "catalogai_selection_master_export.json"
    else:
        media_type = "text/csv"
        filename = "catalogai_selection_master_export.csv"

    return Response(
        content=data_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

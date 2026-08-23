"""
API Route Handlers
"""
from fastapi import APIRouter
from .routes_products import router as products_router
from .routes_bulk import router as bulk_router
from .routes_catalog import router as catalog_router
from .routes_analytics import router as analytics_router
from .routes_traceability import router as traceability_router

api_router = APIRouter()

api_router.include_router(products_router, tags=["Products & Enrichment"])
api_router.include_router(bulk_router, tags=["Bulk Processing"])
api_router.include_router(catalog_router, tags=["Catalog Management"])
api_router.include_router(analytics_router, tags=["Analytics"])
api_router.include_router(traceability_router, tags=["Traceability & Audit"])

__all__ = ["api_router"]

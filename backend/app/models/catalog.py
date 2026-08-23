from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CatalogFilterParams(BaseModel):
    """Query parameters for catalog browsing and search"""
    search: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[str] = None
    status: Optional[str] = None
    page: int = Field(1, ge=1)
    limit: int = Field(50, ge=1, le=500)
    sortBy: str = "updatedAt"
    sortOrder: str = "desc"


class CatalogExportRequest(BaseModel):
    """Export configuration for catalog data"""
    format: str = Field("csv", description="csv | xlsx | json")
    productIds: Optional[List[str]] = None
    filters: Optional[CatalogFilterParams] = None
    includeTraceability: bool = False
    includeMetadata: bool = True


class CatalogStats(BaseModel):
    """High-level catalog analytics and readiness metrics"""
    totalCatalogCount: int
    enrichedCount: int
    needsReviewCount: int
    avgConfidence: float
    highConfidencePercent: float
    topCategories: List[Dict[str, Any]]
    topBrands: List[Dict[str, Any]]
    enrichmentThroughputPerMin: float
    timeSavedHoursEstimated: float

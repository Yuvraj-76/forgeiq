from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .product import RawSupplierProduct, EnrichedProduct


class EnrichmentRequest(BaseModel):
    """Single item enrichment request"""
    brand: str = Field(..., example="Bosch")
    partNumber: str = Field(..., example="GSR 120-LI")
    shortDescription: str = Field(..., example="12v drill driver cordless")
    supplierSku: Optional[str] = None
    categoryHint: Optional[str] = None
    targetTaxonomy: Optional[str] = None
    forceFreshAI: bool = False


class EnrichmentStepResult(BaseModel):
    """Intermediate step state returned during real-time streaming enrichment"""
    stepNumber: int
    stepName: str
    title: str
    status: str = "completed"
    durationMs: int = 0
    data: Optional[Dict[str, Any]] = None


class BulkEnrichmentRequest(BaseModel):
    """Batch payload for enriching multiple products"""
    products: List[EnrichmentRequest] = Field(..., min_length=1)
    batchName: Optional[str] = "Batch Upload"
    autoApproveAboveConfidence: Optional[int] = 90


class BulkEnrichmentResponse(BaseModel):
    """Batch enrichment summary response"""
    jobId: str
    totalSubmitted: int
    successfulCount: int
    failedCount: int
    averageConfidence: float
    products: List[EnrichedProduct]
    errors: List[Dict[str, Any]] = []

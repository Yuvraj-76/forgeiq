from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime


class ProductStatus(str, Enum):
    READY_FOR_REVIEW = "Ready for Review"
    HIGH_CONFIDENCE = "High Confidence"
    MEDIUM_CONFIDENCE = "Medium Confidence"
    LOW_CONFIDENCE = "Low Confidence"
    NEEDS_REVIEW = "Needs Review"
    REJECTED = "Rejected"


class ReviewStatus(str, Enum):
    VALIDATED = "Validated"
    APPROVED = "Approved"
    NEEDS_REVIEW = "Needs Review"
    PENDING = "Pending"
    MODIFIED = "Modified"
    FLAGGED = "Flagged"


class RawSupplierProduct(BaseModel):
    """Raw input provided by supplier/distributor"""
    brand: str = Field(..., description="Brand or manufacturer name", example="Bosch")
    partNumber: str = Field(..., description="MPN or model identifier", example="GSR 120-LI")
    shortDescription: str = Field(..., description="Messy or brief supplier description", example="12v drill driver cordless")
    supplierSku: Optional[str] = Field(None, description="Optional supplier SKU")
    supplierPrice: Optional[float] = Field(None, description="Optional raw price")
    categoryHint: Optional[str] = Field(None, description="Optional raw supplier category")
    extraMetadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary raw metadata")


class ProductIdentification(BaseModel):
    """Product identification and OEM resolution match"""
    brand: str
    partNumber: str
    matchedProduct: str
    matchType: str = Field("exact", description="exact | approximate | uncertain | generic")
    confidence: int = Field(98, ge=0, le=100)
    evidence: str
    source: str = "manufacturer"
    sourceUrl: Optional[str] = None


class ProductAttribute(BaseModel):
    """Standardized attribute with full provenance & validation metadata"""
    id: str = Field(..., description="Unique attribute ID")
    name: str = Field(..., description="Standardized attribute key (e.g. Voltage, Chuck Size)")
    value: Optional[Union[str, int, float]] = Field(None, description="Normalized attribute value or null if Not Found")
    unit: Optional[str] = Field(None, description="Standardized unit (e.g. V, mm, RPM)")
    source: Optional[str] = Field(None, description="Data origin (e.g. supplier_data, manufacturer, trusted_reference, ai_inference, null if Not Found)")
    sourceUrl: Optional[str] = Field("", description="Direct URL to official OEM reference or datasheet")
    confidence: int = Field(..., ge=0, le=100, description="Confidence score calculated from evidence source")
    validationStatus: str = Field("verified", description="verified | inferred | conflicting | Not Found | unverified")
    evidence: Optional[str] = Field(None, description="Verbatim snippet or context used for extraction")
    reason: Optional[str] = Field(None, description="AI explanation of extraction/normalization rationale")
    isStandard: bool = Field(True, description="Whether attribute belongs to standard taxonomy schema")
    verifiedByUser: bool = Field(False, description="Whether approved by human catalog specialist")


class ProductFeature(BaseModel):
    """Structured feature backed by explicit source and evidence"""
    feature: str = Field(..., description="Factual, verified feature statement without unbacked marketing claims")
    source: Optional[str] = Field("manufacturer", description="Data origin e.g. manufacturer, supplier_data, trusted_reference")
    sourceUrl: Optional[str] = Field("", description="Direct link to source document")
    evidence: Optional[str] = Field(None, description="Verbatim quote or specification parameter proving the feature")
    confidence: int = Field(95, ge=0, le=100, description="Evidence-backed confidence score")
    validationStatus: str = Field("verified", description="verified | inferred | conflicting | Not Found")


class TraceabilityStep(BaseModel):
    """Single stage trace in the 8-stage enrichment pipeline"""
    stepId: Optional[int] = None
    stage: str
    title: Optional[str] = None
    status: str = "completed"
    detail: Optional[str] = None
    source: Optional[str] = None
    decision: Optional[str] = None
    evidence: Optional[str] = None
    confidence: Optional[int] = None
    validation: Optional[str] = "verified"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class EnrichedProduct(BaseModel):
    """Fully structured catalog product with high-confidence enrichment & lineage"""
    id: str = Field(..., description="Unique internal catalog product ID")
    sku: str = Field(..., description="Standardized Master SKU")
    brand: str
    partNumber: str
    inputDescription: Optional[str] = None
    rawDescription: Optional[str] = None
    
    # Standardized Catalog Fields
    productTitle: str = Field(..., description="Clean, professional, high-converting product title")
    brandStandardized: Optional[str] = None
    categoryPath: str = Field(..., description="Taxonomy hierarchy e.g. Tools > Power Tools > Drills > Cordless Drills")
    category: Optional[List[str]] = Field(default_factory=list)
    categoryId: Optional[str] = None
    categoryStatus: Optional[str] = "Verified"
    description: Optional[str] = None
    
    # Product Identification Resolution
    productIdentification: Optional[ProductIdentification] = None
    
    # Specs & Content
    attributes: List[ProductAttribute] = Field(default_factory=list)
    features: List[Union[ProductFeature, Dict[str, Any], str]] = Field(default_factory=list, description="Evidence-backed feature items")
    marketingSummary: Optional[str] = Field(None, description="Standardized e-commerce marketing overview")
    seoKeywords: List[str] = Field(default_factory=list, description="Relevant search & indexing keywords")
    
    # Scoring & Lineage
    confidence: int = Field(..., ge=0, le=100, description="Overall weighted confidence score")
    confidenceBand: str = Field("High", description="High | Medium | Low")
    status: str = Field("Ready for Review", description="Ready for Review | High Confidence | Medium Confidence | Low Confidence | Needs Review")
    reviewStatus: str = Field("Validated", description="Validated | Needs Review | Approved | Pending | Modified | Flagged")
    
    # Traceability Pipeline Records
    traceability: List[TraceabilityStep] = Field(default_factory=list)
    
    # Enterprise Metadata & Master Attributes
    extraMetadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps & Tracking
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    processedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    sourceSystem: str = "CatalogAI-ZeroHallucination-Engine"


class AttributeUpdateRequest(BaseModel):
    """Payload for manual review and attribute editing"""
    name: Optional[str] = None
    value: Optional[Union[str, int, float]] = None
    source: Optional[str] = None
    confidence: Optional[int] = None
    validationStatus: Optional[str] = None
    reason: Optional[str] = None

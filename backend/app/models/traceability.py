from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EvidenceType(str, Enum):
    DIRECT_TEXT = "direct_supplier_text"
    PATTERN_REGEX = "regex_pattern_match"
    TAXONOMY_DICTIONARY = "taxonomy_dictionary_match"
    AI_INFERENCE = "gemini_semantic_inference"
    EXTERNAL_SPEC_DB = "verified_specification_database"
    HUMAN_OVERRIDE = "human_specialist_override"


class TraceabilityNode(BaseModel):
    """Detailed audit node for field level provenance"""
    fieldKey: str
    extractedValue: str
    standardizedValue: str
    evidenceType: EvidenceType
    evidenceSnippet: Optional[str] = None
    reasoning: str
    sourceLocation: str
    confidenceScore: int
    validationChecks: List[str] = Field(default_factory=list)


class TraceabilityRecord(BaseModel):
    """Complete product level traceability graph"""
    productId: str
    sku: str
    inputHash: str
    pipelineVersion: str = "v2.5.0-gemini"
    executionTimeMs: int
    stagesExecuted: List[Dict[str, Any]]
    fieldTraces: List[TraceabilityNode]

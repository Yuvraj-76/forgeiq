import pytest
from app.models.enrichment import EnrichmentRequest
from app.services.enrichment_service import enrichment_service
from app.services.validation_service import validation_service
from app.services.confidence_service import confidence_service
from app.models.product import ProductAttribute


@pytest.mark.asyncio
async def test_enrich_single_product_pipeline():
    request = EnrichmentRequest(
        brand="Bosch",
        partNumber="GSR 120-LI",
        shortDescription="12v drill driver cordless 10mm 1500rpm"
    )
    
    enriched = await enrichment_service.enrich_single_product(request, persist=False)
    
    assert enriched.brand == "Bosch"
    assert "Bosch" in enriched.productTitle
    assert enriched.confidence >= 80
    assert len(enriched.attributes) >= 3
    assert len(enriched.traceability) == 8  # 8-stage pipeline
    assert enriched.categoryPath is not None
    assert enriched.sku.startswith("CAT-BOS")


def test_confidence_scoring():
    attrs = [
        ProductAttribute(
            id="a1",
            name="Voltage",
            value="12",
            unit="V",
            source="supplier_description",
            confidence=98,
            validationStatus="verified"
        ),
        ProductAttribute(
            id="a2",
            name="Chuck Size",
            value="10",
            unit="mm",
            source="ai_inference",
            confidence=92,
            validationStatus="verified"
        )
    ]
    
    overall = confidence_service.compute_overall_confidence(attrs, category_matched=True)
    assert 85 <= overall <= 100


def test_attribute_validation():
    attr = ProductAttribute(
        id="a1",
        name="Voltage",
        value="12",
        unit="V",
        source="supplier_description",
        confidence=98
    )
    status, warnings = validation_service.validate_attribute(attr)
    assert status == "verified"
    assert len(warnings) == 0

    abnormal_attr = ProductAttribute(
        id="a2",
        name="Voltage",
        value="250",
        unit="V",
        source="supplier_description",
        confidence=90
    )
    status2, warnings2 = validation_service.validate_attribute(abnormal_attr)
    assert status2 == "warning"
    assert len(warnings2) > 0

import pytest
from app.services.gemini_service import gemini_service


@pytest.mark.asyncio
async def test_gemini_service_enrichment():
    res = await gemini_service.enrich_raw_product(
        brand="Bosch",
        part_number="GSR 120-LI",
        short_description="12v drill driver cordless"
    )
    
    assert res is not None
    assert "productTitle" in res
    assert "categoryPath" in res
    assert "attributes" in res
    assert isinstance(res["attributes"], list)
    assert len(res["attributes"]) >= 2
    assert "features" in res

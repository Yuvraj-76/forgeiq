import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_get_products():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert len(products) > 0


def test_enrich_endpoint():
    payload = {
        "brand": "DeWalt",
        "partNumber": "DCD771C2",
        "shortDescription": "20v max compact drill kit 1/2 inch"
    }
    response = client.post("/api/v1/enrich", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["brand"] == "DeWalt"
    assert "20V" in data["productTitle"] or "20" in data["productTitle"]
    assert data["confidence"] > 80
    assert len(data["traceability"]) > 0


def test_analytics_endpoint():
    response = client.get("/api/v1/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "confidenceDistribution" in data
    assert "enrichmentTimeline" in data


def test_taxonomy_endpoint():
    response = client.get("/api/v1/catalog/taxonomy")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_export_csv_endpoint():
    response = client.get("/api/v1/catalog/export?format=csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]

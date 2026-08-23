# CatalogAI — AI Product Data Enrichment & Cataloging Engine Backend

Production-grade Python/FastAPI backend that transforms incomplete, messy supplier product data into structured, standardized, retail-ready e-commerce catalog data using **Google Gemini** with complete field-level **Lineage & Traceability**.

---

## 🏗️ Architecture

```
backend/
├── app/
│   ├── main.py                     # FastAPI application entry & CORS
│   ├── api/                        # Modular API route controllers
│   │   ├── routes_products.py      # /enrich, /products, human review overrides
│   │   ├── routes_bulk.py          # /bulk-enrich, /bulk-upload (CSV/XLSX)
│   │   ├── routes_catalog.py       # /catalog/taxonomy, /catalog/export (CSV/XLSX/JSON)
│   │   ├── routes_analytics.py     # /analytics KPI dashboards
│   │   └── routes_traceability.py  # /traceability 8-stage audit logs & DAG graphs
│   ├── models/                     # Pydantic schemas
│   │   ├── product.py              # RawSupplierProduct, ProductAttribute, EnrichedProduct
│   │   ├── enrichment.py           # EnrichmentRequest, BulkEnrichmentResponse
│   │   ├── traceability.py         # TraceabilityNode, EvidenceType
│   │   └── catalog.py              # FilterParams, ExportRequest, CatalogStats
│   ├── services/                   # Business logic layer
│   │   ├── gemini_service.py       # Google GenAI SDK integration with fallback
│   │   ├── enrichment_service.py   # 8-stage enrichment pipeline orchestrator
│   │   ├── taxonomy_service.py     # Deep tree classification & keyword matching
│   │   ├── validation_service.py   # Physical constraint & unit validation
│   │   ├── confidence_service.py   # Weighted confidence scoring engine
│   │   └── export_service.py       # Pandas / openpyxl CSV & Excel generation
│   ├── data/                       # Taxonomy and seed master records
│   │   ├── taxonomy.json           # Multi-level hierarchical taxonomy
│   │   ├── sample_products.json    # Standardized seed products
│   │   └── seed_data.py            # Data loading utilities
│   ├── utils/                      # Helper utilities
│   │   ├── normalizers.py          # Units (V, mm, RPM, Nm) and brand formulas
│   │   ├── prompt_templates.py     # Gemini system & structured output prompts
│   │   └── logger.py               # Configured logging
│   └── database/                   # Storage abstraction
│       ├── repository.py           # In-memory repository with faceted filters
│       └── session.py              # Connection session manager
├── tests/                          # Pytest suite
│   ├── test_enrichment.py
│   ├── test_routes.py
│   └── test_gemini.py
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ⚡ 8-Stage Traceability Pipeline

Each product enrichment passes through 8 verifiable provenance stages:

1. **Input Parsing**: Tokenizes and sanitizes raw input strings.
2. **Model Identification**: Canonical brand mapping and MPN extraction.
3. **Taxonomy Classification**: Hierarchical classification against `taxonomy.json`.
4. **Attribute Extraction**: Multi-factor specification extraction with standard units.
5. **Title & Copy Synthesis**: Retail naming formula: `[Brand] [Part Number] [Form Factor] [Specs] [Product Type]`.
6. **Validation Engine**: Physical bounds checking (e.g. voltage ranges, chuck diameters).
7. **Confidence Scoring**: Weighted composite computation:
   $$\text{Confidence} = 0.60 \times \text{Avg}(\text{Attrs}) + 0.25 \times \text{Taxonomy} + 0.15 \times \text{Title}$$
8. **Catalog Finalization**: Generates Master SKU and stores full lineage audit trail.

---

## 🚀 Getting Started

### 1. Setup Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
DEMO_MODE=false
```

*(Note: If `GEMINI_API_KEY` is omitted or `DEMO_MODE=true`, the engine automatically runs in deterministic high-accuracy demo mode).*

### 3. Run Development Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🐳 Running with Docker

```bash
docker-compose up --build
```

---

## 🧪 Running Tests

```bash
pytest tests/ -v
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/enrich` | Enrich single supplier product |
| `POST` | `/api/v1/bulk-enrich` | Batch enrich JSON array of products |
| `POST` | `/api/v1/bulk-upload` | Upload CSV / Excel spreadsheet for enrichment |
| `GET` | `/api/v1/products` | Faceted search with brand, category, confidence filters |
| `GET` | `/api/v1/products/{id}` | Get product master record by ID |
| `PUT` | `/api/v1/products/{id}/attributes/{attr_id}` | Human-in-the-loop manual review override |
| `GET` | `/api/v1/traceability/{id}` | 8-stage execution audit trail |
| `GET` | `/api/v1/traceability/{id}/graph` | Visual DAG lineage nodes and edges |
| `GET` | `/api/v1/catalog/export` | Download catalog in CSV / Excel / JSON |
| `GET` | `/api/v1/catalog/taxonomy` | Hierarchical taxonomy tree |
| `GET` | `/api/v1/analytics` | High-level KPIs, accuracy rates, and time savings |
| `GET` | `/api/health` | System health and Gemini connection status |

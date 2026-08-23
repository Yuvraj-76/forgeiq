# CatalogAI — Enterprise AI Product Data Enrichment & Cataloging Engine

> **Zero-Hallucination, Evidence-Backed eCommerce Product Intelligence and MDM Catalog Automation**

---

## 📌 Overview

**CatalogAI** is an industrial-grade product data enrichment and cataloging platform engineered for distributors, manufacturers, and eCommerce enterprises. It transforms sparse, inconsistent, or raw supplier product listings into structured, validated, and omnichannel-ready master catalog records with **100% verifiable source attribution, mathematically grounded confidence scoring, and an 8-stage audit traceability pipeline**.

Unlike conventional LLM tools that hallucinate missing specifications, CatalogAI adheres strictly to the **Zero-Hallucination Protocol**: unverified attributes remain explicitly marked as `"Not Found"`, conflicting supplier claims trigger review warnings, and every feature statement is backed by verbatim evidence from manufacturer datasheets or supplier manifests.

---

## 🚀 Key Capabilities & Architectural Pillars

| Pillar | Description |
| :--- | :--- |
| **🛡️ Zero-Hallucination Engine** | Prohibits speculative attributes or invented certifications. If evidence is absent, fields return `value: null` with `validationStatus: "Not Found"` and `confidence: 0`. |
| **🔍 Evidence & Source Attribution** | Every specification and feature bullet tracks exact data origins (`manufacturer`, `supplier_data`, `trusted_reference`, `knowledge_base`, `ai_inference`) with verbatim evidence quotes and OEM URLs. |
| **⚖️ Dynamic Confidence Scoring** | Deterministic, evidence-weighted composite score (0–100%) calculated from source authority and data completeness. |
| **⚠️ Conflict Detection & Flagging** | Automatically identifies contradictions between supplier claims (e.g., *18V drill*) and official OEM references (*12V rating*), routing items to a human review queue. |
| **📜 8-Stage Lineage & Traceability** | Visualized, auditable step-by-step pipeline documenting data ingestion, identification, retrieval, taxonomy, extraction, validation, scoring, and catalog generation. |
| **📊 Enterprise MDM & 252-Header Support** | High-throughput bulk processing with support for Microsoft Excel (`.xlsx`, `.xls`), CSV, and 252-column Unilog/MDM catalog export formats. |
| **🧪 Built-in Benchmark Test Suite** | Pre-configured evaluation tests: **Test A** (Good Product), **Test B** (Incomplete/Zero-Hallucination), and **Test C** (Conflicting Data). |

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React 19 + Vite)                         │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────────┐  │
│  │ Single Enrich │ │  Bulk Import  │ │ Master Catalog│ │ Analytics & Review   │  │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └──────────┬───────────┘  │
│          └─────────────────┼─────────────────┼────────────────────┘              │
│                            ▼                 ▼                                   │
│            ┌──────────────────────────────────────────────────┐                  │
│            │  Interactive Evidence Grid & 8-Stage Trace Panel │                  │
│            └──────────────────────────────────────────────────┘                  │
└────────────────────────────────────┬────────────────────────────────────────────┘
                                     │ HTTP / REST APIs
┌────────────────────────────────────▼────────────────────────────────────────────┐
│                             BACKEND (FastAPI / Python)                          │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                       Enrichment Pipeline Orchestrator                    │  │
│  │                                                                           │  │
│  │  Stage 1: Raw Ingestion & Sanitization                                    │  │
│  │  Stage 2: Product Identification & OEM Match (Exact / Approx / Uncertain) │  │
│  │  Stage 3: Verified Datasheet & Context Retrieval                          │  │
│  │  Stage 4: Taxonomy Classification & Hierarchy Mapping                     │  │
│  │  Stage 5: Structured Attribute Extraction & Unit Normalization           │  │
│  │  Stage 6: Zero-Hallucination Validation & Conflict Engine                 │  │
│  │  Stage 7: Evidence-Weighted Dynamic Confidence Scoring                    │  │
│  │  Stage 8: Master Catalog Assembly & Internal Quality Checks (A-J)         │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│          │                                 │                       │            │
│          ▼                                 ▼                       ▼            │
│  ┌───────────────┐                 ┌───────────────┐       ┌─────────────────┐  │
│  │ Gemini API    │                 │ Ground Truth  │       │ JSON / CSV /    │  │
│  │ (@google/genai│                 │ Knowledge Base│       │ XLSX Exporters  │  │
│  └───────────────┘                 └───────────────┘       └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
├── .env.example                       # Environment variables template
├── package.json                       # Frontend dependencies & build scripts
├── vite.config.ts                     # Vite + TailwindCSS configuration
├── metadata.json                      # Application metadata and runtime settings
│
├── src/                               # Frontend Source Code
│   ├── App.jsx                        # Root React Router application
│   ├── index.css                      # Tailwind CSS v4 entry point
│   ├── main.jsx                       # React DOM root mounting
│   │
│   ├── components/                    # Reusable UI Components
│   │   ├── AttributeTable.jsx         # 5-column verification grid with evidence drawers
│   │   ├── ConfidenceBadge.jsx        # Colored confidence chip
│   │   ├── ConfidenceScore.jsx        # Gauge & circular confidence visualizer
│   │   ├── EmptyState.jsx             # Visual fallback for empty lists
│   │   ├── EnrichmentResult.jsx       # Complete enriched product view
│   │   ├── EvidenceCard.jsx           # Expandable provenance card
│   │   ├── FeatureList.jsx            # Evidence-backed feature highlights
│   │   ├── FileUploader.jsx           # Drag-and-drop CSV/XLSX uploader
│   │   ├── Header.jsx                 # Global application navigation bar
│   │   ├── ProcessingSteps.jsx        # Live progress bar with animated stages
│   │   ├── ProductCard.jsx            # Catalog listing card
│   │   ├── ProductInputForm.jsx       # Single product enrichment input form
│   │   ├── ProductTable.jsx           # Bulk review table with status filters
│   │   ├── ProgressBar.jsx            # Percentage completion bar
│   │   ├── ReviewPanel.jsx            # Catalog specialist approval sidebar
│   │   ├── Sidebar.jsx                # Collapsible main navigation
│   │   ├── StatCard.jsx               # Dashboard analytical metric card
│   │   └── TraceabilityPanel.jsx      # 8-stage audit lineage interactive viewer
│   │
│   ├── pages/                         # Application Views / Routes
│   │   ├── Analytics.jsx              # Accuracy, coverage & throughput metrics
│   │   ├── BulkUpload.jsx             # Multi-SKU batch processing & export
│   │   ├── Catalog.jsx                # Filterable repository of enriched products
│   │   ├── Dashboard.jsx              # System health, recent jobs, and metrics
│   │   ├── Enrichment.jsx             # Interactive single-item enrichment lab
│   │   ├── ProductDetails.jsx         # Deep-dive inspection & 252-column grid
│   │   ├── Settings.jsx               # API keys, confidence thresholds & taxonomy
│   │   └── Traceability.jsx           # Full pipeline audit log & lineage explorer
│   │
│   ├── services/                      # API Clients & Benchmark Services
│   │   ├── api.js                     # Axios backend API client with fallback
│   │   ├── mockAI.js                  # Client-side Zero-Hallucination enrichment engine
│   │   └── mockData.js                # Ground truth test cases (Test A, B, C)
│   │
│   └── utils/                         # Utility Libraries
│       ├── confidence.js              # Confidence scoring & badge color math
│       ├── csvParser.js               # CSV & XLSX streaming parser/exporter
│       └── enterpriseCatalogSchema.js # 252-column Unilog/MDM export transformer
│
└── backend/                           # Python FastAPI Backend
    ├── app/
    │   ├── main.py                    # FastAPI server entry point & CORS
    │   ├── api/                       # API Route definitions
    │   │   ├── routes_enrichment.py   # Single & streaming enrichment routes
    │   │   ├── routes_bulk.py         # Batch file upload & processing
    │   │   ├── routes_catalog.py      # Catalog search, filter & export
    │   │   └── routes_analytics.py    # Metric aggregation
    │   ├── database/                  # In-memory / persistent product repository
    │   ├── models/                    # Pydantic Schemas & Domain Models
    │   │   ├── product.py             # Product, Attribute, Feature & Trace models
    │   │   ├── enrichment.py          # Request / Response payloads
    │   │   └── enterprise_schema.py   # 252-header Unilog specification
    │   ├── services/                  # Business Logic & Service Layers
    │   │   ├── enrichment_service.py  # 8-stage pipeline orchestrator
    │   │   ├── gemini_service.py      # Gemini AI integration with zero-hallucination rules
    │   │   ├── taxonomy_service.py    # UNSPSC & eClass taxonomy classification
    │   │   ├── validation_service.py  # Physics constraints & conflict checks
    │   │   ├── confidence_service.py  # Dynamic confidence calculation
    │   │   └── export_service.py      # Excel & 252-column CSV generation
    │   └── utils/                     # Normalizers, regex formatters & loggers
    ├── requirements.txt               # Backend Python dependencies
    └── Dockerfile                     # Container deployment specification
```

---

## ⚙️ Core Data Models

### 1. Product Attribute (`ProductAttribute`)
```json
{
  "id": "attr-1",
  "name": "Voltage Rating",
  "value": "12 V",
  "unit": "V",
  "source": "manufacturer",
  "sourceUrl": "https://www.bosch-professional.com/products/gsr-120-li-06019G8000",
  "confidence": 98,
  "validationStatus": "verified",
  "evidence": "Battery voltage: 12 V",
  "reason": "Directly supported by official manufacturer specification."
}
```

### 2. Evidence-Based Feature (`ProductFeature`)
```json
{
  "feature": "Two-speed no-load speed of 0–400 / 0–1500 RPM.",
  "source": "manufacturer",
  "sourceUrl": "https://www.bosch-professional.com/products/gsr-120-li-06019G8000",
  "evidence": "No-load speed (1st gear / 2nd gear): 0 – 400 / 0 – 1,500 rpm",
  "confidence": 95,
  "validationStatus": "verified"
}
```

### 3. Missing/Unverified Attribute (Zero-Hallucination)
```json
{
  "id": "attr-7",
  "name": "Certifications",
  "value": null,
  "unit": null,
  "source": null,
  "sourceUrl": "",
  "confidence": 0,
  "validationStatus": "Not Found",
  "evidence": null,
  "reason": "Zero-Hallucination: No certification evidence found in supplier or manufacturer documentation."
}
```

---

## 🧪 Built-In Benchmark Evaluation Scenarios

The engine includes 3 pre-built evaluation benchmarks ready for testing in the UI:

1. **Test A: Good Product (`Bosch GSR 120-LI`)**
   - **Input**: `Brand: Bosch`, `Part: GSR 120-LI`, `Desc: 12v drill driver cordless`
   - **Expected Outcome**: Exact match (98% ID confidence), 6 verified attributes (`12 V`, `10 mm chuck`, `30 Nm torque`), 1 unsupported field marked `"Not Found"`, evidence-backed features without marketing fluff. `reviewStatus: "Validated"`, `status: "Ready for Review"`.

2. **Test B: Incomplete Product (`Unknown ABC-123`)**
   - **Input**: `Brand: Unknown`, `Part: ABC-123`, `Desc: industrial tool`
   - **Expected Outcome**: Uncertain match (30% confidence). Specifications (voltage, chuck size, weight, certifications) are marked `"Not Found"` with `0%` confidence. Proves the engine never guesses missing specs. `reviewStatus: "Needs Review"`.

3. **Test C: Conflicting Data (`Bosch GSR 120-LI [18V Supplier Claim]`)**
   - **Input**: `Brand: Bosch`, `Part: GSR 120-LI`, `Desc: 18v heavy duty cordless drill driver brushless`
   - **Expected Outcome**: Conflict detected! Supplier text claims `18V` and `brushless`, but OEM reference proves `12V` and `brushed`. Field marked `validationStatus: "conflicting"` with side-by-side evidence; composite confidence reduced to 58%, routed to `Needs Review`.

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher (for backend)
- **Package Manager**: `npm` or `bun`

### Frontend Quickstart
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```
Access the application at `http://localhost:3000`.

### Backend Quickstart (Optional)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🛡️ Internal Data Quality Checks (A–J)

Before any enriched catalog record is finalized, it passes through 10 strict validation gates:

- **Check A**: Every factual attribute must have verified evidence.
- **Check B**: Every verified attribute must have an explicit source origin.
- **Check C**: Every feature highlight must have supporting ground-truth text.
- **Check D**: Unsupported/unverifiable values must be explicitly marked `"Not Found"`.
- **Check E**: Contradicting claims must be marked `"conflicting"`.
- **Check F**: Product identification match type must accurately reflect brand/model certainty.
- **Check G**: Confidence scores must be mathematically consistent with evidence sources.
- **Check H**: Status and approval claims must reflect true validation completeness.
- **Check I**: Traceability decisions must report truthful, dynamic counts (no fabricated stats).
- **Check J**: No invented URLs, certifications, or imaginary specifications.

---

## 📄 License & Compliance

Developed for enterprise product catalog management and automated eCommerce enrichment. Built with strict data integrity standards for B2B distributors and marketplaces.

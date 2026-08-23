# CatalogAI — Comprehensive Technical Project Documentation

> Complete architecture, API reference, data pipeline, and component documentation for the AI Product Data Enrichment & Cataloging Engine.

---

## Table of Contents

1. [System Architecture & Design Philosophy](#1-system-architecture--design-philosophy)
2. [Zero-Hallucination & Evidence Protocol](#2-zero-hallucination--evidence-protocol)
3. [The 8-Stage Enrichment Pipeline](#3-the-8-stage-enrichment-pipeline)
4. [Confidence Scoring & Mathematical Formulation](#4-confidence-scoring--mathematical-formulation)
5. [Data Models & Schema Reference](#5-data-models--schema-reference)
6. [Frontend Component Architecture](#6-frontend-component-architecture)
7. [Backend API Reference](#7-backend-api-reference)
8. [Enterprise MDM & 252-Header Mapping](#8-enterprise-mdm--252-header-mapping)
9. [Internal Quality Assurance Checks (A–J)](#9-internal-quality-assurance-checks-aj)
10. [Benchmark Test Suite & Verification Results](#10-benchmark-test-suite--verification-results)

---

## 1. System Architecture & Design Philosophy

The **CatalogAI Engine** is designed as a hybrid full-stack system comprising:
- **Client Layer**: React 19 SPA running on Vite 6 and Tailwind CSS v4, providing instantaneous interactive exploration, 5-column verification grids, evidence popovers, 8-stage lineage diagrams, and client-side XLSX/CSV processing.
- **Service Layer**: Zero-hallucination parsing engines with dual-mode support (Client-side offline processing via `mockAI.js` and server-side production processing via FastAPI & Gemini API).
- **Export & Schema Layer**: Enterprise data transformers capable of standard e-commerce CSV outputs or full 252-column Unilog/MDM catalog structures.

### Architectural Principles
1. **Verifiability Over Completeness**: Prefer returning `null` / `"Not Found"` with zero confidence over generating plausible but ungrounded specifications.
2. **Deterministic Provenance**: Every extracted field must store its source origin, reference URL, verbatim extraction evidence, and validation status.
3. **Transparent Traceability**: Users can inspect all intermediate stages of ingestion, authority resolution, context retrieval, normalization, and scoring.

---

## 2. Zero-Hallucination & Evidence Protocol

### Source Attribution Hierarchy
The system categorizes all data points into five explicit provenance tiers:

| Source Identifier | Description | Reliability Weight |
| :--- | :--- | :--- |
| `manufacturer` | Direct official OEM datasheets, manuals, or manufacturer catalog indexes | **95% – 98%** |
| `supplier_data` | Explicitly provided values extracted from the supplier's raw text/file | **85% – 95%** |
| `trusted_reference` | Industry standard databases (e.g. UNSPSC, DIN, ISO, GS1, ETIM) | **90% – 95%** |
| `knowledge_base` | Internal verified physical rules, constraint validation checks | **90% – 95%** |
| `ai_inference` | Model-inferred or approximated values (flagged for review) | **40% – 60%** |
| `null` | No evidence available (`validationStatus: "Not Found"`) | **0%** |

### Feature Verification Constraints
Features are generated strictly from verified specifications. Marketing phrases such as:
- *"Industrial-grade"*
- *"Heavy-duty construction"*
- *"Designed for demanding applications"*
- *"Commercial and residential use"*

are **prohibited** unless explicit textual evidence in the manufacturer documentation confirms them.

---

## 3. The 8-Stage Enrichment Pipeline

Every item ingested into CatalogAI passes through 8 formal pipeline stages:

```
[1. Raw Ingestion] ──► [2. Identification] ──► [3. Retrieval] ──► [4. Taxonomy]
       │                       │                      │                 │
       ▼                       ▼                      ▼                 ▼
[8. Master Assembly] ◄── [7. Scoring] ◄── [6. Validation] ◄── [5. Extraction]
```

1. **Stage 1: Raw Supplier Input** — Ingests and tokenizes raw supplier attributes (`brand`, `partNumber`, `shortDescription`). Cleans noise tokens.
2. **Stage 2: Product Identification** — Matches tokens against master catalogs to assign `matchType` (`exact`, `approximate`, `uncertain`) and base identity confidence.
3. **Stage 3: Context Retrieval** — Queries verified technical documentation and OEM reference libraries.
4. **Stage 4: Taxonomy Mapping** — Classifies products into a 4-tier standardized hierarchy (e.g., `Tools & Hardware > Power Tools > Drills > Cordless Drills`).
5. **Stage 5: Attribute Extraction** — Extracts numerical specifications and normalizes standard units (`V`, `mm`, `RPM`, `Nm`, `kg`, `Ah`).
6. **Stage 6: Attribute Validation** — Executes physical constraint checks (e.g., Li-Ion voltage ranges, chuck capacity limits) and flags contradictions as `conflicting`.
7. **Stage 7: Confidence Scoring** — Aggregates evidence-weighted scores across all extracted fields.
8. **Stage 8: Final Catalog Generation** — Compiles the master record, generates verified features, and assigns final review statuses (`Validated`, `Needs Review`).

---

## 4. Confidence Scoring & Mathematical Formulation

The aggregate product confidence score $C_{product}$ is dynamically computed:

$$C_{product} = \begin{cases} 
\text{min}(45, C_{ident}) & \text{if } \text{matchType} = \text{"uncertain"} \\
\text{min}(60, \overline{C_{valid}} - 20) & \text{if } N_{conflicts} > 0 \\
\frac{1}{N_{valid}} \sum_{i=1}^{N_{valid}} C_i & \text{if } N_{valid} > 0 \\
50 & \text{otherwise}
\end{cases}$$

### Status & Review Logic
- **`Ready for Review` / `Validated`**: $C_{product} \ge 85\%$, `matchType` = `exact`, $N_{conflicts} = 0$, and $N_{not\_found} \le 1$.
- **`Medium Confidence` / `Needs Review`**: $50\% \le C_{product} < 85\%$, or $N_{conflicts} > 0$.
- **`Low Confidence` / `Needs Review`**: $C_{product} < 50\%$, or `matchType` = `uncertain`.
- **`Approved`**: Reserved exclusively for explicit human catalog specialist sign-off.

---

## 5. Data Models & Schema Reference

### `EnrichedProduct`
```typescript
interface EnrichedProduct {
  id: string;
  sku: string;
  brand: string;
  brandStandardized?: string;
  partNumber: string;
  inputDescription?: string;
  productTitle: string;
  category: string[];
  categoryPath: string;
  categoryStatus: 'Verified' | 'Needs Review';
  description: string;
  productIdentification: ProductIdentification;
  attributes: ProductAttribute[];
  features: ProductFeature[];
  confidence: number;
  status: 'Ready for Review' | 'High Confidence' | 'Medium Confidence' | 'Low Confidence' | 'Needs Review';
  reviewStatus: 'Validated' | 'Approved' | 'Needs Review' | 'Pending' | 'Modified';
  traceability: TraceabilityStep[];
  processedAt: string;
}
```

### `ProductAttribute`
```typescript
interface ProductAttribute {
  id: string;
  name: string;
  value: string | number | null;
  unit?: string | null;
  source: 'manufacturer' | 'supplier_data' | 'trusted_reference' | 'knowledge_base' | 'ai_inference' | null;
  sourceUrl?: string;
  confidence: number;
  validationStatus: 'verified' | 'inferred' | 'conflicting' | 'Not Found';
  evidence?: string | null;
  reason?: string | null;
}
```

### `ProductFeature`
```typescript
interface ProductFeature {
  feature: string;
  source: string;
  sourceUrl: string;
  evidence: string;
  confidence: number;
  validationStatus: 'verified' | 'inferred' | 'conflicting' | 'Not Found';
}
```

---

## 6. Frontend Component Architecture

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| **`EnrichmentResult`** | `/src/components/EnrichmentResult.jsx` | Master result card displaying title, status, score, attributes, features, and export actions |
| **`AttributeTable`** | `/src/components/AttributeTable.jsx` | 5-column table (*Attribute, Value, Source, Confidence, Status*) with interactive filter pills and evidence drawers |
| **`FeatureList`** | `/src/components/FeatureList.jsx` | Evidence-grounded feature highlights with OEM links and evidence toggles |
| **`TraceabilityPanel`** | `/src/components/TraceabilityPanel.jsx` | Visualizes the 8-stage audit trail with step badges and dynamic field counts |
| **`ProductInputForm`** | `/src/components/ProductInputForm.jsx` | Manual input form with quick-fill buttons for Test A, Test B, and Test C |
| **`FileUploader`** | `/src/components/FileUploader.jsx` | Drag-and-drop file ingestion for `.xlsx`, `.xls`, and `.csv` files |
| **`ProductTable`** | `/src/components/ProductTable.jsx` | Bulk catalog inspection grid with batch approval and multi-format exports |

---

## 7. Backend API Reference

### Base URL: `http://localhost:8000/api`

#### 1. Single Product Enrichment
- **`POST /api/enrich/product`**
- **Request Body**:
  ```json
  {
    "brand": "Bosch",
    "partNumber": "GSR 120-LI",
    "shortDescription": "12v drill driver cordless",
    "categoryHint": "Power Tools"
  }
  ```
- **Response**: `EnrichedProduct` JSON object.

#### 2. Streaming Real-Time Enrichment
- **`POST /api/enrich/stream`**
- Server-Sent Events (SSE) streaming progress step-by-step through Stages 1–8.

#### 3. Bulk CSV / Excel Ingestion
- **`POST /api/bulk/upload`**
- **Form Data**: `file` (`.csv`, `.xlsx`, `.xls`)
- **Response**: Summary of parsed rows, identified headers, and job ID.

#### 4. Master Catalog Export
- **`GET /api/catalog/export?format=xlsx&schema=enterprise`**
- Exports enriched repository matching either Standard (15 columns) or Enterprise (252 headers) format.

---

## 8. Enterprise MDM & 252-Header Mapping

The engine integrates a transformer (`/src/utils/enterpriseCatalogSchema.js` and `/backend/app/models/enterprise_schema.py`) supporting all 252 industrial PIM/MDM headers, including:
- **Core Identifiers**: `Brand`, `Manufacturer Part Number`, `GTIN`, `UPC`, `UNSPSC Code`
- **Taxonomy**: `Category Level 1` through `Category Level 5`, `Taxonomy Code`
- **Product Content**: `Master Product Title`, `Long Description`, `Feature Bullet 1-10`
- **Technical Specs**: `Voltage`, `Battery Chemistry`, `Chuck Size`, `No-Load Speed`, `Max Torque`, `Weight`, `Certifications`
- **Logistics & Packaging**: `Country of Origin`, `Package Dimensions`, `Freight Class`, `Harmonized Tariff Code`

---

## 9. Internal Quality Assurance Checks (A–J)

Every output is automatically verified against 10 data-integrity checks:

```
[Check A: Factual Evidence Present] ──► PASS
[Check B: Source Origin Explicit]   ──► PASS
[Check C: Feature Grounding]        ──► PASS
[Check D: Missing Specs 'Not Found']──► PASS
[Check E: Contradictions Flagged]   ──► PASS
[Check F: Exact Match Validated]    ──► PASS
[Check G: Dynamic Confidence Math]  ──► PASS
[Check H: Justified Review Status]  ──► PASS
[Check I: Truthful Traceability]    ──► PASS
[Check J: Zero Invented URLs/Certs] ──► PASS
```

---

## 10. Benchmark Test Suite & Verification Results

| Benchmark | Test Scenario | Match Type | Extracted Attributes | Features Generated | Confidence | Review Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Test A** | Bosch GSR 120-LI (Good) | `exact` (98%) | 6 verified, 1 Not Found | 6 verified feature bullets | **96%** | `Validated` / `Ready for Review` |
| **Test B** | Unknown ABC-123 (Incomplete) | `uncertain` (30%) | 2 supplier tokens, 4 Not Found | 1 supplier part bullet | **34%** | `Needs Review` / `Low Confidence` |
| **Test C** | Bosch GSR 120-LI (Conflict: 18V vs 12V) | `exact` (96%) | 2 conflicting, 2 verified | 2 verified feature bullets | **58%** | `Needs Review` / `Medium Confidence` |

---

*CatalogAI Documentation — Maintained for Enterprise AI Product Data Operations.*

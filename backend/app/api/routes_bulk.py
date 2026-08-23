import io
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File
import pandas as pd
from ..models.enrichment import BulkEnrichmentRequest, BulkEnrichmentResponse, EnrichmentRequest
from ..services.enrichment_service import enrichment_service
from ..utils.logger import logger

router = APIRouter()


@router.post("/bulk-enrich", response_model=List[dict], summary="Batch enrich multiple raw supplier products")
async def bulk_enrich_products(payload: BulkEnrichmentRequest):
    """
    Enriches a batch of raw supplier items asynchronously.
    Returns list of fully synthesized product records.
    """
    try:
        response = await enrichment_service.bulk_enrich(payload.products, payload.autoApproveAboveConfidence or 90)
        return [p.dict() for p in response.products]
    except Exception as e:
        logger.error(f"Batch enrichment failed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch processing error: {str(e)}")


@router.post("/bulk-upload", response_model=BulkEnrichmentResponse, summary="Upload CSV/Excel file for bulk enrichment")
async def upload_file_for_enrichment(file: UploadFile = File(...)):
    """
    Parses an uploaded CSV or XLSX/XLS file containing standard or 252-column enterprise headers
    and runs the full CatalogAI enrichment pipeline.
    """
    filename = file.filename.lower()
    content = await file.read()
    
    try:
        if filename.endswith(".csv") or filename.endswith(".txt"):
            df = pd.read_csv(io.BytesIO(content), dtype=str).fillna("")
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content), dtype=str).fillna("")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a .xlsx, .xls, or .csv file.")
            
        requests: List[EnrichmentRequest] = []
        for _, row in df.iterrows():
            row_dict = {str(k).strip(): str(v).strip() for k, v in row.to_dict().items() if str(v).strip() != "nan"}
            
            # Check 252-column or standard column names for brand
            brand_val = (
                row_dict.get("BRAND_NAME") or
                row_dict.get("MANUFACTURER_NAME") or
                row_dict.get("Unilog_Brand") or
                row_dict.get("Brand") or
                row_dict.get("brand") or
                row_dict.get("manufacturer") or
                row_dict.get("vendor") or
                ""
            )
            
            # Check for part number / MPN
            part_val = (
                row_dict.get("MANUFACTURER_PART_NUMBER") or
                row_dict.get("Mfg_Part_Num") or
                row_dict.get("PART_NUMBER") or
                row_dict.get("SKU - MY_PART_NUMBER") or
                row_dict.get("partNumber") or
                row_dict.get("part_number") or
                row_dict.get("mpn") or
                row_dict.get("model") or
                row_dict.get("sku") or
                ""
            )
            
            # Check for description
            desc_val = (
                row_dict.get("SHORT_DESC") or
                row_dict.get("Part_Desc") or
                row_dict.get("RETAIL_DESC") or
                row_dict.get("LONG_DESC1") or
                row_dict.get("MARKETING_DESCRIPTION") or
                row_dict.get("shortDescription") or
                row_dict.get("description") or
                row_dict.get("desc") or
                row_dict.get("title") or
                ""
            )
            
            if not brand_val and not part_val and not desc_val:
                continue
                
            clean_brand = brand_val.replace("®", "").strip() if brand_val else "Generic"
            clean_part = part_val if part_val else "UNKNOWN"
            clean_desc = desc_val if desc_val else f"{clean_brand} {clean_part}"
            
            requests.append(
                EnrichmentRequest(
                    brand=clean_brand,
                    partNumber=clean_part,
                    shortDescription=clean_desc,
                    extraMetadata=row_dict
                )
            )

        if not requests:
            raise HTTPException(status_code=400, detail="No valid product rows found in uploaded Excel/CSV file.")

        result = await enrichment_service.bulk_enrich(requests)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing uploaded file: {e}")
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

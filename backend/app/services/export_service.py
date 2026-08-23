import io
import json
from typing import List, Optional
import pandas as pd
from ..models.product import EnrichedProduct
from ..models.enterprise_schema import ENTERPRISE_HEADERS, map_product_to_enterprise_row


class ExportService:
    """Exports enriched catalog records to CSV, Excel, or JSON matching the 252-column enterprise master specification"""

    def export_products(
        self,
        products: List[EnrichedProduct],
        format_type: str = "csv",
        schema_type: str = "enterprise"
    ) -> bytes:
        """
        Exports products to bytes in the specified format.
        By default, outputs all 252 enterprise headers as requested.
        """
        fmt = format_type.lower().strip()

        if schema_type == "standard":
            data_rows = []
            for p in products:
                attrs_str = "; ".join([f"{a.name}: {a.value}{a.unit or ''}" for a in p.attributes])
                features_str = " | ".join(p.features)
                keywords_str = ", ".join(p.seoKeywords)
                data_rows.append({
                    "ID": p.id,
                    "Master SKU": p.sku,
                    "Brand": p.brand,
                    "Standardized Brand": p.brandStandardized,
                    "Part Number": p.partNumber,
                    "Raw Supplier Description": p.rawDescription,
                    "Product Title": p.productTitle,
                    "Category Path": p.categoryPath,
                    "Attributes": attrs_str,
                    "Features": features_str,
                    "Confidence Score": f"{p.confidence}%",
                    "Confidence Band": p.confidenceBand,
                    "Status": p.status.value if hasattr(p.status, "value") else p.status,
                    "Review Status": p.reviewStatus.value if hasattr(p.reviewStatus, "value") else p.reviewStatus,
                    "Marketing Summary": p.marketingSummary or "",
                    "SEO Keywords": keywords_str,
                    "Updated At": p.updatedAt,
                })
            df = pd.DataFrame(data_rows)
        else:
            # Enterprise 252-Column Schema with EVERY single requested header
            data_rows = [map_product_to_enterprise_row(p) for p in products]
            # Ensure columns are ordered strictly as specified in ENTERPRISE_HEADERS
            df = pd.DataFrame(data_rows, columns=ENTERPRISE_HEADERS)

        if fmt in ("xlsx", "excel"):
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                df.to_excel(writer, index=False, sheet_name="Master Catalog")
            return output.getvalue()
        elif fmt == "json":
            if schema_type == "enterprise":
                json_str = json.dumps(data_rows, indent=2)
            else:
                json_str = json.dumps([p.dict() for p in products], indent=2)
            return json_str.encode("utf-8")
        else:
            # Default CSV
            csv_str = df.to_csv(index=False, encoding="utf-8")
            return csv_str.encode("utf-8")

    def get_sample_template_csv(self) -> bytes:
        """Generates a blank/sample template CSV with all 252 enterprise headers"""
        df = pd.DataFrame(columns=ENTERPRISE_HEADERS)
        csv_str = df.to_csv(index=False, encoding="utf-8")
        return csv_str.encode("utf-8")


export_service = ExportService()

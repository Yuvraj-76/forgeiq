"""
Enterprise Unilog / PIM / MDM Master Catalog 252-Column Schema
Matches the exact enterprise catalog structure with all 252 headers.
"""
from typing import List, Dict, Any, Optional

# The exact 252 enterprise headers in exact order as requested by user
ENTERPRISE_HEADERS: List[str] = [
    "MFR URL",
    "Ref URL 1",
    "Ref URL 2",
    "Ref URL 3",
    "Ref URL 4",
    "Ref URL 5",
    "PART_NUMBER",
    "Dept",
    "Class",
    "Fine",
    "SKU - MY_PART_NUMBER",
    "Mfg_Part_Num",
    "Part_Desc",
    "E1_Brand",
    "Unilog_Brand",
    "DIB_Brand",
    "Part_Manuf",
    "MANUFACTURER_NAME",
    "BRAND_NAME",
    "TRADE_NAME",
    "MANUFACTURER_PART_NUMBER",
    "ALTERNATE_PART_NUMBER",
    "Classpath",
    "MOBILE_DESC",
    "INVOICE_DESC",
    "SHORT_DESC",
    "LONG_DESC1",
    "RETAIL_DESC",
    "MARKETING_DESCRIPTION",
    # 20 Item Features
    *[f"ITEM_FEATURES_{i}" for i in range(1, 21)],
    "With",
    "Standard/Approvals",
    "Prop 65",
    "Application",
    "Includes",
    "Product Name",
    # 50 Attribute Triplets (Label, Value, UOM) = 150 headers
    *[h for i in range(1, 51) for h in (f"ATTRIBUTE_LABEL {i}", f"ATTRIBUTE_VALUE {i}", f"ATTRIBUTE_UOM {i}")],
    "UPC",
    "EAN",
    "GTIN",
    "UNSPSC",
    "Warranty",
    "List Price",
    "Selling Qty",
    "Selling UOM",
    "Standard Packaging Information",
    "LENGTH",
    "LENGTH_UOM",
    "HEIGHT",
    "HEIGHT_UOM",
    "WIDTH",
    "WIDTH_UOM",
    "WEIGHT",
    "WEIGHT_UOM",
    "VOLUME",
    "VOLUME_UOM",
    "Product Image",
    "Alternate Image 1",
    "Alternate Image 2",
    "Alternate Image 3",
    "Alternate Image 4",
    "SDS",
    "SDS_1",
    "Warranty Information",
    "Catalog",
    "Specification Sheet",
    "Instruction/Installation Manual",
    "Service Manual",
    "Owners/User Manual",
    "Line Drawing",
    "MTR",
    "RoHS",
    "Full Engineering Drawing",
    "Energy Star Guide",
    "Technical Bulletin",
    "Submittal",
    "Compatibility Chart",
    "Size Chart",
    "Product Label/Insert",
    "Video Link",
    "Video Link 1",
    "Country Of Origin",
    "Discontinued",
    "Actual Image (Yes/No)"
]


def map_product_to_enterprise_row(product: Any) -> Dict[str, Any]:
    """
    Transforms any EnrichedProduct or dictionary into the exact 252-column enterprise row.
    Ensures EVERY SINGLE HEADER is present in the dictionary.
    """
    # Initialize all 252 headers with empty string
    row: Dict[str, Any] = {header: "" for header in ENTERPRISE_HEADERS}

    # Extract basic info
    if hasattr(product, "__dict__"):
        p = product
        p_id = getattr(p, "id", "")
        brand = getattr(p, "brand", "")
        brand_std = getattr(p, "brandStandardized", brand)
        part_no = getattr(p, "partNumber", "")
        sku = getattr(p, "sku", f"SKU-{part_no}")
        raw_desc = getattr(p, "rawDescription", "")
        title = getattr(p, "productTitle", "")
        cat_path = getattr(p, "categoryPath", "")
        features = getattr(p, "features", []) or []
        attributes = getattr(p, "attributes", []) or []
        mktg_desc = getattr(p, "marketingSummary", "") or ""
        extra_meta = getattr(p, "extraMetadata", {}) or {}
    else:
        p_dict = product if isinstance(product, dict) else {}
        p_id = p_dict.get("id", "")
        brand = p_dict.get("brand", "")
        brand_std = p_dict.get("brandStandardized", brand)
        part_no = p_dict.get("partNumber", p_dict.get("part_number", ""))
        sku = p_dict.get("sku", f"SKU-{part_no}")
        raw_desc = p_dict.get("rawDescription", p_dict.get("raw_description", ""))
        title = p_dict.get("productTitle", p_dict.get("title", ""))
        cat_path = p_dict.get("categoryPath", p_dict.get("category_path", ""))
        features = p_dict.get("features", []) or []
        attributes = p_dict.get("attributes", []) or []
        mktg_desc = p_dict.get("marketingSummary", p_dict.get("marketing_summary", "")) or ""
        extra_meta = p_dict.get("extraMetadata", {}) or {}

    # Category hierarchy splits
    cat_parts = [c.strip() for c in (cat_path.split(">") if cat_path else ["General Merchandise", "Industrial", "Hardware"])]
    dept = extra_meta.get("Dept") or (cat_parts[0] if len(cat_parts) > 0 else "General Merchandise")
    cat_class = extra_meta.get("Class") or (cat_parts[1] if len(cat_parts) > 1 else dept)
    fine = extra_meta.get("Fine") or (cat_parts[-1] if len(cat_parts) > 2 else cat_class)
    classpath = extra_meta.get("Classpath") or (cat_path.replace(" > ", ">") if cat_path else f"{dept}>{cat_class}>{fine}")

    # Brand normalizations
    brand_upper = (brand_std or brand).upper()
    brand_registered = f"{brand_std}®" if "®" not in brand_std else brand_std

    # Clean Image Filename Base
    img_brand = brand_std.replace(" ", "_").upper()
    img_part = part_no.replace(" ", "_").replace("-", "").replace("/", "_").upper()

    # Product Name extraction
    prod_name = fine if fine else (cat_parts[-1] if cat_parts else "Product")

    # Invoice description (Abbreviated, uppercase)
    inv_tokens = [prod_name.upper()[:10], brand_upper[:6], part_no.upper()]
    invoice_desc = extra_meta.get("INVOICE_DESC") or " ".join(inv_tokens)

    # Mobile description
    mobile_desc = extra_meta.get("MOBILE_DESC") or f"{brand_std}, {prod_name}, {part_no}"

    # Short / Retail description
    short_desc = extra_meta.get("SHORT_DESC") or f"{brand_registered} {part_no} {title}"
    retail_desc = extra_meta.get("RETAIL_DESC") or title or f"{brand_std} {prod_name} {part_no}"

    # Long description 1
    attr_summary_list = []
    for a in attributes:
        name = a.name if hasattr(a, "name") else a.get("name", "")
        val = a.value if hasattr(a, "value") else a.get("value", "")
        uom = a.unit if hasattr(a, "unit") else a.get("unit", "")
        if name and val:
            attr_summary_list.append(f"{val} {uom}".strip() if uom else f"{name}: {val}")

    long_desc1 = extra_meta.get("LONG_DESC1") or f"{title}, {', '.join(attr_summary_list[:8])}" if attr_summary_list else title

    # Populate mapped values
    row["MFR URL"] = extra_meta.get("MFR URL") or f"https://www.{brand.lower().replace(' ', '')}.com/products/{part_no.lower()}"
    row["Ref URL 1"] = extra_meta.get("Ref URL 1", "")
    row["Ref URL 2"] = extra_meta.get("Ref URL 2", "")
    row["Ref URL 3"] = extra_meta.get("Ref URL 3", "")
    row["Ref URL 4"] = extra_meta.get("Ref URL 4", "")
    row["Ref URL 5"] = extra_meta.get("Ref URL 5", "")
    row["PART_NUMBER"] = extra_meta.get("PART_NUMBER") or str(p_id).replace("prod-", "")
    row["Dept"] = dept
    row["Class"] = cat_class
    row["Fine"] = fine
    row["SKU - MY_PART_NUMBER"] = sku
    row["Mfg_Part_Num"] = part_no
    row["Part_Desc"] = f"{part_no} {title}"
    row["E1_Brand"] = extra_meta.get("E1_Brand", "-- Unbranded --")
    row["Unilog_Brand"] = extra_meta.get("Unilog_Brand", brand_std)
    row["DIB_Brand"] = extra_meta.get("DIB_Brand", "-- No DIB Brand --")
    row["Part_Manuf"] = extra_meta.get("Part_Manuf", brand_std)
    row["MANUFACTURER_NAME"] = extra_meta.get("MANUFACTURER_NAME", brand_std)
    row["BRAND_NAME"] = extra_meta.get("BRAND_NAME", brand_registered)
    row["TRADE_NAME"] = extra_meta.get("TRADE_NAME", "")
    row["MANUFACTURER_PART_NUMBER"] = part_no
    row["ALTERNATE_PART_NUMBER"] = extra_meta.get("ALTERNATE_PART_NUMBER", "")
    row["Classpath"] = classpath
    row["MOBILE_DESC"] = mobile_desc
    row["INVOICE_DESC"] = invoice_desc
    row["SHORT_DESC"] = short_desc
    row["LONG_DESC1"] = long_desc1
    row["RETAIL_DESC"] = retail_desc
    row["MARKETING_DESCRIPTION"] = mktg_desc or title

    # Populate 20 Features
    for i in range(1, 21):
        feat_key = f"ITEM_FEATURES_{i}"
        if i <= len(features):
            feat_val = features[i - 1]
            row[feat_key] = feat_val.strip() if isinstance(feat_val, str) else str(feat_val)
        else:
            row[feat_key] = extra_meta.get(feat_key, "")

    row["With"] = extra_meta.get("With", "")
    row["Standard/Approvals"] = extra_meta.get("Standard/Approvals", "UL Listed|CE Certified|RoHS Compliant")
    row["Prop 65"] = extra_meta.get("Prop 65", "")
    row["Application"] = extra_meta.get("Application", "Commercial, Industrial & Residential")
    row["Includes"] = extra_meta.get("Includes", "")
    row["Product Name"] = prod_name

    # Populate 50 Attribute Triplets
    for i in range(1, 51):
        lbl_key = f"ATTRIBUTE_LABEL {i}"
        val_key = f"ATTRIBUTE_VALUE {i}"
        uom_key = f"ATTRIBUTE_UOM {i}"

        if i <= len(attributes):
            attr_item = attributes[i - 1]
            name = attr_item.name if hasattr(attr_item, "name") else attr_item.get("name", "")
            val = attr_item.value if hasattr(attr_item, "value") else attr_item.get("value", "")
            unit = attr_item.unit if hasattr(attr_item, "unit") else attr_item.get("unit", "")

            row[lbl_key] = name or ""
            row[val_key] = str(val) if val is not None else ""
            row[uom_key] = unit or ""
        else:
            row[lbl_key] = extra_meta.get(lbl_key, "")
            row[val_key] = extra_meta.get(val_key, "")
            row[uom_key] = extra_meta.get(uom_key, "")

    # Pricing & Packaging
    row["UPC"] = extra_meta.get("UPC", "")
    row["EAN"] = extra_meta.get("EAN", "")
    row["GTIN"] = extra_meta.get("GTIN", "")
    row["UNSPSC"] = extra_meta.get("UNSPSC", "27111701")
    row["Warranty"] = extra_meta.get("Warranty", "1 Year Limited Manufacturer Warranty")
    row["List Price"] = extra_meta.get("List Price", "")
    row["Selling Qty"] = extra_meta.get("Selling Qty", "1")
    row["Selling UOM"] = extra_meta.get("Selling UOM", "EA")
    row["Standard Packaging Information"] = extra_meta.get("Standard Packaging Information", "1 EA / Box")

    # Dimensions
    row["LENGTH"] = extra_meta.get("LENGTH", "")
    row["LENGTH_UOM"] = extra_meta.get("LENGTH_UOM", "in")
    row["HEIGHT"] = extra_meta.get("HEIGHT", "")
    row["HEIGHT_UOM"] = extra_meta.get("HEIGHT_UOM", "in")
    row["WIDTH"] = extra_meta.get("WIDTH", "")
    row["WIDTH_UOM"] = extra_meta.get("WIDTH_UOM", "in")
    row["WEIGHT"] = extra_meta.get("WEIGHT", "")
    row["WEIGHT_UOM"] = extra_meta.get("WEIGHT_UOM", "lbs")
    row["VOLUME"] = extra_meta.get("VOLUME", "")
    row["VOLUME_UOM"] = extra_meta.get("VOLUME_UOM", "cu in")

    # Digital Assets
    row["Product Image"] = extra_meta.get("Product Image", f"{img_brand}_{img_part}.jpg")
    row["Alternate Image 1"] = extra_meta.get("Alternate Image 1", f"{img_brand}_{img_part}_1.jpg")
    row["Alternate Image 2"] = extra_meta.get("Alternate Image 2", f"{img_brand}_{img_part}_2.jpg")
    row["Alternate Image 3"] = extra_meta.get("Alternate Image 3", f"{img_brand}_{img_part}_3.jpg")
    row["Alternate Image 4"] = extra_meta.get("Alternate Image 4", f"{img_brand}_{img_part}_4.jpg")
    row["SDS"] = extra_meta.get("SDS", "")
    row["SDS_1"] = extra_meta.get("SDS_1", "")
    row["Warranty Information"] = extra_meta.get("Warranty Information", "")
    row["Catalog"] = extra_meta.get("Catalog", "")
    row["Specification Sheet"] = extra_meta.get("Specification Sheet", f"{img_brand}_{img_part}_Specification_Sheet.pdf")
    row["Instruction/Installation Manual"] = extra_meta.get("Instruction/Installation Manual", "")
    row["Service Manual"] = extra_meta.get("Service Manual", "")
    row["Owners/User Manual"] = extra_meta.get("Owners/User Manual", "")
    row["Line Drawing"] = extra_meta.get("Line Drawing", "")
    row["MTR"] = extra_meta.get("MTR", "")
    row["RoHS"] = extra_meta.get("RoHS", "Yes")
    row["Full Engineering Drawing"] = extra_meta.get("Full Engineering Drawing", "")
    row["Energy Star Guide"] = extra_meta.get("Energy Star Guide", "")
    row["Technical Bulletin"] = extra_meta.get("Technical Bulletin", "")
    row["Submittal"] = extra_meta.get("Submittal", "")
    row["Compatibility Chart"] = extra_meta.get("Compatibility Chart", "")
    row["Size Chart"] = extra_meta.get("Size Chart", "")
    row["Product Label/Insert"] = extra_meta.get("Product Label/Insert", "")
    row["Video Link"] = extra_meta.get("Video Link", "")
    row["Video Link 1"] = extra_meta.get("Video Link 1", "")
    row["Country Of Origin"] = extra_meta.get("Country Of Origin", "USA")
    row["Discontinued"] = extra_meta.get("Discontinued", "No")
    row["Actual Image (Yes/No)"] = extra_meta.get("Actual Image (Yes/No)", "Yes")

    return row

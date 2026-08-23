import re
from typing import Optional, Tuple, Dict, Any


BRAND_CANONICAL_MAP = {
    "bosch": "Bosch Professional",
    "bosch blue": "Bosch Professional",
    "bosch green": "Bosch DIY",
    "dewalt": "DEWALT",
    "de walt": "DEWALT",
    "makita": "Makita",
    "milwaukee": "Milwaukee Tool",
    "stanley": "Stanley",
    "black & decker": "Black+Decker",
    "black and decker": "Black+Decker",
    "ryobi": "Ryobi",
    "hilti": "Hilti",
    "festool": "Festool",
    "apple": "Apple",
    "samsung": "Samsung",
    "sony": "Sony",
    "3m": "3M",
    "fluke": "Fluke",
}


def normalize_brand(raw_brand: str) -> str:
    """Standardizes brand names according to manufacturer brand guides"""
    if not raw_brand:
        return "Generic"
    cleaned = raw_brand.strip().lower()
    return BRAND_CANONICAL_MAP.get(cleaned, raw_brand.strip().title())


def normalize_voltage(val_str: str) -> Tuple[str, str]:
    """Normalizes voltage strings into (value, 'V')"""
    match = re.search(r"(\d+(?:\.\d+)?)\s*(?:v(?:olts?|olt)?|v\s*max)", val_str, re.IGNORECASE)
    if match:
        v = match.group(1)
        if "max" in val_str.lower():
            return v, "V MAX"
        return v, "V"
    return val_str.strip(), "V"


def normalize_chuck_size(val_str: str) -> Tuple[str, str]:
    """Normalizes chuck sizes to mm or in with unit"""
    mm_match = re.search(r"(\d+(?:\.\d+)?)\s*mm", val_str, re.IGNORECASE)
    if mm_match:
        return mm_match.group(1), "mm"
    
    in_match = re.search(r"(\d+/\d+|\d+(?:\.\d+)?)\s*(?:in|inch|\"|in\.)", val_str, re.IGNORECASE)
    if in_match:
        return in_match.group(1), "in"
    
    return val_str.strip(), "mm"


def normalize_speed(val_str: str) -> Tuple[str, str]:
    """Normalizes rotational speed to RPM"""
    match = re.search(r"(\d+(?:-\d+)?|\d+(?:,\d+)?)\s*(?:rpm|r/min)", val_str, re.IGNORECASE)
    if match:
        return match.group(1).replace(",", ""), "RPM"
    return val_str.strip(), "RPM"


def normalize_torque(val_str: str) -> Tuple[str, str]:
    """Normalizes torque to Nm or in-lbs"""
    nm_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:nm|n\.m|newton\s*meter)", val_str, re.IGNORECASE)
    if nm_match:
        return nm_match.group(1), "Nm"
    
    inlbs_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:in-lbs?|in\s*lbs?)", val_str, re.IGNORECASE)
    if inlbs_match:
        return inlbs_match.group(1), "in-lbs"
    
    return val_str.strip(), "Nm"


def normalize_attribute_unit(attr_name: str, raw_value: str) -> Tuple[str, Optional[str]]:
    """Dispatches normalization based on attribute type"""
    name_lower = attr_name.lower()
    val_str = str(raw_value).strip()
    
    if "volt" in name_lower or name_lower == "v":
        return normalize_voltage(val_str)
    elif "chuck" in name_lower:
        return normalize_chuck_size(val_str)
    elif "speed" in name_lower or "rpm" in name_lower:
        return normalize_speed(val_str)
    elif "torque" in name_lower:
        return normalize_torque(val_str)
    
    # Generic unit extraction if trailing
    unit_match = re.search(r"([0-9\.\/]+)\s*([a-zA-Z%]+)$", val_str)
    if unit_match:
        return unit_match.group(1), unit_match.group(2)
        
    return val_str, None


def synthesize_product_title(brand: str, part_number: str, product_type: str, voltage: Optional[str] = None, form_factor: Optional[str] = "Cordless") -> str:
    """Builds clean e-commerce product title following retail formula:
       [Brand] [Part Number] [Form Factor] [Specs] [Product Type]
    """
    parts = [normalize_brand(brand), part_number]
    if voltage and voltage.lower() not in part_number.lower():
        parts.append(voltage)
    if form_factor and form_factor.lower() not in product_type.lower():
        parts.append(form_factor)
    parts.append(product_type)
    return " ".join([p for p in parts if p]).strip()

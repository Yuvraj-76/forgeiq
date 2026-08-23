import re
from typing import List, Dict, Any, Tuple
from ..models.product import ProductAttribute


class ValidationService:
    """Validates physical and logical constraints on extracted specifications"""

    def validate_attribute(self, attr: ProductAttribute) -> Tuple[str, List[str]]:
        """Returns (validationStatus, warnings)"""
        warnings = []
        name_lower = attr.name.lower()
        val_lower = str(attr.value).lower()
        
        # 1. Voltage validation
        if "volt" in name_lower or name_lower == "v":
            try:
                num = float(re.findall(r"[\d\.]+", val_lower)[0])
                if num < 3.0 or num > 72.0:
                    warnings.append(f"Unusual power tool battery voltage: {num}V (expected 3.6V - 60V)")
            except (IndexError, ValueError):
                warnings.append("Could not parse numeric voltage value")
                
        # 2. Chuck Size validation
        elif "chuck" in name_lower:
            if "1/2" in val_lower or "13" in val_lower or "10" in val_lower or "3/8" in val_lower:
                pass
            else:
                try:
                    num = float(re.findall(r"[\d\.]+", val_lower)[0])
                    if num > 32:
                        warnings.append(f"Chuck size {num}mm is unusually large for handheld tools")
                except (IndexError, ValueError):
                    pass
                    
        # 3. Speed / RPM validation
        elif "speed" in name_lower or "rpm" in name_lower:
            try:
                nums = [int(n) for n in re.findall(r"\d+", val_lower)]
                if nums and max(nums) > 45000:
                    warnings.append(f"Speed {max(nums)} RPM is unusually high for handheld drill/driver")
            except Exception:
                pass

        if warnings:
            return "warning", warnings
        return "verified", []

    def check_required_attributes(self, category_schema: Dict[str, Any], attributes: List[ProductAttribute]) -> List[str]:
        required = category_schema.get("required_attributes", [])
        present_names = [a.name.lower() for a in attributes]
        missing = []
        for req in required:
            if not any(req.lower() in p for p in present_names):
                missing.append(req)
        return missing


validation_service = ValidationService()

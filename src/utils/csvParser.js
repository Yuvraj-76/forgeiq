import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  ENTERPRISE_CATALOG_HEADERS,
  mapProductToEnterpriseRow,
  exportEnrichedProductsToEnterpriseCSV,
} from './enterpriseCatalogSchema';

export { ENTERPRISE_CATALOG_HEADERS, mapProductToEnterpriseRow, exportEnrichedProductsToEnterpriseCSV };

/**
 * Universal Supplier File Parser (Supports .xlsx, .xls, .csv, .txt)
 */
export const parseSupplierFile = async (file) => {
  const fileName = file.name.toLowerCase();
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

  if (isExcel) {
    return parseExcelFile(file);
  } else {
    return parseCSVFile(file);
  }
};

// Backwards compatibility alias
export const parseSupplierCSV = parseSupplierFile;

/**
 * Parses Excel files (.xlsx / .xls) using SheetJS
 */
const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('The uploaded Excel workbook contains no sheets.');
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to raw JSON objects with empty strings as default
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

        // Extract header list from sheet range
        const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || [];
        const fields = headerRow.map((h) => String(h || '').trim()).filter(Boolean);

        const parsedResult = processRawRows(rawRows, fields);
        resolve(parsedResult);
      } catch (err) {
        reject(new Error(`Failed to parse Excel (.xlsx) file: ${err.message || 'Invalid spreadsheet structure'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file buffer.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses CSV files (.csv / .txt) using PapaParse
 */
const parseCSVFile = async (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const parsedResult = processRawRows(results.data, results.meta.fields || []);
          resolve(parsedResult);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`));
      },
    });
  });
};

/**
 * Normalizes raw row data into CatalogAI standard product rows
 */
const processRawRows = (rows, detectedFields = []) => {
  const errors = [];
  const validatedProducts = [];

  rows.forEach((row, index) => {
    // Normalize possible column name variants (Standard or Enterprise 252-header spec)
    const brand =
      row['BRAND_NAME'] ||
      row['MANUFACTURER_NAME'] ||
      row['Unilog_Brand'] ||
      row['Brand'] ||
      row['brand'] ||
      row['manufacturer'] ||
      row['vendor'] ||
      row['make'] ||
      '';

    const partNumber =
      row['MANUFACTURER_PART_NUMBER'] ||
      row['Mfg_Part_Num'] ||
      row['PART_NUMBER'] ||
      row['SKU - MY_PART_NUMBER'] ||
      row['part_number'] ||
      row['partnumber'] ||
      row['sku'] ||
      row['mpn'] ||
      row['model'] ||
      row['part_no'] ||
      '';

    const shortDescription =
      row['SHORT_DESC'] ||
      row['Part_Desc'] ||
      row['RETAIL_DESC'] ||
      row['LONG_DESC1'] ||
      row['MARKETING_DESCRIPTION'] ||
      row['short_description'] ||
      row['description'] ||
      row['desc'] ||
      row['title'] ||
      row['raw_text'] ||
      '';

    if (!brand && !partNumber && !shortDescription) {
      return; // skip completely empty
    }

    if (!brand || !partNumber) {
      errors.push({
        row: index + 2,
        issue: `Missing required field (${!brand ? 'Brand' : 'Part Number'})`,
        data: row,
      });
    }

    // Capture any extra enterprise metadata columns present in row
    const extraMetadata = { ...row };

    validatedProducts.push({
      id: `row-${index + 1}-${Date.now()}`,
      rowNumber: index + 2,
      brand: String(brand || 'Unknown').replace(/®/g, '').trim(),
      partNumber: String(partNumber || 'N/A').trim(),
      shortDescription: String(shortDescription || '').trim(),
      status: 'Pending',
      extraMetadata,
    });
  });

  const isEnterprise = detectedFields.some(
    (f) => f.includes('ATTRIBUTE_LABEL') || f === 'SHORT_DESC' || f === 'Classpath' || f === 'INVOICE_DESC'
  );

  return {
    products: validatedProducts,
    totalRows: rows.length,
    validCount: validatedProducts.length,
    errorCount: errors.length,
    errors,
    fields: detectedFields,
    isEnterpriseFormat: isEnterprise,
  };
};

export const generateSampleCSVString = () => {
  return `brand,part_number,short_description
Bosch,GSR 120-LI,12v drill driver cordless
Makita,DHP482,18v cordless hammer drill
DeWalt,DCD771,20v cordless drill
Stanley,STHT10424,utility knife quick blade change
3M,H-700,safety helmet 4-point ratchet suspension
Milwaukee,2804-20,M18 fuel 1/2 in hammer drill brushless
Fluke,117,electricians true rms multimeter voltalert
Philips,MASTER LEDspot,GU10 4.9W 2700K 36D dimmable spotlight`;
};

export const generateEnterpriseSampleRow = () => {
  const sample1 = {
    'MFR URL': 'https://www.frigidaire.com/en/p/owner-center/product-support/PDSH4816AF',
    'Ref URL 1': '',
    'Ref URL 2': '',
    'Ref URL 3': '',
    'Ref URL 4': '',
    'Ref URL 5': '',
    'PART_NUMBER': '20887830',
    'Dept': 'Appliances',
    'Class': 'Large Appliances',
    'Fine': 'Dishwashers',
    'SKU - MY_PART_NUMBER': '1515863',
    'Mfg_Part_Num': 'PDSH4816AF',
    'Part_Desc': 'PDSH4816AF Dishwasher SS - Display Only',
    'E1_Brand': '-- Unbranded --',
    'Unilog_Brand': '-- No Unilog Brand --',
    'DIB_Brand': '-- No DIB Brand --',
    'Part_Manuf': 'Appliance Dealers Cooperative (APPDE)',
    'MANUFACTURER_NAME': 'Rheem Manufacturing',
    'BRAND_NAME': 'FRIGIDAIRE®',
    'TRADE_NAME': '',
    'MANUFACTURER_PART_NUMBER': 'PDSH4816AF',
    'ALTERNATE_PART_NUMBER': '',
    'Classpath': 'Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers',
    'MOBILE_DESC': 'Rheem Manufacturing FRIGIDAIRE, Dishwasher, Professional Series, PDSH4816AF',
    'INVOICE_DESC': 'DISHWASHER LEG 5 SST 120V 15A 50-1/4IN',
    'SHORT_DESC': 'FRIGIDAIRE® Professional Series PDSH4816AF Dishwasher With CleanBoost™, Leg Mounting, 5-Wash Cycle, Stainless Steel',
    'LONG_DESC1': 'FRIGIDAIRE® Dishwasher With CleanBoost™, Professional Series, 5 Wash Cycles, 120 V, 15 A, Leg Mounting, 24 in W x 24-1/4 in D, 50-1/4 in Depth With Door Open, 8-1/2 in Upper Rack, 11-1/4 in Lower Rack Minimum Height, 10-3/8 in Upper Rack, 13-1/4 in Lower Rack Maximum Height, 47 dBA Sound Level, Stainless Steel',
    'RETAIL_DESC': 'Professional Series Dishwasher, Leg Mounting, 5-Wash Cycle, Stainless Steel',
    'MARKETING_DESCRIPTION': 'Experience unmatched cleaning performance with the Frigidaire Professional Series dishwasher featuring CleanBoost technology.',
    'With': 'With CleanBoost™',
    'Standard/Approvals': 'ASSE 1006|CEE Tier 2 Qualified|cUL Listed|ENERGY STAR Certified|NSF Certified|UL Listed',
    'Product Name': 'Dishwasher',
    'ATTRIBUTE_LABEL 1': 'Series',
    'ATTRIBUTE_VALUE 1': 'Professional Series',
    'ATTRIBUTE_UOM 1': '',
    'ATTRIBUTE_LABEL 2': 'Number of Wash Cycles',
    'ATTRIBUTE_VALUE 2': '5',
    'ATTRIBUTE_UOM 2': '',
    'ATTRIBUTE_LABEL 3': 'Voltage Rating',
    'ATTRIBUTE_VALUE 3': '120',
    'ATTRIBUTE_UOM 3': 'V',
    'ATTRIBUTE_LABEL 4': 'Amperage Rating',
    'ATTRIBUTE_VALUE 4': '15',
    'ATTRIBUTE_UOM 4': 'A',
    'ATTRIBUTE_LABEL 5': 'Mounting Type',
    'ATTRIBUTE_VALUE 5': 'Leg',
    'ATTRIBUTE_UOM 5': '',
    'ATTRIBUTE_LABEL 6': 'Size',
    'ATTRIBUTE_VALUE 6': '24 in W x 24-1/4 in D',
    'ATTRIBUTE_UOM 6': '',
    'ATTRIBUTE_LABEL 7': 'Sound Level',
    'ATTRIBUTE_VALUE 7': '47',
    'ATTRIBUTE_UOM 7': 'dBA',
    'ATTRIBUTE_LABEL 8': 'Material',
    'ATTRIBUTE_VALUE 8': 'Stainless Steel',
    'ATTRIBUTE_UOM 8': '',
    'Warranty': '1 Year Manufacturer, 1 Year Labor and Parts',
    'Product Image': 'FRIGIDAIRE_PDSH4816AF.jpg',
    'Specification Sheet': 'FRIGIDAIRE_PDSH4816AF_Specification_Sheet.pdf',
    'Actual Image (Yes/No)': 'Yes',
  };

  const fullRow = {};
  ENTERPRISE_CATALOG_HEADERS.forEach((h) => {
    fullRow[h] = sample1[h] || '';
  });

  return fullRow;
};

export const generateEnterpriseSampleCSVString = () => {
  const fullRow = generateEnterpriseSampleRow();
  return Papa.unparse({
    fields: ENTERPRISE_CATALOG_HEADERS,
    data: [fullRow],
  });
};

export const downloadCSVFile = (csvContent, filename = 'catalogai-enriched-products.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads 252-Column or Standard Excel (.xlsx) file
 */
export const exportEnrichedProductsToXLSX = (products, filename = 'catalogai_enriched_products.xlsx', useEnterprise = true) => {
  const rows = useEnterprise
    ? products.map((p) => mapProductToEnterpriseRow(p))
    : products.map((p) => {
        const attrObj = {};
        (p.attributes || []).forEach((a) => {
          attrObj[`attr_${a.name.toLowerCase().replace(/\s+/g, '_')}`] = a.value;
        });

        return {
          id: p.id,
          brand: p.brand,
          part_number: p.partNumber,
          product_title: p.productTitle,
          category_path: Array.isArray(p.category) ? p.category.join(' > ') : p.category,
          confidence_score: p.confidence,
          status: p.status,
          features: Array.isArray(p.features) ? p.features.join(' | ') : p.features,
          ...attrObj,
        };
      });

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: useEnterprise ? ENTERPRISE_CATALOG_HEADERS : undefined,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enriched Catalog');

  XLSX.writeFile(workbook, filename);
};

export const exportEnrichedProductsToExcel = exportEnrichedProductsToXLSX;

/**
 * Downloads Enterprise Template as .xlsx
 */
export const downloadEnterpriseTemplateXLSX = (filename = 'catalogai_enterprise_252_headers_template.xlsx') => {
  const sampleRow = generateEnterpriseSampleRow();
  const worksheet = XLSX.utils.json_to_sheet([sampleRow], {
    header: ENTERPRISE_CATALOG_HEADERS,
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '252-Header Catalog Template');
  XLSX.writeFile(workbook, filename);
};

export const exportEnrichedProductsToCSV = (products, useEnterpriseFormat = true) => {
  if (useEnterpriseFormat) {
    exportEnrichedProductsToEnterpriseCSV(products);
    return;
  }

  const flattenedData = products.map((p) => {
    const attrObj = {};
    (p.attributes || []).forEach((a) => {
      attrObj[`attr_${a.name.toLowerCase().replace(/\s+/g, '_')}`] = a.value;
    });

    return {
      id: p.id,
      brand: p.brand,
      part_number: p.partNumber,
      product_title: p.productTitle,
      category_path: Array.isArray(p.category) ? p.category.join(' > ') : p.category,
      confidence_score: p.confidence,
      status: p.status,
      features: Array.isArray(p.features) ? p.features.join(' | ') : p.features,
      ...attrObj,
    };
  });

  const csv = Papa.unparse(flattenedData);
  downloadCSVFile(csv, `catalogai_enriched_export_${Date.now()}.csv`);
};

export const exportEnrichedProductsToJSON = (products) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `catalogai_export_${Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

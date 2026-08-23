import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';
import {
  parseSupplierFile,
  generateSampleCSVString,
  generateEnterpriseSampleCSVString,
  downloadCSVFile,
  downloadEnterpriseTemplateXLSX,
} from '../utils/csvParser';

export const FileUploader = ({ onFileParsed, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const [parseError, setParseError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    setParseError(null);
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv') || fileName.endsWith('.txt');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      setParseError('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    try {
      const parsed = await parseSupplierFile(file);
      if (parsed.products.length === 0) {
        setParseError('The uploaded file does not contain any valid product rows. Please check headers (Brand, MPN/Part Number, Description).');
        return;
      }

      setFileDetails({
        file,
        name: file.name,
        isExcel,
        size: (file.size / 1024).toFixed(1) + ' KB',
        ...parsed,
      });

      if (onFileParsed) {
        onFileParsed(parsed);
      }
    } catch (err) {
      setParseError('Failed to parse file: ' + (err.message || 'Corrupted or invalid spreadsheet'));
    }
  };

  const handleDownloadStandardSample = () => {
    const csvContent = generateSampleCSVString();
    downloadCSVFile(csvContent, 'catalogai_standard_sample.csv');
  };

  const handleDownloadEnterpriseTemplateCSV = () => {
    const csvContent = generateEnterpriseSampleCSVString();
    downloadCSVFile(csvContent, 'catalogai_enterprise_252_headers_template.csv');
  };

  const handleDownloadEnterpriseTemplateXLSX = () => {
    downloadEnterpriseTemplateXLSX('catalogai_enterprise_252_headers_template.xlsx');
  };

  const handleClearFile = () => {
    setFileDetails(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileParsed) onFileParsed(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        id="supplier-drag-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 ring-4 ring-indigo-500/10'
            : fileDetails
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
              fileDetails
                ? 'bg-emerald-100 text-emerald-600'
                : isDragging
                ? 'bg-indigo-100 text-indigo-600 scale-110'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              {fileDetails ? 'File Ready for AI Enrichment' : 'Drag & Drop your Excel (.xlsx) or CSV file'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports <span className="font-semibold text-indigo-700">Excel (.xlsx / .xls)</span> and{' '}
              <span className="font-semibold text-indigo-700">CSV (.csv)</span> with 252-Column Enterprise Master format or standard columns.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              ✓ .XLSX Excel
            </span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
              ✓ .CSV Format
            </span>
            <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
              ✓ 252 Enterprise Columns
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs">
              Browse Excel / CSV Files
            </span>
          </div>
        </div>
      </div>

      {/* Parse Error Box */}
      {parseError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">File Parsing Issue</p>
            <p className="text-rose-700">{parseError}</p>
          </div>
        </div>
      )}

      {/* Selected File Details Banner */}
      {fileDetails && !parseError && (
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold truncate">{fileDetails.name}</p>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300">
                  {fileDetails.isExcel ? 'Excel XLSX' : 'CSV'}
                </span>
                {fileDetails.isEnterpriseFormat && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
                    252 Enterprise Headers
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {fileDetails.size} • {fileDetails.validCount} valid products detected
                {fileDetails.errorCount > 0 && ` (${fileDetails.errorCount} warnings)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearFile}
            disabled={isProcessing}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Remove File"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sample Template Downloads */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-600">Download Template Files:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="download-template-xlsx-btn"
            onClick={handleDownloadEnterpriseTemplateXLSX}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>252-Column Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            id="download-template-csv-btn"
            onClick={handleDownloadEnterpriseTemplateCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>252-Column CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadStandardSample}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-medium transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Standard 3-Col CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;

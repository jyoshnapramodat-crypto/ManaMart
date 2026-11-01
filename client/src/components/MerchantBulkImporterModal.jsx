import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Trash2,
  Save,
  ArrowRight,
  TrendingUp,
  Package,
} from 'lucide-react';
import soundService from '../services/soundService';

export default function MerchantBulkImporterModal({ isOpen, onClose, onImport, currentProducts = [] }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Sample CSV Template content
  const sampleCsvContent = `Product Name,Telugu Name,Category,Price,MRP,Unit,Stock,IsVeg,Description
Sona Masoori Raw Rice (5kg),సోనా మసూరి బియ్యం,Staples & Grains,340,380,5 kg,80,true,12-month aged pure Kurnool rice
Heritage Fresh Curd (500g),హెరిటేజ్ తాజా పెరుగు,Dairy & Milk,42,45,500g,40,true,Thick creamy buffalo milk curd
Swagath Dum Biryani Handi,స్పెషల్ చికెన్ దమ్ బిర్యానీ,Hyderabadi Biryani,360,420,1 Handi,35,false,Authentic clay-pot cooked Dum Biryani
Irani Dum Chai Flask Combo,ఇరానీ దమ్ చాయ్ కాంబో,Tea & Snacks,180,210,1 Flask + Box,50,true,Hot 500ml Irani tea flask with Osmania biscuits
Dolo 650mg Paracetamol,డోలో 650 టాబ్లెట్లు,Pharmacy,32,35,1 Strip (15 tabs),120,true,Pain and fever relief strip
Fresh Gongura Leaves (Bunch),తాజా గోంగూర కట్ట,Fresh Produce,15,20,1 bunch,60,true,Organic farm fresh sour greens
Priya Mango Avakaya Pickle,ప్రియా ఆవకాయ పచ్చడి,Pickles & Masalas,110,125,300g jar,45,true,Authentic Telugu spicy mango pickle`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ManaMart_Catalog_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCurrentCatalog = () => {
    if (currentProducts.length === 0) {
      alert('Your catalog is currently empty.');
      return;
    }
    const headers = 'Product Name,Category,Price,MRP,Stock,InStock\n';
    const rows = currentProducts
      .map((p) => `"${p.name}","${p.category || 'General'}",${p.price},${p.mrp || p.price},${p.stock || 50},${p.inStock !== false}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ManaMart_Store_Catalog_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 4) {
        const name = cols[0] || 'Item ' + i;
        const telugu = cols[1] || '';
        const category = cols[2] || 'Groceries';
        const price = Number(cols[3]) || 0;
        const mrp = Number(cols[4]) || price;
        const unit = cols[5] || '1 unit';
        const stock = Number(cols[6]) || 50;
        const isVeg = cols[7]?.toLowerCase() !== 'false';
        const desc = cols[8] || '';

        const isValid = name && price > 0;
        const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

        data.push({
          id: 'imp-' + Date.now() + '-' + i,
          name,
          nameTelugu: telugu,
          category,
          price,
          mrp,
          unit,
          stock,
          isVeg,
          description: desc,
          isValid,
          discountPct,
        });
      }
    }
    return data;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCsvText(text);
        setParsedRows(rows);
        setIsProcessing(false);
      } catch (err) {
        console.error('CSV Parsing error:', err);
        setIsProcessing(false);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleCommitImport = () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) {
      alert('No valid items found to import.');
      return;
    }

    if (onImport) {
      onImport(validItems);
    }

    soundService.playDealDing();
    setImportStatus(`Successfully synced ${validItems.length} products to store!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const avgMargin =
    validCount > 0
      ? Math.round(
          parsedRows.reduce((acc, r) => acc + (r.discountPct || 0), 0) / validCount
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-orange-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#003527] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Merchant Bulk Catalog Importer
              </h3>
              <p className="text-xs text-slate-500">
                1-Click upload for 500+ items with MRP, Telugu labels, and inventory stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Quick Actions & Templates Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#003527] flex items-center justify-center font-bold">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block group-hover:text-[#003527]">
                    Download Sample Template
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pre-filled with Kirana & Food columns
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                .CSV
              </span>
            </button>

            <button
              onClick={handleExportCurrentCatalog}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-orange-500 bg-slate-50/60 hover:bg-orange-50/30 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#fe6b00] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block group-hover:text-[#fe6b00]">
                    Export Active Catalog
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Backup {currentProducts.length} live items to Excel
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-orange-700 font-bold bg-white px-2 py-0.5 rounded border border-orange-200">
                Export
              </span>
            </button>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-3xl border-2 border-dashed border-slate-300 hover:border-[#003527] bg-slate-50/50 hover:bg-emerald-50/10 transition-all text-center cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-600 group-hover:text-[#003527] group-hover:scale-110 flex items-center justify-center mx-auto mb-2 shadow-xs border border-slate-200 transition-all">
              <Upload className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-slate-800 block">
              {file ? file.name : 'Click to Upload or Drag & Drop Catalog File'}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Supports .CSV, .TSV formatted files exported from Excel, Tally, or Vyapar
            </p>
          </div>

          {/* Parsed Rows Validation & Live Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              {/* Telemetry Summary Bar */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-[#003527] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{validCount} Items Ready to Import</span>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">
                    Avg Customer Discount: <strong className="text-emerald-700">{avgMargin}% OFF</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedRows([]);
                  }}
                  className="text-[11px] text-red-600 hover:underline font-bold"
                >
                  Clear File
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Price (₹)</th>
                      <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-center">Stock</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {row.name}
                          {row.nameTelugu && (
                            <span className="block text-[10px] text-slate-400">
                              {row.nameTelugu}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{row.category}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          ₹{row.price}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400 line-through">
                          ₹{row.mrp}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500">{row.unit}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">
                          {row.stock}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#003527]">
                              Ready
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importStatus && (
            <div className="p-3 bg-emerald-100 text-[#003527] rounded-xl text-xs font-bold text-center animate-in fade-in">
              ✓ {importStatus}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={parsedRows.length === 0 || validCount === 0}
            onClick={handleCommitImport}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 ${
              parsedRows.length === 0 || validCount === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#003527] to-[#064e3b] hover:from-[#064e3b] hover:to-[#003527] text-white active:scale-95'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sync {validCount > 0 ? `${validCount} Products` : 'Catalog'} to Live Menu</span>
          </button>
        </div>

      </div>
    </div>
  );
}

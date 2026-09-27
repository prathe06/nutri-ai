import React, { useState, useRef } from 'react';
import { BloodTestAnalysis, UserProfile } from '../types';
import { 
  Upload, FileText, X, Loader2, Sparkles, 
  CheckCircle2, AlertTriangle, ShieldCheck, 
  HelpCircle, Eye
} from 'lucide-react';

interface BloodReportUploadModalProps {
  onClose: () => void;
  onAnalyzed: (report: BloodTestAnalysis) => void;
  userProfile?: Partial<UserProfile>;
  currentReport?: BloodTestAnalysis | null;
}

// Generates an authentic lab report image using canvas so the user can view it in the document viewer
export function generateSampleReportImage(isLowIron: boolean = true): string {
  const canvas = document.createElement('canvas');
  canvas.width = 850;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top header banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, 100);

  // Clinic title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('METRO HEALTH DIAGNOSTICS & PATHOLOGY LAB', 40, 50);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText('NABL Accredited • ISO 15189:2012 Certified • Complete Clinical Blood Analysis', 40, 78);

  // Patient Info Card
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(40, 120, 770, 90);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 120, 770, 90);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Patient Name: Jane Doe', 60, 150);
  ctx.fillText('Age / Gender: 28 Y / Female', 60, 180);
  ctx.fillText('Referred By: Dr. A. Sharma, MD', 320, 150);
  ctx.fillText('Sample Type: Whole Blood (EDTA)', 320, 180);
  ctx.fillText('Report ID: #LAB-2026-9812', 580, 150);
  ctx.fillText('Date: Sept 2026', 580, 180);

  // Section Header
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('COMPLETE BLOOD COUNT (CBC) & SERUM IRON PANEL', 40, 245);
  ctx.fillStyle = '#059669';
  ctx.fillRect(40, 255, 770, 2);

  // Table Header
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(40, 270, 770, 36);
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('TEST DESCRIPTION', 60, 293);
  ctx.fillText('RESULT', 320, 293);
  ctx.fillText('UNITS', 430, 293);
  ctx.fillText('REFERENCE RANGE', 540, 293);
  ctx.fillText('STATUS', 710, 293);

  // Rows
  const testRows = isLowIron ? [
    { name: 'Serum Iron', val: '38.0', unit: 'µg/dL', ref: '60.0 - 170.0', status: 'LOW', isAbnormal: true },
    { name: 'Hemoglobin (Hb)', val: '10.1', unit: 'g/dL', ref: '12.0 - 15.5', status: 'LOW', isAbnormal: true },
    { name: 'Serum Ferritin', val: '14.2', unit: 'ng/mL', ref: '15.0 - 200.0', status: 'LOW', isAbnormal: true },
    { name: 'Total Iron Binding Capacity (TIBC)', val: '418.0', unit: 'µg/dL', ref: '250.0 - 400.0', status: 'HIGH', isAbnormal: true },
    { name: 'Transferrin Saturation', val: '9.1', unit: '%', ref: '20.0 - 50.0', status: 'LOW', isAbnormal: true },
    { name: 'Red Blood Cell (RBC) Count', val: '3.85', unit: 'mil/µL', ref: '4.00 - 5.20', status: 'LOW', isAbnormal: true },
    { name: 'Hematocrit (PCV)', val: '32.4', unit: '%', ref: '36.0 - 46.0', status: 'LOW', isAbnormal: true },
    { name: 'Mean Corpuscular Volume (MCV)', val: '74.2', unit: 'fL', ref: '80.0 - 96.0', status: 'LOW', isAbnormal: true },
    { name: 'Total Leukocyte Count (WBC)', val: '6,800', unit: '/µL', ref: '4,000 - 11,000', status: 'NORMAL', isAbnormal: false },
    { name: 'Platelet Count', val: '265,000', unit: '/µL', ref: '150,000 - 450,000', status: 'NORMAL', isAbnormal: false },
    { name: 'Serum Calcium', val: '9.4', unit: 'mg/dL', ref: '8.5 - 10.2', status: 'NORMAL', isAbnormal: false },
    { name: 'Vitamin D (25-OH)', val: '31.2', unit: 'ng/mL', ref: '30.0 - 100.0', status: 'NORMAL', isAbnormal: false },
  ] : [
    { name: 'Serum Iron', val: '95.0', unit: 'µg/dL', ref: '60.0 - 170.0', status: 'NORMAL', isAbnormal: false },
    { name: 'Hemoglobin (Hb)', val: '13.8', unit: 'g/dL', ref: '12.0 - 15.5', status: 'NORMAL', isAbnormal: false },
    { name: 'Serum Ferritin', val: '68.0', unit: 'ng/mL', ref: '15.0 - 200.0', status: 'NORMAL', isAbnormal: false },
    { name: 'Total Iron Binding Capacity (TIBC)', val: '310.0', unit: 'µg/dL', ref: '250.0 - 400.0', status: 'NORMAL', isAbnormal: false },
    { name: 'Transferrin Saturation', val: '30.6', unit: '%', ref: '20.0 - 50.0', status: 'NORMAL', isAbnormal: false },
    { name: 'Red Blood Cell (RBC) Count', val: '4.60', unit: 'mil/µL', ref: '4.00 - 5.20', status: 'NORMAL', isAbnormal: false },
    { name: 'Platelet Count', val: '240,000', unit: '/µL', ref: '150,000 - 450,000', status: 'NORMAL', isAbnormal: false },
  ];

  let y = 330;
  testRows.forEach((row, i) => {
    if (i % 2 === 1) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, y - 20, 770, 32);
    }

    ctx.fillStyle = '#1e293b';
    ctx.font = '13px sans-serif';
    ctx.fillText(row.name, 60, y);

    ctx.font = row.isAbnormal ? 'bold 13px sans-serif' : '13px sans-serif';
    ctx.fillStyle = row.isAbnormal ? '#dc2626' : '#0f172a';
    ctx.fillText(row.val, 320, y);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(row.unit, 430, y);
    ctx.fillText(row.ref, 540, y);

    if (row.isAbnormal) {
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(705, y - 16, 60, 22);
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(row.status, 718, y);
    } else {
      ctx.fillStyle = '#16a34a';
      ctx.font = '12px sans-serif';
      ctx.fillText(row.status, 715, y);
    }

    y += 36;
  });

  // Pathology Impression Box
  y += 20;
  ctx.fillStyle = isLowIron ? '#fff1f2' : '#f0fdf4';
  ctx.fillRect(40, y, 770, 110);
  ctx.strokeStyle = isLowIron ? '#fecdd3' : '#bbf7d0';
  ctx.strokeRect(40, y, 770, 110);

  ctx.fillStyle = isLowIron ? '#9f1239' : '#166534';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('PATHOLOGY CLINICAL IMPRESSION:', 60, y + 30);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#334155';
  if (isLowIron) {
    ctx.fillText('• Microcytic hypochromic picture consistent with Iron Deficiency Anemia.', 60, y + 55);
    ctx.fillText('• Serum iron and ferritin levels significantly reduced; TIBC elevated.', 60, y + 75);
    ctx.fillText('• Recommend regular nutritional iron therapy, bioavailable food intake, and clinical follow-up.', 60, y + 95);
  } else {
    ctx.fillText('• Normal hematological profile with adequate circulating iron and iron stores.', 60, y + 55);
    ctx.fillText('• No abnormal morphologic findings observed.', 60, y + 75);
  }

  // Footer Signature
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 12px sans-serif';
  ctx.fillText('Electronically signed by Dr. K. Raman, MD (Pathology) • Reg #49281', 40, 1050);

  return canvas.toDataURL('image/png');
}

export default function BloodReportUploadModal({ 
  onClose, 
  onAnalyzed, 
  userProfile,
  currentReport 
}: BloodReportUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<{
    fileData: string;
    fileName: string;
    mimeType: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit. Please upload a smaller image or document.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        fileData: reader.result as string,
        fileName: file.name,
        mimeType: file.type || 'image/jpeg'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = (isLowIron: boolean = true) => {
    setError(null);
    const sampleImage = generateSampleReportImage(isLowIron);
    setSelectedFile({
      fileData: sampleImage,
      fileName: isLowIron ? "Sample_Lab_CBC_Low_Iron.png" : "Sample_Lab_CBC_Normal_Iron.png",
      mimeType: "image/png"
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep('Uploading report & extracting OCR text...');

    try {
      setTimeout(() => setLoadingStep('Analyzing Iron, Hemoglobin & Ferritin biomarkers...'), 900);
      setTimeout(() => setLoadingStep('Formulating personalized dietary food prescription...'), 1800);

      const response = await fetch('/api/analyze-blood-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: selectedFile.fileData,
          fileName: selectedFile.fileName,
          mimeType: selectedFile.mimeType,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze blood test report");
      }

      const reportData: BloodTestAnalysis = await response.json();
      onAnalyzed(reportData);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while analyzing the report. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Upload Blood Test Report</h3>
              <p className="text-xs text-slate-500 font-medium">
                Optional feature • Not compulsory for diet generation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Reassurance Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Not Compulsory:</strong> Uploading your blood test (e.g. CBC, Iron Profile, Ferritin) is completely optional. If uploaded, NutriAI checks your iron levels and automatically recommends regular iron-rich foods if iron is low.
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!selectedFile ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="p-4 bg-white rounded-2xl shadow-xs group-hover:scale-105 transition-transform mb-3 border border-slate-100">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">
                  Click or drag blood test report here
                </p>
                <p className="text-xs text-slate-500">
                  Supported formats: JPG, PNG, WEBP, PDF (up to 10MB)
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
              </div>

              {/* Sample Report Loader for Testing */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Or Test with a Ready Sample:
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> One-click demo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLoadSample(true)}
                    className="p-3 text-left bg-red-50/80 hover:bg-red-100/90 border border-red-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red-900">Sample Report #1</span>
                      <span className="text-[10px] font-extrabold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded-sm">Low Iron</span>
                    </div>
                    <p className="text-[11px] text-red-700/90 leading-tight">
                      CBC showing Low Iron (38 µg/dL) & Low Hemoglobin (10.1 g/dL)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSample(false)}
                    className="p-3 text-left bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-900">Sample Report #2</span>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm">Normal</span>
                    </div>
                    <p className="text-[11px] text-emerald-700/90 leading-tight">
                      CBC showing Normal Iron (95 µg/dL) & Normal Hemoglobin
                    </p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Selected File Preview */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.fileName}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedFile.mimeType}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedFile(null)}
                  disabled={isLoading}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnail Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 flex items-center justify-center">
                <img 
                  src={selectedFile.fileData} 
                  alt="Blood Report Thumbnail" 
                  className="max-h-56 w-auto object-contain mx-auto"
                />
              </div>

              {isLoading && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-in fade-in">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">{loadingStep || 'Analyzing report...'}</p>
                  <p className="text-[11px] text-emerald-700">Gemini is parsing lab biomarkers & checking iron indicators...</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Skip / Cancel
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Report...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Blood Report</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

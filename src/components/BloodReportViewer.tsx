import React, { useState } from 'react';
import { BloodTestAnalysis } from '../types';
import { 
  X, FileText, AlertTriangle, CheckCircle2, 
  ExternalLink, ZoomIn, ZoomOut, RotateCcw, 
  HeartPulse, Sparkles, ShieldAlert, Utensils,
  ChevronRight, Apple, Info, Download, Printer
} from 'lucide-react';

interface BloodReportViewerProps {
  report: BloodTestAnalysis;
  onClose: () => void;
  onReplaceReport?: () => void;
}

export default function BloodReportViewer({ report, onClose, onReplaceReport }: BloodReportViewerProps) {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'biomarkers' | 'document'>(
    report.isIronLow ? 'recommendations' : 'biomarkers'
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handlePrint = () => {
    window.print();
  };

  const isLow = report.isIronLow || report.ironStatus === 'low';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{report.reportType || "Blood Test Report"}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                  isLow 
                    ? 'bg-red-500 text-white shadow-xs' 
                    : 'bg-emerald-500 text-white'
                }`}>
                  {isLow ? 'Low Iron / Anemia Detected' : 'Normal Iron Range'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>File: <strong>{report.fileName}</strong></span>
                <span>•</span>
                <span>Analyzed on {report.analyzedAt}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            {onReplaceReport && (
              <button 
                onClick={onReplaceReport}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
              >
                Upload Different File
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all relative whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Iron Food Recommendations</span>
            {isLow && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('biomarkers')}
            className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'biomarkers'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Biomarker Lab Analysis ({report.biomarkers?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('document')}
            className={`pb-3 px-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'document'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>View Uploaded Report</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: FOOD RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Alert Status Card */}
              {isLow ? (
                <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-red-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-red-950">
                          Low Iron Detected — Take Iron-Rich Food Content Regularly
                        </h3>
                        {report.ironAdvice?.dailyIronTarget && (
                          <span className="bg-white/80 border border-red-200 text-red-700 font-bold text-xs px-3 py-1 rounded-full">
                            Daily Target: {report.ironAdvice.dailyIronTarget}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-red-900/90 leading-relaxed">
                        {report.summary}
                      </p>
                      <p className="text-xs text-red-800 font-medium">
                        {report.ironAdvice?.overview || "To restore your blood iron balance, incorporate the specific bioavailable food content below into your routine regularly."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">Healthy Iron Biomarkers</h3>
                    <p className="text-sm text-emerald-900/90 mt-1">{report.summary}</p>
                    <p className="text-xs text-emerald-800 mt-1">Keep sustaining your blood health with regular consumption of nutrient-balanced whole foods.</p>
                  </div>
                </div>
              )}

              {/* Recommended Foods Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm uppercase tracking-wider font-bold text-slate-700 flex items-center gap-2">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    Foods Recommended to Take Regularly
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Personalized to your food preference
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.ironAdvice?.recommendedFoods?.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-200/80 rounded-2xl p-4.5 hover:shadow-md transition-all hover:border-emerald-300 flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                              {item.category}
                            </span>
                            <h5 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                              {item.foodName}
                            </h5>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                              {item.ironPerServing}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Iron yield</p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <p><strong className="text-slate-700">Portion:</strong> {item.portion}</p>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <strong className="text-slate-800">Frequency:</strong>
                            <span className="bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                              {item.frequency}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.synergyTip && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/50 p-2 rounded-xl flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Absorption Tip:</strong> {item.synergyTip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Absorption Synergy & Guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Boosters */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Absorption Boosters (Do These)
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-900/90 leading-relaxed">
                    {report.ironAdvice?.absorptionBoosters?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inhibitors */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Absorption Blockers (Avoid Around Meals)
                  </div>
                  <ul className="space-y-2 text-xs text-amber-900/90 leading-relaxed">
                    {report.ironAdvice?.absorptionInhibitorsToAvoid?.map((warn, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">✕</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Clinical Findings */}
              {report.keyFindings && report.keyFindings.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    Clinical Lab Observations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {report.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BIOMARKERS TABLE */}
          {activeTab === 'biomarkers' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Extracted Lab Parameters</h3>
                  <p className="text-xs text-slate-500">Automated OCR and clinical range comparison from your uploaded blood report.</p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full">
                  {report.biomarkers?.length || 0} biomarkers identified
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3.5 px-4">Biomarker</th>
                        <th className="py-3.5 px-4">Your Value</th>
                        <th className="py-3.5 px-4">Standard Reference</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Clinical Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {report.biomarkers?.map((b, idx) => {
                        const isMarkerLow = b.status === 'low';
                        const isMarkerHigh = b.status === 'high';
                        return (
                          <tr 
                            key={idx} 
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isMarkerLow ? 'bg-red-50/30' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                              {b.name}
                              {(b.name.toLowerCase().includes('iron') || b.name.toLowerCase().includes('hemoglobin') || b.name.toLowerCase().includes('ferritin')) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" title="Key Iron Marker" />
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              <span className={isMarkerLow ? 'text-red-600' : isMarkerHigh ? 'text-amber-600' : 'text-emerald-700'}>
                                {b.value}
                              </span>
                              <span className="text-slate-400 font-normal ml-1">{b.unit}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono">
                              {b.referenceRange} {b.unit}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${
                                isMarkerLow 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : isMarkerHigh 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {isMarkerLow ? 'Low' : isMarkerHigh ? 'High' : 'Normal'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 max-w-xs leading-relaxed">
                              {b.notes || (isMarkerLow ? 'Below reference range' : isMarkerHigh ? 'Above reference range' : 'Within target range')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT PREVIEW */}
          {activeTab === 'document' && (
            <div className="space-y-4 max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-xs">{report.fileName}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">{report.fileType}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleZoomOut}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-500 px-2">{Math.round(zoomLevel * 100)}%</span>
                  <button 
                    onClick={handleZoomIn}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleResetZoom}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/5 rounded-2xl border border-slate-200 p-4 overflow-auto flex items-center justify-center min-h-[400px]">
                {report.fileData ? (
                  <div 
                    className="transition-transform duration-200 ease-out shadow-lg rounded-lg overflow-hidden bg-white max-w-full"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                  >
                    <img 
                      src={report.fileData} 
                      alt="Uploaded Blood Test Document" 
                      className="max-h-[600px] w-auto object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-xs">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Document Visual Preview</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your blood test values were successfully extracted by NutriAI. The digital biomarker records and iron recommendations are displayed in the tabs above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Optional health indicator. Consult your physician for medical diagnosis or prescription treatments.</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

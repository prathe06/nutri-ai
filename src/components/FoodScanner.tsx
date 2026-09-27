import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

interface FoodScannerProps {
  onClose: () => void;
  targets: any;
  user: any;
}

export default function FoodScanner({ onClose, targets, user }: FoodScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      // send to api
      const response = await fetch('/api/scan-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          targets,
          user
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-green-600" />
            Food Scanner
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {!image ? (
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors h-64"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium mb-1">Click to upload a food photo</p>
              <p className="text-slate-400 text-sm">JPG, PNG up to 5MB</p>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-xl overflow-hidden bg-slate-100">
                <img src={image} alt="Food" className="w-full max-h-64 object-contain" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {!result && (
                <button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Analyze Food
                    </>
                  )}
                </button>
              )}
              
              {result && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{result.foodName}</h4>
                    <p className="text-slate-500 text-sm">{result.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm sm:col-span-3 lg:col-span-1">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Calories</div>
                      <div className="font-bold text-slate-800">{result.calories} kcal</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Protein</div>
                      <div className="font-bold text-blue-600">{result.protein}g</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Carbs</div>
                      <div className="font-bold text-amber-500">{result.carbs}g</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Fat</div>
                      <div className="font-bold text-red-400">{result.fat}g</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Fiber</div>
                      <div className="font-bold text-emerald-500">{result.fiber}g</div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl flex items-start gap-3 ${result.isRecommended ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="mt-0.5">
                      {result.isRecommended ? (
                        <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                      ) : (
                        <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">X</div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold mb-1">{result.isRecommended ? 'Yes, you can eat this!' : 'No, better avoid this!'}</h5>
                      <p className="text-sm opacity-90">{result.advice}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

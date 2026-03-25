'use client'
import { useState } from 'react';
import Scanner from '@/components/Scanner';
import { Database, Info, AlertTriangle, CheckCircle2, ScanLine } from 'lucide-react';

export default function IngestionPage() {
  const [assetInfo, setAssetInfo] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Mock profile data - Replace this with your actual user/auth logic
  const profile = {
    id: 'user_123',
    name: 'Operator Name',
    role: 'technician'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">
          Ingestion Terminal
        </h1>
        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">
          Live Scanner Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: The Camera View */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <Scanner 
            userProfile={profile} // Pass the required profile here
            onResult={(data) => {
              setAssetInfo(data);
              setIsScanning(false);
            }} 
          />
        </div>

        {/* Right: The Detected Info */}
        <div className="space-y-4">
          {assetInfo ? (
            <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-2xl text-white">
                  <Database size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Asset Identified</p>
                  <h2 className="text-xl font-black text-slate-900">{assetInfo.serial_number}</h2>
                </div>
              </div>

              <div className="space-y-3">
                <InfoItem label="Current Status" value={assetInfo.status} highlight />
                <InfoItem label="Last Inspection" value={new Date(assetInfo.last_test).toLocaleDateString()} />
                <InfoItem label="Owner/Fleet" value={assetInfo.owner_name} />
              </div>

              <button 
                onClick={() => { setAssetInfo(null); setIsScanning(true); }}
                className="w-full mt-8 bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors"
              >
                Scan Next Asset
              </button>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
              <div className="animate-bounce mb-4 text-slate-300">
                <ScanLine size={48} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Position barcode within <br/> the viewfinder to retrieve data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight = false }: any) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
      <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>
      <span className={`text-xs font-bold uppercase ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>
        {value || 'N/A'}
      </span>
    </div>
  );
}
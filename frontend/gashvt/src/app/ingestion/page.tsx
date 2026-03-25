'use client'
import { useState } from 'react';
import Scanner from '@/components/Scanner';
import { ScanLine, Keyboard, FileUp, Database, PlusCircle } from 'lucide-react';

export default function IngestionPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'bulk'>('scan');
  
  // Reuse your profile fetching logic here as done in barcode-scan
  const [profile, setProfile] = useState<any>({ role: 'admin' }); 

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Data Ingestion Terminal</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select entry method for cylinders & batches</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <TabButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={<ScanLine size={14}/>} label="Scanner" />
        <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} icon={<Keyboard size={14}/>} label="Manual Entry" />
        <TabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} icon={<FileUp size={14}/>} label="CSV Upload" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          {activeTab === 'scan' && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm aspect-video">
              <Scanner userProfile={profile} onResult={(data) => console.log(data)} />
            </div>
          )}

          {activeTab === 'manual' && <ManualEntryForm />}
          
          {activeTab === 'bulk' && <BulkUploadZone />}
        </div>

        {/* Sidebar: Recent Activity / Batch Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-400" size={20} />
              <h2 className="font-black uppercase tracking-widest text-[11px]">Current Batch Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total Units" value="00" />
              <StatCard label="Avg Capacity" value="0.0kg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function ManualEntryForm() {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Cylinder ID" placeholder="e.g. LGC-9901" />
        <InputGroup label="Capacity (kg)" placeholder="14.2" type="number" />
        <InputGroup label="Location PIN" placeholder="560001" />
        <InputGroup label="Customer Name" placeholder="Internal Stock" />
      </div>
      <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
        <PlusCircle size={16} /> Register Cylinder
      </button>
    </div>
  );
}

function BulkUploadZone() {
  return (
    <div className="border-4 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50">
      <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
        <FileUp size={32} className="text-blue-600" />
      </div>
      <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">
        Drop your CSV here or <span className="text-blue-600">Browse Files</span>
      </p>
      <p className="text-[9px] text-slate-400 mt-2 uppercase">Supports .csv, .xlsx (Max 500 rows per batch)</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
    >
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase text-slate-400 tracking-tighter ml-1">{label}</label>
      <input {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors" />
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
      <p className="text-[8px] font-black uppercase text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
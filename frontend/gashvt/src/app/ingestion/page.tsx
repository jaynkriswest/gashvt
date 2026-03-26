'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Scanner from '@/components/Scanner';
import { ScanLine, Keyboard, FileUp, Database, PlusCircle, Loader2, UploadCloud } from 'lucide-react';

export default function IngestionPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'bulk'>('scan');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Filter & Stats States
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, avg: 0 });

  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      await refreshAll();
      setLoading(false);
    }
    initialize();
  }, []);

  // Re-fetch stats when user changes dropdowns
  useEffect(() => {
    if (!loading) fetchFilteredStats();
  }, [selectedBatch, selectedWeight, loading]);

  async function refreshAll() {
    await fetchBatches();
    await fetchFilteredStats();
  }

  async function fetchBatches() {
    const { data } = await supabase.from('cylinders').select('batch_id');
    if (data) {
      const unique = Array.from(new Set(data.map(i => i.batch_id).filter(Boolean)));
      setBatches(unique as string[]);
    }
  }

  async function fetchFilteredStats() {
    // FIX: Using exact count AND a range to bypass the 500-row limit for average calculation
    let query = supabase
      .from('cylinders')
      .select('Capacity_kg', { count: 'exact' })
      .range(0, 2000); 

    if (selectedBatch !== 'all') query = query.eq('batch_id', selectedBatch);
    if (selectedWeight !== 'all') query = query.eq('Capacity_kg', parseFloat(selectedWeight));

    const { data, count, error } = await query;
    if (!error && data) {
      const total = count || 0;
      const sum = data.reduce((acc, curr) => acc + (Number(curr.Capacity_kg) || 0), 0);
      setStats({ 
        total, 
        avg: total > 0 ? parseFloat((sum / data.length).toFixed(1)) : 0 
      });
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Data Ingestion Terminal</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Select Entry Method for Cylinders & Batches</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Methods */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
            <TabButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} label="Scanner" icon={<ScanLine size={14}/>} />
            <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} label="Manual Entry" icon={<Keyboard size={14}/>} />
            <TabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} label="CSV Upload" icon={<FileUp size={14}/>} />
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm min-h-[450px]">
            {activeTab === 'scan' && <Scanner userProfile={profile} onResult={refreshAll} />}
            {activeTab === 'manual' && <ManualEntryForm onRefresh={refreshAll} />}
            {activeTab === 'bulk' && <BulkUploadZone onRefresh={refreshAll} />}
          </div>
        </div>

        {/* Right: Stats & Internal Filters */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6 border border-slate-800 sticky top-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20"><Database size={20} /></div>
              <h2 className="font-black uppercase tracking-widest text-[12px]">
                {selectedBatch === 'all' ? 'Global Fleet Stats' : `Batch: ${selectedBatch}`}
              </h2>
            </div>

            {/* UPDATED: Filters placed strictly at the top of the stats within the box */}
            <div className="grid grid-cols-2 gap-4 p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <SidebarFilter label="Filter by Batch" value={selectedBatch} onChange={setSelectedBatch} options={['all', ...batches]} />
              <SidebarFilter label="Weight Class" value={selectedWeight} onChange={setSelectedWeight} options={['all', '14.2', '19.0', '5.0', '47.5']} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <StatCard label="Total Units in View" value={stats.total.toLocaleString()} />
              <StatCard label="Avg. Unit Capacity" value={`${stats.avg} kg`} />
            </div>

            <div className="pt-4 text-center border-t border-slate-800">
                <p className="text-[7px] font-black uppercase text-slate-500 tracking-[0.3em]">System Live Sync: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Support Components ---

function SidebarFilter({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-1">{label}</p>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all cursor-pointer text-white"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt === 'all' ? `Show All` : opt}</option>)}
      </select>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
      <p className="text-[9px] font-black uppercase text-slate-500 mb-1 tracking-widest">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function ManualEntryForm({ onRefresh }: any) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('cylinders').insert([{
      Cylinder_ID: formData.get('Cylinder_ID'),
      Capacity_kg: parseFloat(formData.get('Capacity_kg') as string),
      Location_PIN: formData.get('Location_PIN'),
      batch_id: formData.get('batch_id'),
      status: 'Available'
    }]);

    if (!error) { onRefresh(); (e.target as HTMLFormElement).reset(); }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <InputGroup name="Cylinder_ID" label="Cylinder ID" placeholder="LGC-0001" required />
        <InputGroup name="batch_id" label="Batch ID" placeholder="BATCH-001" required />
        <InputGroup name="Capacity_kg" label="Capacity (kg)" type="number" step="0.1" required />
        <InputGroup name="Location_PIN" label="PIN Code" required />
      </div>
      <button disabled={submitting} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all">
        {submitting ? 'Adding...' : 'Add Cylinder to Fleet'}
      </button>
    </form>
  );
}

function BulkUploadZone({ onRefresh }: any) {
  return (
    <div className="p-16 flex flex-col items-center justify-center text-center h-full space-y-6">
      <div className="p-8 bg-blue-50 text-blue-600 rounded-[2rem] border-2 border-blue-100">
        <UploadCloud size={48} />
      </div>
      <h3 className="font-black uppercase text-sm text-slate-800">Bulk CSV Ingestion</h3>
      <label className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-blue-600">
        Choose CSV File
        <input type="file" className="hidden" accept=".csv" onChange={() => onRefresh()} />
      </label>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>
      {icon} {label}
    </button>
  );
}

function InputGroup({ label, name, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{label}</label>
      <input name={name} {...props} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500" />
    </div>
  );
}
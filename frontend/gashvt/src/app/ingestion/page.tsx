'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Scanner from '@/components/Scanner';
import { ScanLine, Keyboard, FileUp, Database, PlusCircle, Loader2, Filter } from 'lucide-react';

export default function IngestionPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'bulk'>('scan');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Filter States
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  
  // Stats State
  const [stats, setStats] = useState({ total: 0, avg: 0 });

  useEffect(() => {
    async function initialize() {
      // Get User Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      
      await fetchBatches();
      await fetchFilteredStats();
      setLoading(false);
    }
    initialize();
  }, [supabase]);

  // Re-fetch stats when filters change
  useEffect(() => {
    if (!loading) fetchFilteredStats();
  }, [selectedBatch, selectedWeight]);

  async function fetchBatches() {
    const { data } = await supabase.from('cylinders').select('batch_id');
    if (data) {
      const uniqueBatches = Array.from(new Set(data.map(item => item.batch_id).filter(Boolean)));
      setBatches(uniqueBatches as string[]);
    }
  }

  async function fetchFilteredStats() {
    let query = supabase.from('cylinders').select('Capacity_kg', { count: 'exact' });

    if (selectedBatch !== 'all') {
      query = query.eq('batch_id', selectedBatch);
    }
    
    if (selectedWeight !== 'all') {
      query = query.eq('Capacity_kg', parseFloat(selectedWeight));
    }

    const { data, count, error } = await query;

    if (!error && data) {
      const total = count || 0;
      const sum = data.reduce((acc, curr) => acc + (Number(curr.Capacity_kg) || 0), 0);
      const average = total > 0 ? sum / total : 0;
      setStats({ total, avg: parseFloat(average.toFixed(1)) });
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Ingestion Terminal</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Fleet Management</p>
        </div>
        
        <div className="flex gap-3">
          <FilterSelect 
            label="Batch ID" 
            value={selectedBatch} 
            onChange={setSelectedBatch}
            options={['all', ...batches]} 
          />
          <FilterSelect 
            label="Weight Class" 
            value={selectedWeight} 
            onChange={setSelectedWeight}
            options={['all', '14.2', '19.0', '5.0', '47.5']} 
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            <TabButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} label="Scanner" />
            <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} label="Manual" />
          </div>

          {activeTab === 'scan' ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden aspect-video relative">
              {/* FIXED: Added userProfile={profile} below */}
              <Scanner 
                userProfile={profile} 
                onResult={async () => await fetchFilteredStats()} 
              />
            </div>
          ) : (
            <ManualEntryForm onRefresh={() => fetchFilteredStats()} />
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl border border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-600 rounded-lg"><Database size={18} /></div>
              <h2 className="font-black uppercase tracking-widest text-[11px]">
                {selectedBatch === 'all' ? 'Global Fleet Stats' : `Batch: ${selectedBatch}`}
              </h2>
            </div>

            <div className="space-y-6">
              <StatCard label="Cylinders in Filter" value={stats.total.toLocaleString()} />
              <StatCard label="Avg. Capacity" value={`${stats.avg} kg`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Helper Components ---

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-black uppercase text-slate-500 ml-1">{label}</span>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-colors cursor-pointer shadow-sm"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt === 'all' ? `All ${label}s` : opt}</option>
        ))}
      </select>
    </div>
  );
}

function ManualEntryForm({ onRefresh }: { onRefresh: () => void }) {
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
      status: 'Available',
      batch_id: 'MANUAL'
    }]);

    if (!error) {
      onRefresh();
      (e.target as HTMLFormElement).reset();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <InputGroup name="Cylinder_ID" label="Cylinder ID" placeholder="LGC-001" required />
        <InputGroup name="Capacity_kg" label="Capacity (kg)" type="number" step="0.1" required />
        <InputGroup name="Location_PIN" label="Current PIN" required />
        <InputGroup name="Customer" label="Assignment" placeholder="Internal" />
      </div>
      <button disabled={submitting} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all">
        {submitting ? 'Processing...' : 'Register Cylinder'}
      </button>
    </form>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
      <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
      {label}
    </button>
  );
}

function InputGroup({ label, name, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase text-slate-400 tracking-tighter ml-1">{label}</label>
      <input name={name} {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors" />
    </div>
  );
}
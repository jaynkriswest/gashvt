'use client'
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Package, Loader2, Search, Filter } from 'lucide-react';

export default function BulkProcessingView({ userProfile }: { userProfile?: any }) {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCylinders() {
      const { data } = await supabase.from('cylinders').select('*').order('Batch_ID', { ascending: true });
      if (data) setCylinders(data);
      setLoading(false);
    }
    fetchCylinders();
  }, [supabase]);

  const filteredBatches = useMemo(() => {
    const filteredList = cylinders.filter(u => {
      const matchesSearch = u.Cylinder_ID.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || u.Status === statusFilter;
      const matchesBatch = batchFilter === 'ALL' || u.Batch_ID === batchFilter;
      return matchesSearch && matchesStatus && matchesBatch;
    });

    return filteredList.reduce((acc: any, unit: any) => {
      const bId = unit.Batch_ID || 'UNASSIGNED';
      if (!acc[bId]) acc[bId] = [];
      acc[bId].push(unit);
      return acc;
    }, {});
  }, [cylinders, searchTerm, statusFilter, batchFilter]);

  const uniqueBatches = useMemo(() => Array.from(new Set(cylinders.map(u => u.Batch_ID).filter(Boolean))), [cylinders]);

  const handleStatusUpdate = async (ids: string[], newStatus: string) => {
    const { error } = await supabase.from('cylinders').update({ Status: newStatus }).in('Cylinder_ID', ids);
    if (!error) {
      setCylinders(prev => prev.map(u => ids.includes(u.Cylinder_ID) ? { ...u, Status: newStatus } : u));
      router.refresh();
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search Bar - Fixed hardcoded bg-slate-950 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-brand-panel p-4 rounded-2xl border border-brand-border shadow-xl transition-colors">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Search ID..."
            className="w-full bg-brand-dark border border-brand-border rounded-xl py-2 pl-10 pr-4 text-xs text-text-main outline-none focus:border-blue-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-brand-dark border border-brand-border rounded-xl py-2 px-4 text-[10px] text-slate-500 font-bold uppercase outline-none cursor-pointer transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="EMPTY">Empty</option>
            <option value="FULL">Full</option>
            <option value="DAMAGED">Damaged</option>
          </select>

          <select 
            onChange={(e) => setBatchFilter(e.target.value)}
            className="flex-1 bg-brand-dark border border-brand-border rounded-xl py-2 px-4 text-[10px] text-slate-500 font-bold uppercase outline-none cursor-pointer transition-colors"
          >
            <option value="ALL">All Batches</option>
            {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Batch Cards - Fixed hardcoded bg-[#0d1117]/40 */}
      {Object.entries(filteredBatches).map(([batchId, units]: [string, any]) => (
        <div key={batchId} className="bg-brand-panel rounded-3xl border border-brand-border overflow-hidden shadow-sm transition-colors">
          <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-panel/50 backdrop-blur-sm transition-colors">
            <div>
              <h2 className="text-blue-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Package size={14} /> {batchId}
              </h2>
              <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">{units.length} Units</p>
            </div>
            <button 
              onClick={() => handleStatusUpdate(units.map((u:any) => u.Cylinder_ID), 'FULL')}
              className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all"
            >
              Mark All Full
            </button>
          </div>

          <div className="divide-y divide-brand-border max-h-96 overflow-y-auto custom-scrollbar transition-colors">
            {units.map((unit: any) => (
              <div key={unit.Cylinder_ID} className="px-6 py-3 flex items-center justify-between hover:bg-brand-dark/10 transition-colors">
                <span className="text-text-main font-mono text-[11px] font-bold">{unit.Cylinder_ID}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-[9px] font-black px-2 py-1 rounded border ${
                    unit.Status === 'FULL' ? 'border-emerald-500/30 text-emerald-500' : 'border-brand-border text-slate-500'
                  }`}>
                    {unit.Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client'
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckSquare, Square, Loader2, Package, Search, Filter } from 'lucide-react';

interface BulkProcessingViewProps {
  userProfile?: any;
}

export default function BulkProcessingView({ userProfile }: BulkProcessingViewProps) {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 1. SEARCH & FILTER STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCylinders() {
      const { data } = await supabase
        .from('cylinders')
        .select('*')
        .order('Batch_ID', { ascending: true });
      if (data) setCylinders(data);
      setLoading(false);
    }
    fetchCylinders();
  }, [supabase]);

  // 2. FILTERING LOGIC
  const filteredBatches = useMemo(() => {
    // First, filter the raw list
    const filteredList = cylinders.filter(u => {
      const matchesSearch = u.Cylinder_ID.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || u.Status === statusFilter;
      const matchesBatch = batchFilter === 'ALL' || u.Batch_ID === batchFilter;
      return matchesSearch && matchesStatus && matchesBatch;
    });

    // Then, group them into batches for the UI
    return filteredList.reduce((acc: any, unit: any) => {
      const bId = unit.Batch_ID || 'UNASSIGNED';
      if (!acc[bId]) acc[bId] = [];
      acc[bId].push(unit);
      return acc;
    }, {});
  }, [cylinders, searchTerm, statusFilter, batchFilter]);

  // Unique Batch IDs for the filter dropdown
  const uniqueBatches = useMemo(() => 
    Array.from(new Set(cylinders.map(u => u.Batch_ID).filter(Boolean))), 
  [cylinders]);

  const handleStatusUpdate = async (ids: string[], newStatus: string) => {
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .in('Cylinder_ID', ids);

    if (!error) {
      setCylinders(prev => prev.map(u => ids.includes(u.Cylinder_ID) ? { ...u, Status: newStatus } : u));
      setSelectedIds([]);
      router.refresh();
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* 3. SEARCH & FILTER AREA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Search Serial Number..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-xs text-slate-400 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="EMPTY">Empty</option>
          <option value="FULL">Full</option>
          <option value="DAMAGED">Damaged</option>
        </select>

        <select 
          onChange={(e) => setBatchFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-xs text-slate-400 outline-none"
        >
          <option value="ALL">All Batches</option>
          {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* RENDER BATCHES (Same logic as before, using filteredBatches) */}
      {Object.entries(filteredBatches).map(([batchId, units]: [string, any]) => (
        <div key={batchId} className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Batch: {batchId} ({units.length} Units)
            </h2>
          </div>
          {/* ... existing unit mapping row logic ... */}
          {units.map((unit: any) => (
             <div key={unit.Cylinder_ID} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-blue-400 font-mono text-xs">{unit.Cylinder_ID}</span>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${unit.Status === 'FULL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                  {unit.Status}
                </span>
             </div>
          ))}
        </div>
      ))}
    </div>
  );
}

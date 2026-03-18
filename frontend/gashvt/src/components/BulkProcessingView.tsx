'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckSquare, Square, Loader2, Package, ChevronRight } from 'lucide-react';

export default function BulkProcessingView() {
  const [batches, setBatches] = useState<Record<string, any[]>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // 1. Fetch data and group by Batch_ID
  useEffect(() => {
    async function fetchCylinders() {
      const { data, error } = await supabase
        .from('cylinders')
        .select('*')
        .order('Batch_ID', { ascending: true });

      if (data) {
        const grouped = data.reduce((acc: any, unit: any) => {
          const bId = unit.Batch_ID || 'UNASSIGNED';
          if (!acc[bId]) acc[bId] = [];
          acc[bId].push(unit);
          return acc;
        }, {});
        setBatches(grouped);
      }
      setLoading(false);
    }
    fetchCylinders();
  }, [supabase]);

  // 2. Logic: Toggle individual selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 3. Logic: Select an entire batch at once
  const toggleBatch = (batchId: string, unitIds: string[]) => {
    const allInBatchSelected = unitIds.every(id => selectedIds.includes(id));
    if (allInBatchSelected) {
      setSelectedIds(prev => prev.filter(id => !unitIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...unitIds])]);
    }
  };

  // 4. Action: Single status update
  const handleSingleUpdate = async (id: string, status: string) => {
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: status })
      .eq('Cylinder_ID', id);
    if (!error) router.refresh();
  };

  // 5. Action: Bulk status update
  const handleBulkUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .in('Cylinder_ID', selectedIds);

    if (!error) {
      setSelectedIds([]);
      router.refresh(); // Refresh data to show new statuses
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={32} />
      <span className="text-slate-500 text-xs font-black uppercase">Loading Logistics Data...</span>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Bulk Processing</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Inventory Management</p>
      </header>

      {/* BULK ACTION BAR: Sticky for mobile */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-50 bg-[#0d1117] border border-blue-500/50 p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-blue-500/10 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-white font-black text-xs uppercase tracking-tighter">{selectedIds.length} Assets Selected</span>
            <button onClick={() => setSelectedIds([])} className="text-[9px] text-blue-400 font-bold uppercase text-left">Clear Selection</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleBulkUpdate('FULL')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">Mark Full</button>
            <button onClick={() => handleBulkUpdate('EMPTY')} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-700">Mark Empty</button>
          </div>
        </div>
      )}

      {/* RENDER BATCHES */}
      {Object.entries(batches).map(([batchId, units]) => (
        <section key={batchId} className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-500" />
              <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Batch: {batchId}</h2>
            </div>
            <button 
              onClick={() => toggleBatch(batchId, units.map(u => u.Cylinder_ID))}
              className="text-blue-500 text-[9px] font-black uppercase hover:underline"
            >
              Select Entire Batch
            </button>
          </div>

          <div className="space-y-2">
            {units.map((unit) => {
              const isSelected = selectedIds.includes(unit.Cylinder_ID);
              return (
                <div 
                  key={unit.Cylinder_ID} 
                  className={`grid grid-cols-1 md:grid-cols-4 items-center px-4 py-3 rounded-xl border transition-all gap-3 ${
                    isSelected ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Checkbox & ID */}
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSelect(unit.Cylinder_ID)} className={isSelected ? 'text-blue-500' : 'text-slate-600'}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <div className="flex flex-col">
                      <span className="text-blue-400 font-mono text-[11px] font-bold">{unit.Cylinder_ID}</span>
                      <span className="text-[8px] text-slate-600 uppercase font-black">Identity</span>
                    </div>
                  </div>

                  {/* Toggle Group */}
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit">
                    <button onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'EMPTY')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase ${unit.Status === 'EMPTY' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Empty</button>
                    <button onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'FULL')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase ${unit.Status === 'FULL' ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-600'}`}>Full</button>
                  </div>

                  {/* Status Indicator */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${unit.Status === 'FULL' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    <span className="text-slate-400 font-bold text-[10px] uppercase">{unit.Status}</span>
                  </div>

                  {/* Flag Action */}
                  <div className="text-right flex justify-end">
                    <button 
                      onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'Damaged')}
                      className={`flex items-center gap-1 text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border ${unit.Status === 'Damaged' ? 'bg-red-500 text-white' : 'border-slate-800 text-slate-500'}`}
                    >
                      <AlertTriangle size={10}/> {unit.Status === 'Damaged' ? 'Flagged' : 'Flag Damaged'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
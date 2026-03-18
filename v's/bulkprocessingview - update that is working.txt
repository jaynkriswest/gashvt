'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckSquare, Square, Loader2, Package, CheckCircle2 } from 'lucide-react';

// 1. ADD PROPS INTERFACE TO FIX THE COMPILATION ERROR
interface BulkProcessingViewProps {
  userProfile?: any;
}

// 2. UPDATE FUNCTION SIGNATURE TO ACCEPT THE PROP
export default function BulkProcessingView({ userProfile }: BulkProcessingViewProps) {
  const [batches, setBatches] = useState<Record<string, any[]>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleBatch = (batchId: string, unitIds: string[]) => {
    const allInBatchSelected = unitIds.every(id => selectedIds.includes(id));
    if (allInBatchSelected) {
      setSelectedIds(prev => prev.filter(id => !unitIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...unitIds])]);
    }
  };

  const handleStatusUpdate = async (ids: string[], newStatus: string) => {
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .in('Cylinder_ID', ids);

    if (!error) {
      setSelectedIds([]);
      router.refresh(); 
      const updatedBatches = { ...batches };
      Object.keys(updatedBatches).forEach(bId => {
        updatedBatches[bId] = updatedBatches[bId].map(u => 
          ids.includes(u.Cylinder_ID) ? { ...u, Status: newStatus } : u
        );
      });
      setBatches(updatedBatches);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. BULK ACTION BAR: Visible only when items are checked */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-50 bg-[#0d1117] border border-blue-500 p-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-white font-black text-xs uppercase tracking-tighter">
              {selectedIds.length} Selected
            </span>
            <button 
              onClick={() => setSelectedIds([])} 
              className="text-[9px] text-blue-400 font-bold uppercase text-left"
            >
              Deselect All
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleStatusUpdate(selectedIds, 'FULL')} 
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase"
            >
              Mark Full
            </button>
            <button 
              onClick={() => handleStatusUpdate(selectedIds, 'EMPTY')} 
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase border border-slate-700"
            >
              Mark Empty
            </button>
          </div>
        </div>
      )}

      {/* 2. BATCH LISTING */}
      {Object.entries(batches).map(([batchId, units]) => (
        <div key={batchId} className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Batch: {batchId}
            </h2>
            <button 
              onClick={() => toggleBatch(batchId, units.map(u => u.Cylinder_ID))} 
              className="text-blue-500 text-[9px] font-black uppercase"
            >
              Select Batch
            </button>
          </div>

          <div className="space-y-2">
            {units.map((unit) => {
              const isSelected = selectedIds.includes(unit.Cylinder_ID);
              return (
                <div 
                  key={unit.Cylinder_ID} 
                  className={`grid grid-cols-1 md:grid-cols-4 items-center px-4 py-3 rounded-xl border transition-all gap-3 ${
                    isSelected ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  {/* IDENTITY SECTION */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleSelect(unit.Cylinder_ID)} 
                      className={isSelected ? 'text-blue-500' : 'text-slate-600'}
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <div className="flex flex-col">
                      <span className="text-blue-400 font-mono text-[11px] font-bold">
                        {unit.Cylinder_ID}
                      </span>
                      <span className="text-[8px] text-slate-600 uppercase font-black">Identity</span>
                    </div>
                  </div>

                  {/* QUICK TOGGLE SECTION */}
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit">
                    <button 
                      onClick={() => handleStatusUpdate([unit.Cylinder_ID], 'EMPTY')} 
                      className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase ${
                        unit.Status === 'EMPTY' ? 'bg-slate-800 text-white' : 'text-slate-600'
                      }`}
                    >
                      Empty
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate([unit.Cylinder_ID], 'FULL')} 
                      className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase ${
                        unit.Status === 'FULL' ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-600'
                      }`}
                    >
                      Full
                    </button>
                  </div>

                  {/* STATUS INFO */}
                  <div className="hidden md:flex flex-col">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">
                      {unit.Status}
                    </span>
                    <span className="text-[8px] text-slate-600 uppercase font-black">Current Status</span>
                  </div>

                  {/* FLAG ACTION */}
                  <div className="text-right">
                    <button 
                      onClick={() => handleStatusUpdate([unit.Cylinder_ID], 'Damaged')} 
                      className={`flex items-center gap-1 text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                        unit.Status === 'Damaged' 
                        ? 'bg-red-500 text-white border-red-500' 
                        : 'border-slate-800 text-slate-500'
                      }`}
                    >
                      <AlertTriangle size={10}/> 
                      {unit.Status === 'Damaged' ? 'Flagged' : 'Flag Damaged'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
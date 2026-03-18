'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2, AlertTriangle, Clock, FlaskConical, CheckSquare, Square } from 'lucide-react';

export default function BulkProcessingView() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // ... other existing states like 'batches'

  // Helper to toggle selection for a single unit
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Helper to update all selected units at once
  const handleBulkUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    
    const supabase = createClient();
    const { error } = await supabase
      .from('cylinders') // adjust to your actual table name
      .update({ Status: newStatus })
      .in('Cylinder_ID', selectedIds);

    if (!error) {
      // Refresh your data or update local state here
      setSelectedIds([]); // Clear selection after success
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. BULK ACTION BAR: Only appears when items are checked */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 bg-blue-600/20 border border-blue-500 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
              <CheckSquare size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xs uppercase tracking-tighter">
                {selectedIds.length} Units Selected
              </span>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-[9px] text-blue-400 font-bold uppercase text-left hover:text-white"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkUpdate('FULL')}
              className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-emerald-900/20"
            >
              Mark Full
            </button>
            <button 
              onClick={() => handleBulkUpdate('EMPTY')}
              className="bg-slate-800 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase border border-slate-700"
            >
              Mark Empty
            </button>
          </div>
        </div>
      )}

      {/* 2. UNIT LIST */}
      <div className="space-y-2">
        {batches[batchId].map((unit) => {
          const isSelected = selectedIds.includes(unit.Cylinder_ID);
          
          return (
            <div 
              key={unit.Cylinder_ID} 
              className={`grid grid-cols-1 md:grid-cols-4 items-center px-4 py-3 rounded-xl border transition-all gap-3 ${
                isSelected 
                ? 'bg-blue-500/10 border-blue-500/50' 
                : 'hover:bg-slate-800/40 border-transparent hover:border-slate-700'
              }`}
            >
              {/* Checkbox Column */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleSelect(unit.Cylinder_ID)}
                  className={`transition-colors ${isSelected ? 'text-blue-500' : 'text-slate-600'}`}
                >
                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                
                <div className="flex flex-col">
                  <span className="text-blue-400 font-mono text-[11px] font-bold">{unit.Cylinder_ID}</span>
                  <span className="text-[8px] text-slate-600 uppercase font-black tracking-tighter">Unit Identity</span>
                </div>
              </div>

              {/* TOGGLE GROUP: One-tap status updates */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit">
                <button
                  onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'EMPTY')}
                  className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${
                    unit.Status === 'EMPTY' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  Empty
                </button>
                <button
                  onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'FULL')}
                  className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${
                    unit.Status === 'FULL' ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  Full
                </button>
                <button
                  onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'TESTING')}
                  className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${
                    unit.Status === 'TESTING' ? 'bg-amber-500/20 text-amber-500' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  Testing
                </button>
              </div>

              {/* BATCH INFO */}
              <div className="hidden md:flex flex-col">
                <span className="text-slate-400 font-bold text-[10px]">{unit.Batch_ID || 'NO BATCH'}</span>
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-tighter">Batch Reference</span>
              </div>

              {/* QUICK FLAG ACTION */}
              <div className="text-right flex justify-end gap-2">
                <button 
                  onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'Damaged')}
                  className={`flex items-center gap-1 text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all ${
                    unit.Status === 'Damaged' 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-transparent text-slate-500 border-slate-800 hover:border-red-500/50 hover:text-red-500'
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
  );
}
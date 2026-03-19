'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView({ userProfile }: { userProfile: any }) {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingBatch, setUpdatingBatch] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCylinders() {
      let query = supabase.from('cylinders').select('Cylinder_ID, batch_id, Status, owner_company');
      
      if (userProfile?.role !== 'Admin' && userProfile?.client_link) {
        query = query.eq('owner_company', userProfile.client_link);
      }

      const { data } = await query.order('batch_id', { ascending: true });
      if (data) setCylinders(data);
      setLoading(false);
    }
    fetchCylinders();
  }, [userProfile, supabase]);

  const batches = cylinders.reduce((acc: any, curr) => {
    const batchId = curr.batch_id || 'UNBATCHED';
    if (!acc[batchId]) acc[batchId] = []; // FIXED: Corrected the syntax error here
    acc[batchId].push(curr);
    return acc;
  }, {});

  const handleBatchUpdate = async (batchId: string, newStatus: string) => {
    setUpdatingBatch(batchId);
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .eq('batch_id', batchId);

    if (!error) {
      setCylinders(prev => prev.map(c => 
        c.batch_id === batchId ? { ...c, Status: newStatus } : c
      ));
    }
    setUpdatingBatch(null);
  };

  const handleSingleUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .eq('Cylinder_ID', id);

    if (!error) {
      setCylinders(prev => prev.map(c => 
        c.Cylinder_ID === id ? { ...c, Status: newStatus } : c
      ));
    }
  };

  return (
    <div className="space-y-8">
      {Object.keys(batches).map(batchId => (
        /* FIXED: Replaced hardcoded #0d1117 with brand-panel */
        <div key={batchId} className="bg-brand-panel border border-brand-border rounded-2xl overflow-hidden shadow-xl transition-colors">
          
          {/* BATCH HEADER */}
          <div className="bg-brand-panel p-4 flex justify-between items-center border-b border-brand-border">
            <div>
              <h3 className="text-blue-500 font-black text-xs uppercase tracking-widest">{batchId}</h3>
              <p className="text-slate-500 text-[9px] font-mono">{batches[batchId].length} UNITS DETECTED</p>
            </div>
            
            <div className="flex gap-2">
              <span className="text-[9px] text-slate-500 font-bold self-center mr-2">BATCH ACTION:</span>
              <button 
                onClick={() => handleBatchUpdate(batchId, 'FULL')}
                className="bg-blue-600/10 border border-blue-500/30 text-blue-500 text-[9px] px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition-all"
              >
                MARK ALL FULL
              </button>
              <button 
                onClick={() => handleBatchUpdate(batchId, 'EMPTY')}
                className="bg-brand-dark border border-brand-border text-slate-500 text-[9px] px-3 py-1 rounded hover:bg-brand-border transition-all"
              >
                RESET TO EMPTY
              </button>
            </div>
          </div>

          {/* INDIVIDUAL UNIT LIST */}
          <div className="max-h-48 overflow-y-auto divide-y divide-brand-border">
            {batches[batchId].map((unit: any) => (
              /* FIXED: Removed text-white and hover:bg-slate-800 */
              <div key={unit.Cylinder_ID} className="grid grid-cols-3 p-3 items-center hover:bg-blue-500/5 transition-colors">
                <span className="text-text-main font-mono text-[10px] font-bold">{unit.Cylinder_ID}</span>
                
                <select 
                  value={unit.Status}
                  onChange={(e) => handleSingleUpdate(unit.Cylinder_ID, e.target.value)}
                  className="bg-transparent text-slate-500 text-[10px] uppercase font-bold outline-none cursor-pointer"
                >
                  <option value="EMPTY">EMPTY</option>
                  <option value="FULL">FULL</option>
                  <option value="Damaged">DAMAGED</option>
                  <option value="TESTING">TESTING</option>
                </select>

                <div className="text-right">
                   {unit.Status === 'Damaged' && <span className="text-red-500 text-[8px] font-black border border-red-500/30 px-2 py-0.5 rounded">FLAGGED</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
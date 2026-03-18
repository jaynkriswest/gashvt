'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle2, AlertTriangle, Clock, FlaskConical } from 'lucide-react';

// ... inside your unit mapping logic

{batches[batchId].map((unit) => (
  <div key={unit.Cylinder_ID} className="grid grid-cols-1 md:grid-cols-3 items-center px-4 py-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-700 transition-all gap-3">
    
    {/* Identity Column */}
    <div className="flex flex-col">
      <span className="text-blue-400 font-mono text-[11px] font-bold">{unit.Cylinder_ID}</span>
      <span className="text-[8px] text-slate-600 uppercase font-black tracking-tighter">Unit Identity</span>
    </div>

    {/* TOGGLE GROUP: One-tap status updates */}
    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit">
      <button
        onClick={() => handleSingleUpdate(unit.Cylinder_ID, 'EMPTY')}
        className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${
          unit.Status === 'EMPTY' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'
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
))}
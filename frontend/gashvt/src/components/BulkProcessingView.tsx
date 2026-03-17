'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function loadAllRecords() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cylinders')
      .select('*')
      .order('last_updated', { ascending: false }) 
      .limit(100); 

    if (!error) setData(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAllRecords();
  }, []);

  const filteredRecords = data.filter((item) => 
    item.Cylinder_ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* 1. COMPACT HEADER */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
          <div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">Batch Operation Hub</h2>
            <p className="text-slate-500 text-[10px] font-mono">Viewing {filteredRecords.length} Units</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Search Cylinder or Batch..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-xs text-white focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. FIXED HEIGHT SCROLLABLE CONTAINER */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-slate-900 text-slate-500 text-[9px] uppercase tracking-widest sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-6 py-3 w-1/3">Cylinder Identity</th>
                <th className="px-6 py-3 w-1/4">Batch</th>
                <th className="px-6 py-3 w-1/4">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center animate-pulse text-slate-500 text-xs">Syncing Fleet...</td></tr>
              ) : filteredRecords.map((item) => (
                <tr key={item.Cylinder_ID} className="hover:bg-blue-900/5 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="font-mono text-xs text-blue-400 font-bold group-hover:text-blue-300">
                      {item.Cylinder_ID}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.batch_id || '---'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                     <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                       item.Status?.toLowerCase() === 'full' 
                       ? 'bg-emerald-900/10 text-emerald-500 border-emerald-900/30' 
                       : 'bg-slate-800 text-slate-400 border-slate-700'
                     }`}>
                      {item.Status}
                     </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-[10px] font-bold text-blue-500 hover:text-white hover:bg-blue-600 border border-blue-500/30 px-3 py-1 rounded transition-all">
                      UPDATE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 3. FOOTER SUMMARY */}
        {!loading && (
          <div className="bg-slate-900/30 p-2 border-t border-slate-800 text-center">
            <p className="text-slate-600 text-[9px] uppercase font-bold tracking-tighter">
              End of results — Use search to find specific units
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
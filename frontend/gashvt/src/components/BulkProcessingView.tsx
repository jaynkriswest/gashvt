'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BulkProcessingView() {
  const [batchId, setBatchId] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // This state tracks what is selected in the dropdown before the button is clicked
  const [selectedStatuses, setSelectedStatuses] = useState<{[key: string]: string}>({});
  
  const supabase = createClient();

  const handleLoadBatch = async () => {
    if (!batchId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('cylinders')
      .select('*')
      .eq('batch_id', batchId.toUpperCase().trim());

    if (data) {
      setUnits(data);
      // Initialize the dropdown values with what is currently in the database
      const initialMap: {[key: string]: string} = {};
      data.forEach(unit => {
        initialMap[unit.Cylinder_ID] = unit.Status || 'Empty';
      });
      setSelectedStatuses(initialMap);
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    setUpdatingId(id);
    const newStatus = selectedStatuses[id];

    const { error } = await supabase
      .from('cylinders')
      .update({ Status: newStatus })
      .eq('Cylinder_ID', id);

    if (error) {
      console.error("Update failed:", error.message);
      alert("Error updating database: " + error.message);
    } else {
      // Update local 'units' so the UI stays in sync
      setUnits(units.map(u => u.Cylinder_ID === id ? { ...u, Status: newStatus } : u));
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Bulk Processing</h2>
          <p className="text-slate-400 text-sm">Select status and click update to save changes.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. BATCH003" 
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          />
          <button 
            onClick={handleLoadBatch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {loading ? 'Loading...' : 'Load Batch'}
          </button>
        </div>
      </div>

      {units.length > 0 ? (
        <div className="bg-[#1e2129] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Cylinder ID</th>
                <th className="px-6 py-4">Status Selection</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {units.map((unit) => (
                <tr key={unit.Cylinder_ID} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400">{unit.Cylinder_ID}</td>
                  
                  <td className="px-6 py-4">
                    <select 
                      value={selectedStatuses[unit.Cylinder_ID]}
                      onChange={(e) => setSelectedStatuses({
                        ...selectedStatuses,
                        [unit.Cylinder_ID]: e.target.value
                      })}
                      className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="Full">Full</option>
                      <option value="Empty">Empty</option>
                      <option value="Damaged">Damaged</option>
                      <option value="In-Use">In-Use</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleUpdate(unit.Cylinder_ID)}
                      disabled={updatingId === unit.Cylinder_ID}
                      className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase transition-all ${
                        updatingId === unit.Cylinder_ID 
                        ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed' 
                        : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white'
                      }`}
                    >
                      {updatingId === unit.Cylinder_ID ? 'Saving...' : 'Update'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#1e2129] border border-dashed border-slate-800 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-500">
          <p>Search for a Batch ID to see units.</p>
        </div>
      )}
    </div>
  );
}
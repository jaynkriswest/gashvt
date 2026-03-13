'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FleetIntelView() {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]); // Dynamic company list
  const [filterCompany, setFilterCompany] = useState('All Companies');
  const [viewScope, setViewScope] = useState('Master Inventory');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [filterCompany, viewScope]);

  async function fetchData() {
    setLoading(true);
    
    // 1. Fetch ALL cylinders to extract unique company names and calculate stats
    const { data: allData, error } = await supabase
      .from('cylinders')
      .select('*');

    if (allData) {
      // DYNAMIC DROPDOWN: Extract unique Customer_Names (fixes Bharat Gas issue)
      const uniqueCompanies = Array.from(new Set(allData.map(c => c.Customer_Name))).filter(Boolean) as string[];
      setCompanies(uniqueCompanies.sort());

      // 2. APPLY FILTERS for the table display
      let filteredData = allData;

      // Filter by Company
      if (filterCompany !== 'All Companies') {
        filteredData = filteredData.filter(c => c.Customer_Name === filterCompany);
      }

      // Filter by Compliance Scope (Due within 30 days)
      if (viewScope === 'Compliance Only') {
        filteredData = filteredData.filter(c => {
          const dueDate = new Date(c.Next_Test_Due);
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);
          return dueDate <= thirtyDaysFromNow;
        });
      }

      setCylinders(filteredData);
    }
    setLoading(false);
  }

  const downloadCSV = () => {
    const headers = ["Cylinder_ID,Batch_ID,Status,Customer,Next_Test_Due\n"];
    const rows = cylinders.map(c => `${c.Cylinder_ID},${c.batch_id},${c.Status},${c.Customer_Name},${c.Next_Test_Due}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Stats always reflect the CURRENT filtered list
  const stats = {
    activeBatches: new Set(cylinders.map(c => c.batch_id)).size,
    totalCylinders: cylinders.length,
    damaged: cylinders.filter(c => c.Status === 'Damaged').length,
    urgent: cylinders.filter(c => {
      const dueDate = new Date(c.Next_Test_Due);
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      return dueDate <= sevenDaysFromNow;
    }).length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Top Controls */}
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex gap-6 items-center">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1 tracking-tighter">View Scope</label>
            <div className="flex bg-slate-950/50 border border-slate-800 rounded-lg p-1">
              {['Master Inventory', 'Compliance Only'].map((opt) => (
                <button 
                  key={opt}
                  onClick={() => setViewScope(opt)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${viewScope === opt ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1 tracking-tighter">Company Filter</label>
            <select 
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none cursor-pointer"
            >
              <option>All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={downloadCSV} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
          📥 Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Batches', val: stats.activeBatches, color: 'text-blue-400' },
          { label: 'Total Cylinders', val: stats.totalCylinders, color: 'text-white' },
          { label: 'Damaged Units', val: stats.damaged, color: 'text-red-400' }
        ].map((card, i) => (
          <div key={i} className="bg-[#1e2129] border border-slate-800/50 p-6 rounded-2xl shadow-xl">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{card.label}</p>
            <p className={`text-4xl font-bold mt-2 tracking-tight ${card.color}`}>{card.val}</p>
          </div>
        ))}
      </div>

      {/* Compliance Alert Bar */}
      {stats.urgent > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-xl animate-pulse text-red-500">⚠️</span>
            <span className="text-sm font-bold uppercase tracking-tight">{stats.urgent} Units require Immediate Testing</span>
          </div>
          <span className="text-[10px] bg-red-500/20 px-2 py-1 rounded font-bold uppercase">Priority: High</span>
        </div>
      )}

      {/* Main Inventory Table */}
      <div className="bg-[#1e2129] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-5">Cylinder ID</th>
              <th className="px-6 py-5">Batch ID</th>
              <th className="px-6 py-5">Customer</th>
              <th className="px-6 py-5">Next Test Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center text-slate-600 animate-pulse font-medium">Synchronizing inventory records...</td></tr>
            ) : cylinders.length > 0 ? (
              cylinders.map((unit) => (
                <tr key={unit.Cylinder_ID} className="hover:bg-blue-500/5 transition-all group">
                  <td className="px-6 py-4 font-mono text-blue-400 font-bold">{unit.Cylinder_ID}</td>
                  <td className="px-6 py-4 text-slate-400">{unit.batch_id}</td>
                  <td className="px-6 py-4 text-slate-300 font-medium">{unit.Customer_Name}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${new Date(unit.Next_Test_Due) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>
                    {unit.Next_Test_Due}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-20 text-center text-slate-600 font-medium">No records match current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
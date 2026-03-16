'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FleetIntelView() {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState('All Companies');
  const [viewScope, setViewScope] = useState('Master Inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from('cylinders').select('*');
    if (data) {
      setCylinders(data);
      const unique = Array.from(new Set(data.map(c => c.Customer_Name))).filter(Boolean) as string[];
      setCompanies(unique.sort());
    }
    setLoading(false);
  }

  // 1. CALCULATE PERMANENT STATS (Unfiltered by search/toggle)
  const totalFleetCount = cylinders.length;
  
  const totalAlertsCount = cylinders.filter(c => {
    if (!c.Next_Test_Due) return false;
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);
    return new Date(c.Next_Test_Due) <= thirtyDays;
  }).length;

  // 2. FILTER LOGIC FOR THE TABLE
  const getFilteredData = () => {
    let baseData = cylinders;
    
    if (filterCompany !== 'All Companies') {
      baseData = baseData.filter(c => c.Customer_Name === filterCompany);
    }

    if (viewScope === 'Compliance Alerts') {
      const today = new Date();
      const thirtyDays = new Date();
      thirtyDays.setDate(today.getDate() + 30);
      baseData = baseData.filter(c => c.Next_Test_Due && new Date(c.Next_Test_Due) <= thirtyDays);
    }

    if (searchQuery) {
      baseData = baseData.filter(c => 
        c.Cylinder_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.batch_id && c.batch_id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return baseData;
  };

  const currentData = getFilteredData();

  const handleExport = () => {
    const headers = "Cylinder_ID,Customer,Batch,Status,Next_Test\n";
    const rows = currentData.map(c => `${c.Cylinder_ID},${c.Customer_Name},${c.batch_id},${c.Status},${c.Next_Test_Due}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewScope.toLowerCase()}_export.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS CARDS - Now Independent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d1117] p-8 rounded-2xl border border-slate-800 shadow-xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Fleet Records</p>
          <h2 className="text-4xl font-mono font-bold text-white">
            {totalFleetCount} <span className="text-xs text-slate-600 font-sans uppercase">Total</span>
          </h2>
        </div>

        <div className={`p-8 rounded-2xl border transition-all shadow-xl ${totalAlertsCount > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0d1117] border-slate-800'}`}>
          <p className={`${totalAlertsCount > 0 ? 'text-red-500' : 'text-slate-500'} text-[10px] font-black uppercase tracking-widest mb-2`}>
            Total Compliance Alerts
          </p>
          <h2 className={`text-4xl font-mono font-bold ${totalAlertsCount > 0 ? 'text-red-500' : 'text-white'}`}>
            {totalAlertsCount} <span className="text-xs font-sans uppercase">Units</span>
          </h2>
        </div>
      </div>

      {/* 2. CONSOLIDATED TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between bg-[#0d1117] p-4 rounded-2xl border border-slate-800 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-[#010409] border border-slate-800 rounded-xl p-1">
            {['Master Inventory', 'Compliance Alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setViewScope(tab)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  viewScope === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <input 
            type="text"
            placeholder="Search Serial or Batch..."
            className="bg-[#010409] border border-slate-800 text-white text-xs rounded-xl px-5 py-2.5 outline-none focus:border-blue-500 w-64 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select 
            className="bg-[#010409] border border-slate-800 text-slate-400 text-[10px] font-bold rounded-xl px-4 py-2.5 outline-none"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option>All Companies</option>
            {companies.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>

        <button 
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          💾 Export CSV
        </button>
      </div>

      {/* 3. SCROLLABLE TABLE */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-2xl flex flex-col h-[500px] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-[#161b22] flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
            Viewing {viewScope} — {currentData.length} Results
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0d1117] text-[9px] font-black text-slate-500 uppercase border-b border-slate-800 z-10">
              <tr>
                <th className="px-8 py-4">Identity</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Batch</th>
                <th className="px-8 py-4 text-right">Next Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-600 font-bold uppercase text-[10px] animate-pulse">Filtering Fleet...</td></tr>
              ) : currentData.map((unit) => (
                <tr key={unit.Cylinder_ID} className="hover:bg-blue-600/5 transition-colors group">
                  <td className="px-8 py-5 font-mono text-blue-400 font-bold group-hover:text-blue-300">{unit.Cylinder_ID}</td>
                  <td className="px-8 py-5 text-slate-400 text-xs">{unit.Customer_Name}</td>
                  <td className="px-8 py-5 text-slate-600 font-mono text-xs">{unit.batch_id || '—'}</td>
                  <td className={`px-8 py-5 text-right font-mono text-xs ${viewScope === 'Compliance Alerts' || new Date(unit.Next_Test_Due) < new Date() ? 'text-red-500 font-black' : 'text-slate-500'}`}>
                    {unit.Next_Test_Due}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
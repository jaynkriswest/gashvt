'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FleetIntelView({ userProfile }: { userProfile: any }) {
  const [cylinders, setCylinders] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState('All Companies');
  const [viewScope, setViewScope] = useState('Master Inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [userProfile]);

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

  const totalFleetCount = cylinders.length;
  
  const totalAlertsCount = cylinders.filter(c => {
    if (!c.Next_Test_Due) return false;
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);
    return new Date(c.Next_Test_Due) <= thirtyDays;
  }).length;

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

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-panel p-8 rounded-2xl border border-brand-border shadow-xl transition-colors">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
            {userProfile?.role === 'Admin' ? 'Global Fleet Records' : 'Your Managed Fleet'}
          </p>
          <h2 className="text-4xl font-mono font-bold text-text-main">
            {totalFleetCount} <span className="text-xs text-slate-500 font-sans uppercase">Total</span>
          </h2>
        </div>

        <div className={`p-8 rounded-2xl border transition-all shadow-xl ${totalAlertsCount > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-brand-panel border-brand-border'}`}>
          <p className={`${totalAlertsCount > 0 ? 'text-red-500' : 'text-slate-500'} text-[10px] font-black uppercase tracking-widest mb-2`}>
            Compliance Alerts
          </p>
          <h2 className={`text-4xl font-mono font-bold ${totalAlertsCount > 0 ? 'text-red-500' : 'text-text-main'}`}>
            {totalAlertsCount} <span className="text-xs font-sans uppercase">Units</span>
          </h2>
        </div>
      </div>

      {/* 2. CONSOLIDATED TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between bg-brand-panel p-4 rounded-2xl border border-brand-border gap-4 transition-colors">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-brand-dark border border-brand-border rounded-xl p-1">
            {['Master Inventory', 'Compliance Alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setViewScope(tab)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  viewScope === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <input 
            type="text"
            placeholder="Search Serial or Batch..."
            className="bg-brand-dark border border-brand-border text-text-main text-xs rounded-xl px-5 py-2.5 outline-none focus:border-blue-500 w-64 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {userProfile?.role === 'Admin' && (
            <select 
              className="bg-brand-dark border border-brand-border text-slate-500 text-[10px] font-bold rounded-xl px-4 py-2.5 outline-none"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            >
              <option>All Companies</option>
              {companies.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* 3. TABLE AREA */}
      <div className="bg-brand-panel border border-brand-border rounded-2xl flex flex-col h-[500px] overflow-hidden shadow-2xl transition-colors">
        <div className="p-4 border-b border-brand-border bg-brand-dark/10 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">
            {userProfile?.client_link} — Viewing {viewScope}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-brand-panel text-[9px] font-black text-slate-500 uppercase border-b border-brand-border z-10">
              <tr>
                <th className="px-8 py-4">Identity</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Batch</th>
                <th className="px-8 py-4 text-right">Next Test Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-500 font-bold uppercase text-[10px]">Loading Secured Data...</td></tr>
              ) : currentData.map((unit) => (
                <tr key={unit.Cylinder_ID} className="hover:bg-blue-600/5 transition-colors group">
                  <td className="px-8 py-5 font-mono text-blue-500 font-bold">{unit.Cylinder_ID}</td>
                  <td className="px-8 py-5">
                    <span className="bg-brand-dark border border-brand-border px-3 py-1 rounded-full text-[9px] font-black uppercase text-slate-500">
                      {unit.Status || 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-mono text-xs">{unit.batch_id || '—'}</td>
                  <td className={`px-8 py-5 text-right font-mono text-xs ${new Date(unit.Next_Test_Due) < new Date() ? 'text-red-500 font-black' : 'text-slate-500'}`}>
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
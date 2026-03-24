'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CreditCard, History, Zap, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadBillingData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch Profile
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(pData);

        // Fetch Services
        const { data: sData } = await supabase.from('services').select('*');
        setServices(sData || []);

        // Fetch Transactions
        const { data: tData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setTransactions(tData || []);
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    }
    loadBillingData();
  }, [supabase]);

  const totalCost = selectedService 
    ? (selectedService.base_price + (profile?.service_markup || 0)) 
    : 0;

  if (loading) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-blue-600 font-black animate-pulse uppercase tracking-widest text-xs">
        Syncing Financial Terminal...
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">Financial Terminal</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-slate-500">Ledger & Settlement</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all">
          <Plus size={14} /> Add Credits
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="bg-brand-panel border border-brand-border p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <CreditCard size={120} className="text-blue-600" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Available Credits</p>
            <h2 className="text-5xl font-black text-blue-600 tracking-tighter">
              ${profile?.balance?.toFixed(2) || "0.00"}
            </h2>
          </div>

          {/* Transaction Ledger */}
          <div className="bg-brand-panel border border-brand-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-brand-border bg-slate-50 font-black text-[10px] uppercase text-slate-900 flex items-center gap-2">
              <History size={14} /> Transaction History
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-brand-border">
                  <tr>
                    <th className="p-4 text-[9px] font-black uppercase text-slate-500">Date</th>
                    <th className="p-4 text-[9px] font-black uppercase text-slate-500">Description</th>
                    <th className="p-4 text-[9px] font-black uppercase text-slate-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length > 0 ? transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[11px] text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-[11px] font-bold text-slate-900 flex items-center gap-2 uppercase">
                        {t.amount > 0 ? <ArrowUpRight size={12} className="text-green-600" /> : <ArrowDownLeft size={12} className="text-red-600" />}
                        {t.description}
                      </td>
                      <td className={`p-4 text-[11px] font-black text-right ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.amount > 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-12 text-center text-slate-400 text-xs italic">No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Settlement Calculator - LIGHT MODE OPTIMIZED */}
        <div className="bg-brand-panel border-2 border-blue-500/10 p-6 rounded-2xl h-fit sticky top-24 shadow-xl">
          <h3 className="text-[10px] font-black uppercase text-blue-600 mb-6 flex items-center gap-2 tracking-widest">
            <Zap size={14} /> Settlement Calculator
          </h3>
          <select 
            className="w-full bg-slate-50 border border-brand-border p-3 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 mb-6 cursor-pointer"
            onChange={(e) => setSelectedService(services.find(s => s.id === e.target.value))}
            defaultValue=""
          >
            <option value="" disabled className="text-slate-400">Select Service Type...</option>
            {services.map(s => (
              <option key={s.id} value={s.id} className="text-slate-900 bg-white">
                {s.service_name}
              </option>
            ))}
          </select>

          {selectedService && (
            <div className="space-y-4 pt-4 border-t border-brand-border animate-in slide-in-from-top-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Base Cost</span>
                <span>${selectedService.base_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Markup Fee</span>
                <span>+${profile?.service_markup?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-dashed border-brand-border">
                <span className="text-[10px] font-black uppercase text-blue-600">Total Settlement</span>
                <span className="text-2xl font-black text-slate-900">${totalCost.toFixed(2)}</span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-black text-[10px] uppercase tracking-widest mt-4 shadow-lg shadow-blue-500/10 transition-all">
                Authorize Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
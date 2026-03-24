'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CreditCard, History, Download, AlertCircle } from 'lucide-react';

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadBilling() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    }
    loadBilling();
  }, []);

  if (loading) return <div className="p-8 text-blue-500 animate-pulse">LOADING FINANCIAL DATA...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-2xl font-black italic text-text-main uppercase tracking-tighter">Financial Terminal</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Billing & Subscription Management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><CreditCard size={20} /></div>
            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">ACTIVE</span>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase">Current Balance</p>
          <h2 className="text-3xl font-black text-text-main">$00.00</h2>
        </div>

        {/* Status Card */}
        <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><AlertCircle size={20} /></div>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase">Next Invoice</p>
          <h2 className="text-3xl font-black text-text-main">December 31, 2026</h2>
        </div>
      </div>

      {/* Placeholder for Invoice Table */}
      <div className="bg-brand-panel border border-brand-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-white/5 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> Transaction History
          </h3>
        </div>
        <div className="p-8 text-center text-slate-500 text-xs italic">
          No recent transactions found in the ledger.
        </div>
      </div>
    </div>
  );
}
'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  CreditCard, 
  History, 
  Download, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadFinancialData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Fetch Profile (Balance & Billing Date)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // 2. Fetch Recent Transactions
        const { data: transData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setTransactions(transData || []);
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    }
    loadFinancialData();
  }, [supabase]);

  const handleAddFunds = () => {
    // This is where you will trigger your partner's payment gateway
    console.log("Redirecting to Payment Gateway...");
    alert("Payment Gateway Integration: Redirecting to secure checkout...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse uppercase tracking-widest">
          Synchronizing Financial Ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black italic text-text-main uppercase tracking-tighter">Financial Terminal</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Billing & Asset Credits</p>
        </div>
        <button 
          onClick={handleAddFunds}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={14} /> Add Funds
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard size={80} />
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Current Balance</p>
          <h2 className="text-3xl font-black text-text-main">
            ${profile?.balance?.toFixed(2) || "0.00"}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded">
            <ArrowUpRight size={12} /> ACCOUNT ACTIVE
          </div>
        </div>

        <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl">
          <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Next Settlement</p>
          <h2 className="text-3xl font-black text-text-main">
            {profile?.next_billing_date || "Dec 31, 2026"}
          </h2>
          <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase">Automated Billing Cycle</p>
        </div>

        <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl">
          <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Status</p>
          <div className="flex items-center gap-3">
             <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
             <h2 className="text-3xl font-black text-text-main uppercase">Verified</h2>
          </div>
          <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase">Tier: Industrial Enterprise</p>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-brand-panel border border-brand-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-white/5 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> Recent Transactions
          </h3>
          <button className="text-slate-500 hover:text-white transition-colors">
             <Download size={16} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-brand-border">
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">Date</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">Description</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">Amount</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((t: any) => (
                <tr key={t.id} className="border-b border-brand-border hover:bg-white/5 transition-colors">
                  <td className="p-4 text-xs font-medium text-slate-400">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-xs font-bold text-text-main">
                    {t.description}
                  </td>
                  <td className={`p-4 text-xs font-black ${t.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'deposit' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className="text-[9px] font-black px-2 py-1 rounded bg-blue-500/10 text-blue-500 uppercase">
                      {t.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 text-xs italic">
                    No recent transactions found in the ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
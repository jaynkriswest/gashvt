'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CreditCard, History, Plus, ArrowUpRight } from 'lucide-react';

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadBilling() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: sData } = await supabase.from('services').select('*');
        setProfile(pData);
        setServices(sData || []);
      }
      setLoading(false);
    }
    loadBilling();
  }, [supabase]);

  // Example: Calculation assuming a flat center markup for demo
  const calculateTotal = () => {
    const base = selectedService?.base_price || 0;
    const markup = 15.00; // In reality, fetch this from the specific Testing Center's profile
    return base + markup;
  };

  if (loading) return <div className="p-8 text-blue-500 animate-pulse uppercase">Loading Ledger...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black italic text-text-main uppercase tracking-tighter">Financial Terminal</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Balance: ${profile?.balance?.toFixed(2) || "0.00"}</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Plus size={14} /> Add Funds
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Selector & Dynamic Pricing */}
        <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl space-y-6">
          <h3 className="text-[10px] font-black uppercase text-blue-500">Service Fee Calculator</h3>
          <div className="space-y-4">
            {services.map((s) => (
              <button 
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${selectedService?.id === s.id ? 'border-blue-500 bg-blue-500/5' : 'border-brand-border bg-white/5'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-main">{s.service_name}</span>
                  <span className="text-xs text-slate-500">Base: ${s.base_price}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedService && (
            <div className="pt-6 border-t border-brand-border space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Total Fee (Base + Demand Markup)</span>
                <span className="text-green-500">Estimate</span>
              </div>
              <div className="text-4xl font-black text-text-main">${calculateTotal().toFixed(2)}</div>
              <button className="w-full bg-white text-black p-4 rounded-xl font-black text-xs uppercase tracking-widest mt-4">
                Pay with Account Balance
              </button>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className="bg-brand-panel border border-brand-border p-6 rounded-2xl flex flex-col justify-center items-center text-center">
          <CreditCard size={48} className="text-blue-500 mb-4" />
          <p className="text-slate-500 text-[10px] font-bold uppercase">Ready for Checkout</p>
          <h2 className="text-5xl font-black text-text-main">${profile?.balance?.toFixed(2) || "0.00"}</h2>
        </div>
      </div>
    </div>
  );
}
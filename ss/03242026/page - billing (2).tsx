'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CreditCard, History, Zap, Plus } from 'lucide-react';

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadBillingData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch User Profile
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(pData);

        // Fetch Services for the Calculator
        const { data: sData } = await supabase.from('services').select('*');
        setServices(sData || []);
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    }
    loadBillingData();
  }, [supabase]);

  // Guarded calculation for the Settlement Calculator
  const totalCost = selectedService 
    ? (selectedService.base_price + (profile?.service_markup || 0)) 
    : 0;

  if (loading) return <div className="p-8 text-blue-500 animate-pulse font-black uppercase tracking-widest">Loading Terminal...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Balance & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-panel border border-brand-border p-8 rounded-2xl">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Current Balance</p>
            <h2 className="text-5xl font-black text-blue-500 tracking-tighter">
              ${profile?.balance?.toFixed(2) || "0.00"}
            </h2>
          </div>

          <div className="bg-brand-panel border border-brand-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-white/5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <History size={14} /> Transaction History
            </div>
            <div className="p-12 text-center text-slate-500 text-xs italic">
              No recent transactions found in the ledger.
            </div>
          </div>
        </div>

        {/* Right Section: Settlement Calculator [Matches your screenshot] */}
        <div className="bg-brand-panel border border-blue-500/20 p-6 rounded-2xl h-fit">
          <h3 className="text-[10px] font-black uppercase text-blue-500 mb-6 flex items-center gap-2 tracking-widest">
            <Zap size={14} /> Settlement Calculator
          </h3>
          
          <select 
            className="w-full bg-brand-dark border border-brand-border p-3 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500 mb-6"
            onChange={(e) => setSelectedService(services.find(s => s.id === e.target.value))}
          >
            <option value="">Select Service Type...</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.service_name}</option>
            ))}
          </select>

          {selectedService && (
            <div className="space-y-4 pt-4 border-t border-brand-border animate-in slide-in-from-top-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Base Cost</span>
                <span>${selectedService.base_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Center Markup</span>
                <span>+${profile?.service_markup?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-dashed border-brand-border">
                <span className="text-[10px] font-black uppercase text-blue-500">Total Settlement</span>
                <span className="text-2xl font-black text-white">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner'; 
import { TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [mode, setMode] = useState('view');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markup, setMarkup] = useState<string>('0');
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
        setMarkup(data?.service_markup?.toString() || '0');
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const updateMarkup = async () => {
    if (!profile?.id) return; // Guard clause to prevent "null" error
    const { error } = await supabase
      .from('profiles')
      .update({ service_markup: parseFloat(markup) })
      .eq('id', profile.id);
    if (!error) alert("Pricing Updated!");
  };

  if (loading) return <div className="p-20 text-blue-500 animate-pulse font-black">INITIALIZING...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Dynamic Pricing Control for Testing Centers */}
      {profile?.role === 'testing_center' && (
        <div className="bg-brand-panel border border-blue-500/20 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <h3 className="text-blue-500 font-black text-[10px] uppercase flex items-center gap-2">
              <TrendingUp size={14} /> Revenue Strategy
            </h3>
            <p className="text-slate-500 text-xs">Set your markup fee per cylinder.</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              className="bg-brand-dark border border-brand-border px-4 py-2 rounded-xl text-text-main w-24"
            />
            <button onClick={updateMarkup} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white">
              Update
            </button>
          </div>
        </div>
      )}

      {/* ... rest of your dashboard buttons and views ... */}
    </div>
  );
}
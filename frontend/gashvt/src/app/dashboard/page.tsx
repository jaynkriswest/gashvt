'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner'; 
import RecentActivityView from '@/components/RecentActivityView';
import BulkProcessingView from '@/components/BulkProcessingView';
import { TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [mode, setMode] = useState('view');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markup, setMarkup] = useState<string>('0');
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      // Get the current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch the full profile including role and markup
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Dashboard Profile Error:", error.message);
        }
        
        setProfile(data);
        setMarkup(data?.service_markup?.toString() || '0');
      } else {
        // Redirect to login if unauthenticated
        window.location.href = '/login';
      }
      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

  const updateMarkup = async () => {
    if (!profile?.id) return; // Guard clause to prevent null reading error
    
    const { error } = await supabase
      .from('profiles')
      .update({ service_markup: parseFloat(markup) })
      .eq('id', profile.id);
    
    if (!error) {
      alert("Pricing Updated!");
    }
  };

  // Prevent rendering before data is ready to avoid "Cannot read properties of null"
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse">SYNCHRONIZING TERMINAL...</div>
      </div>
    );
  }

  const getBtnStyle = (btnMode: string) => `
    px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all
    ${mode === btnMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
  `;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Revenue Strategy Control: Only visible to Testing Centers */}
      {profile?.role === 'testing_center' && (
        <div className="bg-brand-panel border border-blue-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-blue-500 font-black text-[10px] uppercase flex items-center gap-2 tracking-widest">
              <TrendingUp size={14} /> Revenue Strategy
            </h3>
            <p className="text-slate-500 text-xs">Set your custom service markup fee per cylinder.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input 
                type="number" 
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
                className="bg-brand-dark border border-brand-border pl-7 pr-4 py-2 rounded-xl text-text-main font-black outline-none focus:border-blue-500 w-32"
              />
            </div>
            <button 
              onClick={updateMarkup} 
              className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white hover:bg-blue-500 transition-colors"
            >
              Update Rates
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-brand-panel p-1 rounded-xl border border-brand-border w-fit">
        <button onClick={() => setMode('view')} className={getBtnStyle('view')}>📊 Intel</button>
        <button onClick={() => setMode('recent')} className={getBtnStyle('recent')}>🕒 Recent</button>

        {/* Admin only access */}
        {profile?.role === 'Admin' && (
          <button onClick={() => setMode('bulk')} className={getBtnStyle('bulk')}>📂 Bulk</button>
        )}

        {/* Scan access for Testing Centers and Admins */}
        {(profile?.role === 'testing_center' || profile?.role === 'Admin') && (
          <button onClick={() => setMode('scan')} className={getBtnStyle('scan')}>📷 Scan</button>
        )}
      </div>

      {/* Dynamic View Container */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {mode === 'view' && <FleetIntelView userProfile={profile} />}
        {mode === 'recent' && <RecentActivityView userProfile={profile} />}
        {mode === 'bulk' && <BulkProcessingView userProfile={profile} />}
        {mode === 'scan' && <Scanner userProfile={profile} />}
      </div>
    </div>
  );
}
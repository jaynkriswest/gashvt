'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner'; 
import RecentActivityView from '@/components/RecentActivityView';
import BulkProcessingView from '@/components/BulkProcessingView'; // Import the Bulk view

export default function Dashboard() {
  const [mode, setMode] = useState('view');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  // Standardized button style to replace activeStyle/inactiveStyle
  const getBtnStyle = (btnMode: string) => `
    px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all
    ${mode === btnMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
  `;

  if (loading) return <div className="p-10 text-slate-500 font-mono text-[10px] uppercase">Authenticating...</div>;

  return (
  <div className="space-y-8">
    {/* Sub-Navigation */}
    {/* 1. Changed bg-[#0d1117] to bg-brand-panel */}
    {/* 2. Changed border-slate-800 to border-brand-border */}
    <div className="flex flex-wrap gap-2 bg-brand-panel p-1 rounded-xl border border-brand-border w-fit transition-colors">
      <button onClick={() => setMode('view')} className={getBtnStyle('view')}>
        📊 Intel
      </button>
        
        <button onClick={() => setMode('recent')} className={getBtnStyle('recent')}>
          🕒 Recent
        </button>

        {/* 1. Add the Bulk button (visible to Admins) */}
        {profile?.role === 'Admin' && (
          <button onClick={() => setMode('bulk')} className={getBtnStyle('bulk')}>
            📂 Bulk
          </button>
        )}

        {/* Scan button for Testing Centers or Admins */}
        {(profile?.role === 'testing_center' || profile?.role === 'Admin') && (
          <button onClick={() => setMode('scan')} className={getBtnStyle('scan')}>
            📷 Scan
          </button>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {/* Render Views based on mode */}
        {mode === 'view' && <FleetIntelView userProfile={profile} />}
        {mode === 'recent' && <RecentActivityView userProfile={profile} />}
        
        {/* 2. Add the Bulk View logic */}
        {mode === 'bulk' && <BulkProcessingView userProfile={profile} />}

        {mode === 'scan' && (
          <div className="max-w-2xl mx-auto">
             <Scanner userProfile={profile} />
          </div>
        )}
      </div>
    </div>
  );
}
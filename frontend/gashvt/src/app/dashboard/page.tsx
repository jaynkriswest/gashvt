'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner'; 
import RecentActivityView from '@/components/RecentActivityView';

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

  if (loading) return <div className="p-10 text-slate-500 font-mono text-[10px] uppercase">Authenticating...</div>;

  return (
    <div className="space-y-8">
      {/* Sub-Navigation */}
      <div className="flex gap-2 bg-[#0d1117] p-1 rounded-xl border border-slate-800 w-fit">
        <button onClick={() => setMode('view')} className={mode === 'view' ? 'activeStyle' : 'inactiveStyle'}>
          📊 Intel
        </button>
        
        <button onClick={() => setMode('recent')} className={mode === 'recent' ? 'activeStyle' : 'inactiveStyle'}>
          🕒 Recent
        </button>

        {/* Only show Scan for Testing Centers or Admins */}
        {(profile?.role === 'testing_center' || profile?.role === 'Admin') && (
          <button onClick={() => setMode('scan')} className={mode === 'scan' ? 'activeStyle' : 'inactiveStyle'}>
            📷 Scan
          </button>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {/* Pass profile data so the views know how to filter charts */}
        {mode === 'view' && <FleetIntelView userProfile={profile} />}
        {mode === 'recent' && <RecentActivityView userProfile={profile} />}
        {mode === 'scan' && (
          <div className="max-w-2xl mx-auto">
             <Scanner userProfile={profile} />
          </div>
        )}
      </div>
    </div>
  );
}
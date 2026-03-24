'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import FleetIntelView from '@/components/FleetIntelView';
import Scanner from '@/components/Scanner'; 
import RecentActivityView from '@/components/RecentActivityView';
import BulkProcessingView from '@/components/BulkProcessingView';

export default function Dashboard() {
  const [mode, setMode] = useState('view');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch the profile associated with this user
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Dashboard Profile Error:", error.message);
        }
        setProfile(data);
      } else {
        // If no user is found after the check, send them back to login
        window.location.href = '/login';
      }
      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap gap-2 bg-brand-panel p-1 rounded-xl border border-brand-border w-fit">
        <button onClick={() => setMode('view')} className={getBtnStyle('view')}>📊 Intel</button>
        <button onClick={() => setMode('recent')} className={getBtnStyle('recent')}>🕒 Recent</button>

        {/* Admin only button - Role check must match your SQL result exactly */}
        {profile?.role === 'Admin' && (
          <button onClick={() => setMode('bulk')} className={getBtnStyle('bulk')}>📂 Bulk</button>
        )}

        {/* Scan button for Testing Centers or Admins */}
        {(profile?.role === 'testing_center' || profile?.role === 'Admin') && (
          <button onClick={() => setMode('scan')} className={getBtnStyle('scan')}>📷 Scan</button>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {mode === 'view' && <FleetIntelView userProfile={profile} />}
        {mode === 'recent' && <RecentActivityView userProfile={profile} />}
        {mode === 'bulk' && <BulkProcessingView userProfile={profile} />}
        {mode === 'scan' && <Scanner userProfile={profile} />}
      </div>
    </div>
  );
}
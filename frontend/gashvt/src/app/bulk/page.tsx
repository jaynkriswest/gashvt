'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import BulkProcessingView from '@/components/BulkProcessingView';

export default function BulkPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
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
    getProfile();
  }, [supabase]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-slate-500 font-black uppercase text-[10px] animate-pulse">
        Initializing Bulk Terminal...
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Bulk Operations</h1>
        <p className="text-slate-500 text-[10px] font-mono uppercase mt-1">
          Authorized Updates: {profile?.client_link || 'Global Admin'}
        </p>
      </header>

      {/* This fixes the build error by providing the required userProfile prop */}
      <BulkProcessingView userProfile={profile} />
    </div>
  );
}
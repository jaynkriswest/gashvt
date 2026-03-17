'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Scanner from '@/components/Scanner';

export default function BarcodeScanPage() {
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    }
    getProfile();
  }, []);

  if (!profile) return <div className="p-10 text-slate-500 font-mono text-[10px] uppercase text-center">Initializing Camera...</div>;

  return (
    <div className="p-4 md:p-8">
      {/* Pass the missing property here to fix the build error */}
      <Scanner userProfile={profile} />
    </div>
  );
}
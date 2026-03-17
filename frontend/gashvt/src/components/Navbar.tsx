'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // New state for role
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getSessionAndRole() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        // Fetch the role from the profiles table
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(data?.role);
      }
    }

    getSessionAndRole();
  }, [supabase]);

  if (pathname === '/login' || !session) return null;

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#0d1117] border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-blue-500 font-black text-xl tracking-tighter">
          GAS LOGISTICS
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-blue-400">
          Fleet Intel
        </Link>

        {/* ONLY SHOW THESE IF ROLE IS ADMIN */}
        {userRole === 'Admin' && (
          <>
            <Link href="/ingestion" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
              Ingestion Hub
            </Link>
            <Link href="/bulk" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
              Bulk Processing
            </Link>
            <Link href="/barcode-scan" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
              Barcode Scan
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-slate-500 text-[9px] font-mono">{session.user?.email}</span>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="...">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
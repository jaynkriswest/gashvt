'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getSessionAndRole() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(data?.role);
      }
      setLoading(false);
    }

    getSessionAndRole();
  }, [supabase]);

  // Hide Navbar on login page or during initial session check
  if (pathname === '/login' || loading || !session) return null;

  // Helper function to determine if a link is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0d1117] border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-blue-500 font-black text-lg md:text-xl tracking-tighter whitespace-nowrap">
          GAS LOGISTICS
        </Link>
      </div>

      {/* Navigation Links - Mobile friendly with overflow scroll */}
      <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar mx-4">
        <Link 
          href="/dashboard" 
          className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
            isActive('/dashboard') ? 'text-blue-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Fleet Intel
        </Link>

        {/* ONLY SHOW THESE IF ROLE IS ADMIN */}
        {userRole === 'Admin' && (
          <>
            <Link 
              href="/ingestion" 
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                isActive('/ingestion') ? 'text-blue-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ingestion Hub
            </Link>
            <Link 
              href="/bulk" 
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                isActive('/bulk') ? 'text-blue-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulk Processing
            </Link>
            <Link 
              href="/barcode-scan" 
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                isActive('/barcode-scan') ? 'text-blue-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Barcode Scan
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <span className="hidden sm:block text-slate-500 text-[9px] font-mono truncate max-w-[100px]">
          {session.user?.email}
        </span>
        <button 
          onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
          className="text-[9px] font-black uppercase tracking-widest text-white bg-slate-800 hover:bg-red-900/40 px-3 py-1.5 rounded-md transition-all border border-slate-700"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
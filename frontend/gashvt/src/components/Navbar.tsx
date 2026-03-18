'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Database, Layers, ScanBarcode, LogOut } from 'lucide-react';

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

  // Essential for Vercel: Prevents the menu from disappearing during session re-fetch
  if (pathname === '/login') return null;
  if (loading) return <div className="h-16 bg-[#0d1117] border-b border-slate-800" />;
  if (!session) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-3 bg-[#0d1117] border-b border-slate-800 sticky top-0 z-50">
      {/* LOGO SECTION - Shrinkable on mobile to save space */}
      <div className="flex items-center shrink-0">
        <Link href="/dashboard" className="text-blue-500 font-black text-sm md:text-xl tracking-tighter whitespace-nowrap">
          GAS LOGISTICS
        </Link>
      </div>

      {/* NAVIGATION LINKS: Scrollable container for mobile */}
      <div className="flex items-center gap-3 md:gap-8 overflow-x-auto no-scrollbar mx-2 md:mx-4 px-2 flex-1">
        <NavLink 
          href="/dashboard" 
          label="Intel" 
          icon={<Home size={14} strokeWidth={3} />} 
          active={isActive('/dashboard')} 
        />

        {userRole === 'Admin' && (
          <>
            <NavLink 
              href="/ingestion" 
              label="Ingest" 
              icon={<Database size={14} strokeWidth={3} />} 
              active={isActive('/ingestion')} 
            />
            <NavLink 
              href="/bulk" 
              label="Bulk" 
              icon={<Layers size={14} strokeWidth={3} />} 
              active={isActive('/bulk')} 
            />
            <NavLink 
              href="/barcode-scan" 
              label="Scan" 
              icon={<ScanBarcode size={14} strokeWidth={3} />} 
              active={isActive('/barcode-scan')} 
            />
          </>
        )}
      </div>

      {/* USER & LOGOUT SECTION */}
      <div className="flex items-center shrink-0 ml-2">
        <button 
          onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
          className="flex items-center justify-center p-2 md:px-3 md:py-2 text-slate-400 hover:text-red-500 bg-slate-800/50 hover:bg-red-900/20 rounded-lg transition-all border border-slate-700 md:gap-2"
          title="Sign Out"
        >
          <LogOut size={14} />
          <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest text-white">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

// Sub-component for mobile-first navigation
function NavLink({ href, label, icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-2 py-1 border-b-2 ${
        active 
          ? 'text-blue-500 border-blue-500' 
          : 'text-slate-400 border-transparent hover:text-white'
      }`}
    >
      <div className={active ? 'text-blue-500' : 'text-slate-500'}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}
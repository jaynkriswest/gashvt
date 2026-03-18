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
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0d1117] border-b border-slate-800 sticky top-0 z-50 overflow-hidden">
      {/* LOGO SECTION */}
      <div className="flex items-center shrink-0">
        <Link href="/dashboard" className="text-blue-500 font-black text-lg md:text-xl tracking-tighter whitespace-nowrap">
          GAS LOGISTICS
        </Link>
      </div>

      {/* NAVIGATION LINKS: Scrollable on Mobile */}
      <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar mx-4 px-2">
        <NavLink 
          href="/dashboard" 
          label="Fleet Intel" 
          icon={<Home size={14} strokeWidth={3} />} 
          active={isActive('/dashboard')} 
        />

        {userRole === 'Admin' && (
          <>
            <NavLink 
              href="/ingestion" 
              label="Ingestion" 
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
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white bg-slate-800 hover:bg-red-900/40 px-3 py-2 rounded-lg transition-all border border-slate-700 shadow-xl"
        >
          <LogOut size={12} className="md:hidden" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

// Sub-component for cleaner mobile-first navigation
function NavLink({ href, label, icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-1 py-2 border-b-2 ${
        active 
          ? 'text-blue-500 border-blue-500' 
          : 'text-slate-400 border-transparent hover:text-white'
      }`}
    >
      {icon}
      <span className={active ? 'inline' : 'hidden sm:inline'}>{label}</span>
    </Link>
  );
}
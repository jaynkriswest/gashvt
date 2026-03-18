'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Database, Layers, ScanBarcode, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (pathname === '/login') return null;
  if (loading) return <div className="h-16 bg-[#0d1117] border-b border-slate-800" />;
  if (!session) return null;

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-[#0d1117] border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* LOGO SECTION */}
        <div className="flex items-center shrink-0">
          <Link href="/dashboard" className="text-blue-500 font-black text-lg md:text-xl tracking-tighter whitespace-nowrap">
            GAS LOGISTICS
          </Link>
        </div>

        {/* DESKTOP NAVIGATION (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/dashboard" label="Fleet Intel" icon={<Home size={14} />} active={isActive('/dashboard')} />
          {userRole === 'Admin' && (
            <>
              <NavLink href="/ingestion" label="Ingestion Hub" icon={<Database size={14} />} active={isActive('/ingestion')} />
              <NavLink href="/bulk" label="Bulk Processing" icon={<Layers size={14} />} active={isActive('/bulk')} />
              <NavLink href="/barcode-scan" label="Barcode Scan" icon={<ScanBarcode size={14} />} active={isActive('/barcode-scan')} />
            </>
          )}
          <button 
            onClick={handleSignOut} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-slate-800 hover:bg-red-900/40 px-3 py-1.5 rounded-md transition-all border border-slate-700"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>

        {/* MOBILE MENU BUTTON (Visible only on Mobile) */}
        <button 
          className="md:hidden text-slate-400 p-2 hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY MENU */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0d1117] p-4 flex flex-col gap-2 animate-in slide-in-from-top duration-200">
          <MobileNavLink href="/dashboard" label="Fleet Intel" icon={<Home size={18} />} active={isActive('/dashboard')} />
          {userRole === 'Admin' && (
            <>
              <MobileNavLink href="/ingestion" label="Ingestion Hub" icon={<Database size={18} />} active={isActive('/ingestion')} />
              <MobileNavLink href="/bulk" label="Bulk Processing" icon={<Layers size={18} />} active={isActive('/bulk')} />
              <MobileNavLink href="/barcode-scan" label="Barcode Scan" icon={<ScanBarcode size={18} />} active={isActive('/barcode-scan')} />
            </>
          )}
          <hr className="border-slate-800 my-2" />
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-red-500 font-black uppercase tracking-widest text-[11px] hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'text-blue-500' : 'text-slate-400 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, label, icon, active, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all ${
        active ? 'bg-blue-500/10 text-blue-500' : 'text-slate-400 hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
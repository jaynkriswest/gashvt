'use client'
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState(''); // New State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('gas_company');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Error: Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          client_link: companyName,
          role: role,
          username: username, // Pass username to metadata
        }
      }
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-white text-2xl font-black uppercase tracking-tighter mb-2">Partner Portal</h1>
        <p className="text-slate-500 text-xs mb-8 uppercase font-mono">Register Organization</p>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* USERNAME FIELD */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">Username</label>
            <input 
              type="text" 
              placeholder="e.g. hpgas_admin"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">Company Name</label>
            <input 
              type="text" 
              placeholder="e.g. HP Gas"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">Account Type</label>
            <select 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none appearance-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="gas_company">Gas Company</option>
              <option value="testing_center">Testing Center</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[32px] text-slate-500 hover:text-blue-400 text-[10px] font-bold uppercase"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 ml-1">Confirm Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              className={`w-full bg-slate-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all ${
                confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all mt-4"
          >
            {loading ? 'Processing...' : 'REGISTER ORGANIZATION'}
          </button>

          <div className="mt-6 text-center border-t border-slate-800 pt-6">
            <Link href="/login" className="text-blue-500 hover:text-blue-400 text-xs font-bold uppercase">
              ← Back to Login
            </Link>
          </div>

          {message && (
            <p className={`mt-4 text-center text-xs font-mono p-2 rounded border ${
              message.includes('Error') ? 'text-red-400 bg-red-900/10 border-red-900/30' : 'text-blue-400 bg-blue-900/10 border-blue-900/30'
            }`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
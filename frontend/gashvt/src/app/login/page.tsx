'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react' // Import icons

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // State for visibility toggle
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    let targetEmail = identifier

    if (!identifier.includes('@')) {
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single()

      if (pError || !profile) {
        alert("Username not found.")
        setLoading(false)
        return
      }
      targetEmail = profile.email
    }

    const { error } = await supabase.auth.signInWithPassword({ 
      email: targetEmail, 
      password 
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard') 
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-white">
      <form onSubmit={handleLogin} className="p-8 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-sm">
        <h1 className="text-xl font-black mb-6 text-center tracking-tight">🚛 Gas Logistics Login</h1>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Username or Email" 
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setIdentifier(e.target.value)} 
            required
          />
          
          {/* Password Container */}
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} // Dynamic type switching
              placeholder="Password" 
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-sm focus:border-blue-500 outline-none transition-all pr-12"
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            {/* Toggle Button */}
            <button
              type="button" // Important: Prevents form submission on click
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest mb-3">New Organization?</p>
          <Link href="/register" className="text-blue-500 hover:text-blue-400 text-xs font-bold border border-blue-500/20 px-4 py-2 rounded-lg">
            REGISTER AS PARTNER
          </Link>
        </div>
      </form>
    </div>
  )
}
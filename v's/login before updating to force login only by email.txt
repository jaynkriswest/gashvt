'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from "@/components/ThemeToggle"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log("Attempting login for:", identifier)

    let targetEmail = identifier

    // Convert username to email if no '@' is present
    if (!identifier.includes('@')) {
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', identifier)
        .single()

      if (pError || !profile) {
        console.error("Profile lookup error:", pError)
        alert("Username not found. Please check your credentials.")
        setLoading(false)
        return
      }
      targetEmail = profile.email
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: targetEmail, 
        password 
      })

      if (error) {
        alert(error.message)
        setLoading(false)
      } else if (data?.user) {
        console.log("Login successful, redirecting...")
        // Using href ensures the page reloads with the new auth cookies
        window.location.href = '/'
      }
    } catch (err) {
      console.error("Critical error:", err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-brand-panel border border-brand-border rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-text-main uppercase italic">
            GASHVT V1
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Industrial Asset Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-500 text-[10px] font-bold uppercase ml-1">Username or Email</label>
            <input 
              type="text" 
              placeholder="Enter credentials" 
              className="w-full p-3 bg-brand-dark border border-brand-border rounded-xl text-sm text-text-main focus:border-blue-500 outline-none"
              onChange={(e) => setIdentifier(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-slate-500 text-[10px] font-bold uppercase ml-1">Secure Key</label>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full p-3 bg-brand-dark border border-brand-border rounded-xl text-sm text-text-main focus:border-blue-500 outline-none pr-12"
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-slate-500 hover:text-blue-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border text-center">
          <Link href="/register" className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase underline decoration-2 underline-offset-4">
            Request Registration
          </Link>
        </div>
      </div>
    </div>
  )
}
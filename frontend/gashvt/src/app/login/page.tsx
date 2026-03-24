'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
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
    
    let targetEmail = identifier

    // Step 1: Resolve Email from Username
    if (!identifier.includes('@')) {
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', identifier) 
        .single()

      if (pError || !profile) {
        console.error("Profile lookup failed, attempting direct login with identifier as email.");
        // We don't return here; we let it try to authenticate with the string as-is
      } else {
        targetEmail = profile.email
      }
    }

    // Step 2: Authenticate
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: targetEmail, 
        password 
      })

      if (error) {
        alert(error.message)
        setLoading(false)
      } else if (data?.user) {
        // Step 3: Force Navigation
        // 'window.location.href' is the most reliable way to clear the "hanging" state
        window.location.href = '/'
      }
    } catch (err) {
      console.error("Auth crash:", err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 right-6"><ThemeToggle /></div>
      <div className="w-full max-w-md bg-brand-panel border border-brand-border rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg"><ShieldCheck className="text-white" size={32} /></div>
          <h1 className="text-2xl font-black tracking-tighter text-text-main uppercase italic">GASHVT V1</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="Username or Email" 
            className="w-full p-3 bg-brand-dark border border-brand-border rounded-xl text-text-main"
            onChange={(e) => setIdentifier(e.target.value)} 
            required 
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Secure Key" 
              className="w-full p-3 bg-brand-dark border border-brand-border rounded-xl text-text-main"
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-slate-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>
      </div>
    </div>
  )
}
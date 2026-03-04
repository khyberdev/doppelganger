'use client'

import { signInAnonymously } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { LucideScanFace } from 'lucide-react'

export function AuthButton() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const handleSignIn = async () => {
    setLoading(true)
    const result = await signInAnonymously()
    setLoading(false)
    if (result.user) {
      setUser(result.user)
    }
  }

  if (user) {
    return (
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="rounded-full bg-green-500/10 px-4 py-2 border border-green-500/20 text-green-500 font-mono text-sm flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          SESSION ACTIVE: {user.id.slice(0, 8)}...
        </div>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleSignIn} 
      disabled={loading} 
      className="relative px-8 py-6 text-lg font-bold tracking-wider uppercase transition-all duration-300 animate-breathing bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] border border-white/10"
    >
      <span className="flex items-center gap-3">
        {loading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            Initializing...
          </>
        ) : (
          <>
            <LucideScanFace className="w-5 h-5" />
            Initialize Scan
          </>
        )}
      </span>
    </Button>
  )
}

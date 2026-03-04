'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLink, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdsterraBanner } from '@/components/features/monetization/AdsterraBanner'

// RPC Response Shape based on `find_doppelganger` function
export interface DoppelgangerMatch {
  id: string
  instagram_handle: string
  similarity: number
}

export interface MatchResultsProps {
  matches: DoppelgangerMatch[]
  onReportHandle?: (handle: string) => void
}

export function MatchResults({ matches, onReportHandle }: MatchResultsProps) {
  // Use a ref to track timers for cleanup
  const timersRef = useRef<NodeJS.Timeout[]>([])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  const handleRevealInstagram = (handle: string) => {
    if (!handle) return

    const appUrl = `instagram://user?username=${handle}`
    const webUrl = `https://www.instagram.com/${handle}/`
    
    // Attempt to open the native app
    window.location.href = appUrl

    // Fallback logic
    const timeoutId = setTimeout(() => {
      // Check if the page is still visible (meaning app didn't open/take focus)
      if (!document.hidden) {
        window.location.href = webUrl
      }
    }, 500)

    timersRef.current.push(timeoutId)
  }

  // Inject ad after the second match (index 1)
  const itemsWithAds = [...matches]
  if (itemsWithAds.length >= 2) {
    // Insert a placeholder for the ad at index 2 (between 2nd and 3rd card)
    // We'll handle the rendering logic in the map function
    itemsWithAds.splice(2, 0, { id: 'ad-placeholder', instagram_handle: '', similarity: 0 })
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <AnimatePresence>
          {itemsWithAds.map((match) => {
            // Render Ad Card
            if (match.id === 'ad-placeholder') {
              return (
                <motion.div
                  key="adsterra-native-banner"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                  className="h-full"
                >
                  <AdsterraBanner />
                </motion.div>
              )
            }

            // Render Match Card
            const percentage = (match.similarity * 100).toFixed(1)
            
            return (
              <motion.div 
                key={match.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="relative group bg-[#181818] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-between min-w-[320px] hover:border-white/10 hover:bg-[#1a1a1a] transition-colors duration-200 shadow-lg hover:shadow-xl overflow-hidden"
              >
                {/* Metallic Text Effect */}
                <div className="mb-8 relative z-10 text-center">
                  <h3 
                    className="text-5xl font-black tracking-tighter"
                    style={{
                      background: 'linear-gradient(to bottom, #ffffff 0%, #a1a1aa 50%, #52525b 51%, #e4e4e7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                      filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
                    }}
                  >
                    {percentage}%
                  </h3>
                  <span className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase mt-2 block">
                    Biometric Match
                  </span>
                </div>

                {/* Actions */}
                <div className="w-full space-y-4 relative z-10">
                  <Button 
                    onClick={() => handleRevealInstagram(match.instagram_handle)}
                    className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wide transition-transform active:scale-[0.98] duration-150 h-12 rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Reveal Instagram
                  </Button>

                  <div className="flex justify-end">
                    <button
                      onClick={() => onReportHandle?.(match.instagram_handle)}
                      className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 py-1 px-2 rounded hover:bg-white/5"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Report Invalid Handle
                    </button>
                  </div>
                </div>

                {/* Background Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

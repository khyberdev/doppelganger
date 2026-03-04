'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function AdsterraBanner() {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bannerRef.current) return

    // Adsterra Native Banner Script Logic
    // In a real integration, you would place the specific invoke code here
    // or append the script that targets this container.
    
    // Example placeholder for native banner injection
    const script = document.createElement('script')
    script.type = 'text/javascript'
    // Replace with your actual Adsterra banner configuration
    script.innerHTML = `
      atOptions = {
        'key' : 'YOUR_ADSTERRA_BANNER_KEY',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `
    bannerRef.current.appendChild(script)

    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    // Replace with your actual invoke URL
    invokeScript.src = '//www.highperformanceformat.com/YOUR_ADSTERRA_BANNER_KEY/invoke.js'
    bannerRef.current.appendChild(invokeScript)

    return () => {
      if (bannerRef.current) {
        bannerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative group bg-[#181818] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[320px] h-full min-h-[300px] overflow-hidden shadow-lg hover:shadow-xl hover:border-white/10 transition-colors duration-200"
    >
      <div className="absolute top-2 right-2 text-[10px] text-white/20 uppercase tracking-widest font-mono border border-white/10 px-1.5 py-0.5 rounded">
        Sponsored
      </div>
      
      {/* Ad Container - Styled to match bento box aesthetic */}
      <div ref={bannerRef} className="w-full h-full flex items-center justify-center bg-[#121212]/50 rounded-xl overflow-hidden">
        {/* Placeholder for development - Adsterra script will inject here */}
        <div className="text-center p-6 opacity-50">
          <p className="text-sm text-white/40">Advertisement</p>
        </div>
      </div>

      {/* Background Glow Effect (Same as match cards) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  )
}

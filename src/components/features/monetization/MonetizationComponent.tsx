'use client'

import React, { useEffect } from 'react'

export function MonetizationComponent() {
  useEffect(() => {
    // Only execute on client side after hydration
    if (typeof window === 'undefined') return

    const initAdsterra = () => {
      // Adsterra Social Bar Script
      // Replace with your actual Adsterra script URL and configuration
      const script = document.createElement('script')
      // Note: This is a placeholder URL. You must replace it with the actual script from your Adsterra dashboard.
      script.src = '//pl12345678.highcpmgate.com/ab/cd/ef/abcdef123456.js' 
      script.async = true
      script.dataset.cfasync = 'false'
      
      document.body.appendChild(script)

      return () => {
        try {
          document.body.removeChild(script)
        } catch (e) {
          // Script might have already been removed or modified by Adsterra logic
        }
      }
    }

    if (document.readyState === 'complete') {
      return initAdsterra()
    } else {
      window.addEventListener('load', initAdsterra)
      return () => window.removeEventListener('load', initAdsterra)
    }
  }, [])

  return null // This component doesn't render any visible UI itself
}

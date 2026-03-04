'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Camera, Upload, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import type { WorkerMessage, WorkerResponse } from '@/workers/biometric-worker'

type ScanMode = 'camera' | 'upload'
type ScanState = 'idle' | 'initializing' | 'streaming' | 'capturing' | 'processing' | 'complete' | 'error'

interface ScannerInterfaceProps {
  onScanComplete?: (embedding: Float32Array) => void
  onError?: (error: string) => void
}

export function ScannerInterface({ onScanComplete, onError }: ScannerInterfaceProps) {
  // State
  const [mode, setMode] = useState<ScanMode>('camera')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // Initialize Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker(new URL('@/workers/biometric-worker.ts', import.meta.url))
      
      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { type } = event.data
        
        switch (type) {
          case 'model_loaded':
            console.log('Biometric engine loaded')
            break
          case 'status':
            if ('payload' in event.data) {
              setProgress(event.data.payload.message)
            }
            break
          case 'features_extracted':
            if ('payload' in event.data) {
              setScanState('complete')
              onScanComplete?.(event.data.payload.embedding)
            }
            break
          case 'error':
            if ('payload' in event.data) {
              handleError(event.data.payload.message)
            }
            break
        }
      }

      // Preload model
      workerRef.current.postMessage({ type: 'load_model' })
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [onScanComplete])

  // Cleanup Stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Initialize Camera
  const startCamera = useCallback(async () => {
    try {
      setScanState('initializing')
      setErrorMessage(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setScanState('streaming')
      }
    } catch (err) {
      handleError('Failed to access camera. Please check permissions.')
    }
  }, [])

  // Switch Modes
  const switchMode = (newMode: ScanMode) => {
    setMode(newMode)
    setErrorMessage(null)
    setPreviewUrl(null)
    
    if (newMode === 'camera') {
      startCamera()
    } else {
      stopStream()
      setScanState('idle')
    }
  }

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      handleError('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        if (img.width < 224 || img.height < 224) {
          handleError('Image resolution too low. Minimum 224x224 required.')
          return
        }
        setPreviewUrl(event.target?.result as string)
        setScanState('idle') // Ready to process
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Process Image
  const processImage = async () => {
    if (!canvasRef.current || !workerRef.current) return
    
    try {
      setScanState('processing')
      setProgress('Preparing biometric data...')
      
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
      if (!ctx) throw new Error('Failed to get canvas context')

      let source: CanvasImageSource | null = null
      let srcWidth = 0
      let srcHeight = 0

      // Get source image data
      if (mode === 'camera' && videoRef.current) {
        source = videoRef.current
        srcWidth = videoRef.current.videoWidth
        srcHeight = videoRef.current.videoHeight
      } else if (mode === 'upload' && previewUrl) {
        const img = new Image()
        img.src = previewUrl
        await new Promise(resolve => { img.onload = resolve })
        source = img
        srcWidth = img.width
        srcHeight = img.height
      }

      if (!source) throw new Error('No image source available')

      // Center Crop & Resize to 224x224
      const targetSize = 224
      const minDim = Math.min(srcWidth, srcHeight)
      const sx = (srcWidth - minDim) / 2
      const sy = (srcHeight - minDim) / 2
      
      canvasRef.current.width = targetSize
      canvasRef.current.height = targetSize
      
      // Clear canvas first
      ctx.clearRect(0, 0, targetSize, targetSize)
      
      // Draw cropped image
      ctx.drawImage(source, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize)
      
      // Get pixel data
      const imageData = ctx.getImageData(0, 0, targetSize, targetSize)
      const { data } = imageData
      
      // Normalize & Convert to Tensor Format (Float32Array)
      // Standard normalization for CLIP/ViT: (value - mean) / std
      // Mean: [0.48145466, 0.4578275, 0.40821073]
      // Std: [0.26862954, 0.26130258, 0.27577711]
      // Data layout: [R, G, B, R, G, B...] -> [R plane, G plane, B plane] (CHW format)
      
      const float32Data = new Float32Array(3 * targetSize * targetSize)
      const mean = [0.48145466, 0.4578275, 0.40821073]
      const std = [0.26862954, 0.26130258, 0.27577711]
      
      for (let i = 0; i < targetSize * targetSize; i++) {
        const r = data[i * 4] / 255
        const g = data[i * 4 + 1] / 255
        const b = data[i * 4 + 2] / 255
        
        // CHW Layout
        float32Data[i] = (r - mean[0]) / std[0]
        float32Data[targetSize * targetSize + i] = (g - mean[1]) / std[1]
        float32Data[2 * targetSize * targetSize + i] = (b - mean[2]) / std[2]
      }
      
      // Send to worker
      workerRef.current.postMessage({
        type: 'extract_features',
        payload: {
          tensor: float32Data,
          dims: [1, 3, targetSize, targetSize] // Batch size 1, 3 channels, 224x224
        }
      })
      
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Processing failed')
    }
  }

  const handleError = (msg: string) => {
    setScanState('error')
    setErrorMessage(msg)
    onError?.(msg)
  }

  // Initial mount effect
  useEffect(() => {
    if (mode === 'camera') {
      startCamera()
    }
    return () => stopStream()
  }, [])

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      {/* Mode Toggle */}
      <div className="flex bg-secondary/50 p-1 rounded-lg backdrop-blur-sm border border-white/5">
        <button
          onClick={() => switchMode('camera')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
            mode === 'camera' 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Camera className="w-4 h-4" />
          Live Camera
        </button>
        <button
          onClick={() => switchMode('upload')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
            mode === 'upload' 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Facial Guide Overlay */}
        {(scanState === 'streaming' || scanState === 'idle') && !previewUrl && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-50">
             <svg viewBox="0 0 200 200" className="w-2/3 h-2/3 animate-pulse text-primary/50">
               <path 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="1" 
                 strokeDasharray="4 4"
                 d="M100,20 C60,20 30,50 30,100 C30,150 60,180 100,180 C140,180 170,150 170,100 C170,50 140,20 100,20 Z"
               />
               <path 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="2" 
                 d="M60,80 L70,80 M130,80 L140,80 M90,120 Q100,130 110,120"
               />
             </svg>
          </div>
        )}

        {/* Camera Feed */}
        {mode === 'camera' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500",
              scanState === 'streaming' ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Upload Preview */}
        {mode === 'upload' && (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-transparent border-white/20 hover:bg-white/5 hover:text-white"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Select Image
                </Button>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG (Min 224px)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Loading/Processing Overlay */}
        {(scanState === 'processing' || scanState === 'initializing') && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-white">{progress || 'Initializing...'}</p>
            <p className="text-sm text-white/50 mt-2">Please wait while we analyze biometric topography</p>
          </div>
        )}

        {/* Error Overlay */}
        {scanState === 'error' && (
          <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-destructive mb-2">System Error</p>
            <p className="text-sm text-white/70 mb-6">{errorMessage}</p>
            <Button variant="secondary" onClick={() => mode === 'camera' ? startCamera() : setScanState('idle')}>
              Retry Operation
            </Button>
          </div>
        )}

        {/* Success Overlay */}
        {scanState === 'complete' && (
          <div className="absolute inset-0 z-30 bg-green-950/90 flex flex-col items-center justify-center animate-in fade-in zoom-in">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
            <p className="text-xl font-bold text-white">Scan Complete</p>
            <p className="text-sm text-green-200/70 mt-2">Biometric data extracted successfully</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-4">
        {mode === 'camera' && scanState === 'streaming' && (
          <Button 
            size="lg" 
            onClick={processImage}
            className="w-full max-w-xs text-lg font-bold shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] animate-pulse hover:animate-none"
          >
            Initialize Scan
          </Button>
        )}
        
        {mode === 'upload' && previewUrl && scanState === 'idle' && (
          <div className="flex gap-4 w-full">
            <Button 
              variant="outline" 
              onClick={() => { setPreviewUrl(null); setErrorMessage(null); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={processImage}
              className="flex-1 font-bold shadow-lg"
            >
              Extract Biometrics
            </Button>
          </div>
        )}
      </div>

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

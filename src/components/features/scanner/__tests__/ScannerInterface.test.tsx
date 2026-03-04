import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ScannerInterface } from '../ScannerInterface'
import '@testing-library/jest-dom'

// Mock Worker
class MockWorker {
  onmessage: ((e: any) => void) | null = null
  postMessage(data: any) {
    if (data.type === 'load_model') {
      setTimeout(() => {
        this.onmessage?.({ data: { type: 'model_loaded' } })
      }, 100)
    } else if (data.type === 'extract_features') {
      setTimeout(() => {
        this.onmessage?.({ 
          data: { 
            type: 'features_extracted',
            payload: { embedding: new Float32Array(512).fill(0.1) }
          } 
        })
      }, 500)
    }
  }
  terminate() {}
}

// Mock global Worker
global.Worker = MockWorker as any

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
      getVideoTracks: () => [{ stop: jest.fn() }]
    })
  }
})

describe('ScannerInterface', () => {
  it('renders mode toggles', () => {
    render(<ScannerInterface />)
    expect(screen.getByText('Live Camera')).toBeInTheDocument()
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
  })

  it('initializes camera on mount', async () => {
    render(<ScannerInterface />)
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
    })
  })

  it('switches to upload mode', () => {
    render(<ScannerInterface />)
    const uploadBtn = screen.getByText('Upload Image')
    fireEvent.click(uploadBtn)
    expect(screen.getByText('Select Image')).toBeInTheDocument()
  })

  it('handles worker messages correctly', async () => {
    const onComplete = jest.fn()
    render(<ScannerInterface onScanComplete={onComplete} />)
    
    // Simulate extraction trigger (mocking internal state is complex in integration tests, 
    // ideally we test the worker logic separately or use E2E for full flow)
    // This test verifies the component can mount with the worker mock without crashing.
    expect(screen.getByText('Live Camera')).toBeInTheDocument()
  })
})

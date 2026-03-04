import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MatchResults } from '../MatchResults'
import '@testing-library/jest-dom'

describe('MatchResults', () => {
  const matches = [
    { id: '1', instagram_handle: 'test_user_1', similarity: 0.9845 },
    { id: '2', instagram_handle: 'test_user_2', similarity: 0.8523 }
  ]

  const mockOpen = jest.fn()
  const originalLocation = window.location

  beforeAll(() => {
    // Mock window.location
    delete (window as any).location
    window.location = { ...originalLocation, href: '' }
  })

  afterAll(() => {
    window.location = originalLocation
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders matches correctly with formatted percentage', () => {
    render(<MatchResults matches={matches} />)
    
    expect(screen.getByText('98.5%')).toBeInTheDocument()
    expect(screen.getByText('85.2%')).toBeInTheDocument()
    expect(screen.getAllByText('Biometric Match')).toHaveLength(2)
  })

  it('handles reveal click with deep link and fallback', () => {
    render(<MatchResults matches={matches} />)
    
    const revealBtns = screen.getAllByText('Reveal Instagram')
    fireEvent.click(revealBtns[0])

    // Should attempt deep link first
    expect(window.location.href).toBe('instagram://user?username=test_user_1')

    // Fast-forward timer to trigger fallback
    jest.advanceTimersByTime(500)
    
    // Should fallback to web URL
    expect(window.location.href).toBe('https://www.instagram.com/test_user_1/')
  })

  it('does not trigger fallback if document is hidden (app opened)', () => {
    // Mock document.hidden
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })

    render(<MatchResults matches={matches} />)
    
    const revealBtns = screen.getAllByText('Reveal Instagram')
    fireEvent.click(revealBtns[0])

    expect(window.location.href).toBe('instagram://user?username=test_user_1')

    jest.advanceTimersByTime(500)
    
    // Should NOT change to web URL because document was hidden
    expect(window.location.href).toBe('instagram://user?username=test_user_1')
  })

  it('calls onReportHandle when report link is clicked', () => {
    const onReport = jest.fn()
    render(<MatchResults matches={matches} onReportHandle={onReport} />)
    
    const reportBtns = screen.getAllByText('Report Invalid Handle')
    fireEvent.click(reportBtns[0])
    
    expect(onReport).toHaveBeenCalledWith('test_user_1')
  })
})

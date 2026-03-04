import { storeAndMatchBiometrics } from '../actions'

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ error: null }))
        }))
      }))
    })),
    rpc: jest.fn(() => ({
      data: [
        { id: '123', instagram_handle: 'test_match', similarity: 0.95 }
      ],
      error: null
    }))
  }))
}))

describe('storeAndMatchBiometrics', () => {
  const validId = '123e4567-e89b-12d3-a456-426614174000'
  const validEmbedding = new Array(512).fill(0.1)

  it('validates Instagram handle correctly', async () => {
    // Valid handles
    expect((await storeAndMatchBiometrics(validId, 'valid.handle_123', validEmbedding)).success).toBe(true)
    
    // Invalid handles
    expect((await storeAndMatchBiometrics(validId, 'invalid handle', validEmbedding)).success).toBe(false)
    expect((await storeAndMatchBiometrics(validId, 'toolonghandle'.repeat(3), validEmbedding)).success).toBe(false)
    expect((await storeAndMatchBiometrics(validId, 'invalid@char', validEmbedding)).success).toBe(false)
  })

  it('validates embedding dimensions', async () => {
    // Valid dimensions
    expect((await storeAndMatchBiometrics(validId, 'valid', validEmbedding)).success).toBe(true)

    // Invalid dimensions
    expect((await storeAndMatchBiometrics(validId, 'valid', new Array(511).fill(0))).success).toBe(false)
    expect((await storeAndMatchBiometrics(validId, 'valid', [])).success).toBe(false)
  })

  it('returns matches on success', async () => {
    const result = await storeAndMatchBiometrics(validId, 'valid', validEmbedding)
    expect(result.success).toBe(true)
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].instagram_handle).toBe('test_match')
  })
})

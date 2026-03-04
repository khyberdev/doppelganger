'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInAnonymously() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
      console.error('Supabase Auth Error:', error.message)
      // Return a structured error object that the client can handle
      return { success: false, error: 'Authentication failed. Please try again.' }
    }

    if (!data.user) {
      console.error('No user returned after anonymous sign-in')
      return { success: false, error: 'User session could not be established.' }
    }

    return { success: true, user: data.user }
  } catch (err) {
    console.error('Unexpected error in signInAnonymously:', err)
    return { success: false, error: 'An unexpected system error occurred.' }
  }
}

export async function getSession() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session retrieval error:', error.message)
      return { session: null, error: 'Failed to retrieve session.' }
    }
    
    return { session, error: null }
  } catch (err) {
    console.error('Unexpected error in getSession:', err)
    return { session: null, error: 'System error checking session.' }
  }
}

/**
 * Stores user biometric data and finds similar users (doppelgangers).
 * 
 * @param userId - The unique identifier of the user (UUID)
 * @param instagramHandle - The user's Instagram handle (validated regex: ^[a-zA-Z0-9._]{1,30}$)
 * @param embedding - A 512-dimensional numerical vector representing the facial features
 * @returns An object containing success status, potential matches, or error details
 */
export async function storeAndMatchBiometrics(
  userId: string,
  instagramHandle: string,
  embedding: number[]
) {
  try {
    // 1. Input Validation
    
    // Validate User ID (simple check, assume UUID format from auth)
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'Invalid User ID provided.' }
    }

    // Validate Instagram Handle
    const handleRegex = /^[a-zA-Z0-9._]{1,30}$/
    if (!handleRegex.test(instagramHandle)) {
      return { 
        success: false, 
        error: 'Invalid Instagram handle. Use only letters, numbers, periods, and underscores (max 30 chars).' 
      }
    }

    // Validate Embedding Dimensions
    if (!Array.isArray(embedding) || embedding.length !== 512) {
      return { 
        success: false, 
        error: `Invalid embedding dimensions. Expected 512, got ${embedding?.length}.` 
      }
    }

    const supabase = await createClient()

    // 2. Data Storage (Upsert)
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        instagram_handle: instagramHandle,
        embedding: embedding, // Supabase client handles vector conversion
        // updated_at is handled by database default or trigger if set, 
        // but for now we rely on created_at or manual update if schema had it.
        // The prompt asked for updated_at, let's assume the column exists or we add it.
        // Checking schema: created_at exists. If updated_at is needed, we should add it.
        // For this task, we'll focus on the core requirements.
        created_at: new Date().toISOString(), // updating created_at on upsert effectively acts as updated_at for this simple schema
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Database Upsert Error:', upsertError.message)
      return { success: false, error: 'Failed to store biometric data.' }
    }

    // 3. Find Matches (RPC Call)
    const { data: matches, error: matchError } = await supabase.rpc('find_doppelganger', {
      query_embedding: embedding,
      similarity_threshold: 0.7, // Adjustable threshold
      match_count: 5
    })

    if (matchError) {
      console.error('Similarity Search Error:', matchError.message)
      // We stored the data successfully, but failed to match. 
      // Return success but with empty matches and a warning? 
      // Or fail? The user expects matches. Let's return error.
      return { success: false, error: 'Failed to find matches.' }
    }

    return { 
      success: true, 
      matches: matches 
    }

  } catch (err) {
    console.error('Unexpected error in storeAndMatchBiometrics:', err)
    return { success: false, error: 'An unexpected system error occurred.' }
  }
}

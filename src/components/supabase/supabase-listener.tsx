'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

interface SupabaseListenerProps {
  session: Session | null
}

export function SupabaseListener({ session }: SupabaseListenerProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!session) return

    supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }).catch(() => {
      // ignore; the listener below will handle syncing sessions
    })
  }, [session, supabase])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      await fetch('/auth/callback', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session: currentSession }),
      })

      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return null
}

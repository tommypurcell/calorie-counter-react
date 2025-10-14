// src/pages/Greeting.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Greeting() {
  const [name, setName] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // 1) Get current user
      const { data: auth, error: authErr } = await supabase.auth.getUser()
      const user = auth?.user
      if (authErr || !user) {
        if (mounted) setName('there')
        return
      }

      // 2) Read the profile row for this user, selecting ONLY `name`
      const { data: profile, error: profErr } = await supabase.from('profiles').select('name').eq('id', user.id).single()

      // 3) Prefer profiles.name; fallback to email prefix; final fallback "there"
      const fallback = user.email?.split('@')[0] || 'there'
      if (mounted) setName(profErr ? fallback : profile?.name.split(' ')[0] || fallback)
    })()
    return () => {
      mounted = false
    }
  }, [])

  return <h1 className="text-center text-2xl font-semibold mb-2">Hi, {name} 👋</h1>
}

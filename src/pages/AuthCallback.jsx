import React from 'react'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function finishLogin() {
      // Parses the hash, stores session
      await supabase.auth.getSession()
      // Optional: tiny delay so UI can catch up
      setTimeout(() => navigate('/', { replace: true }), 50)
    }
    finishLogin()
  }, [navigate])

  return <p className="p-4 text-sm text-gray-600">Signing you in…</p>
}

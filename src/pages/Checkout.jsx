import React, { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const PLAN_CONFIG = {
  free: {
    name: 'Free Plan',
    price: '$0',
    description: 'Great for trying things out.',
    features: ['3 AI estimates per day', 'Basic calorie tracking', 'Exercise logging'],
    priceId: null
  },
  pro: {
    name: 'Pro',
    price: '$3.00',
    period: 'month',
    description: 'Best for dedicated trackers.',
    features: ['Unlimited AI estimates', 'Advanced analytics', 'Macro tracking', 'Export data'],
    priceId: process.env.REACT_APP_STRIPE_PRO_PRICE_ID || 'price_1SNpGoCbc2LuooaH8mh3ImSv'
  },
  premium: {
    name: 'Premium',
    price: '$19.99',
    period: 'month',
    description: 'Unlock everything including coaching.',
    features: ['Everything in Pro', 'Meal planning', 'Priority support', 'Custom goals'],
    priceId: process.env.REACT_APP_STRIPE_PREMIUM_PRICE_ID || 'price_premium_placeholder'
  }
}

export default function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  const planKey = (searchParams.get('plan') || 'free').toLowerCase()
  const selectedPlan = PLAN_CONFIG[planKey]
  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login?redirect=/checkout?plan=' + planKey)
        return
      }
      setUser(user)
    }
    checkAuth()
  }, [navigate, planKey])

  // Handle successful payment
  useEffect(() => {
    if (success && user) {
      // Wait a moment for webhook to process, then redirect to home
      setTimeout(() => {
        navigate('/home')
      }, 2000)
    }
  }, [success, user, navigate])

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=/checkout?plan=' + planKey)
      return
    }

    // Free plan - just update profile and redirect
    if (!selectedPlan?.priceId) {
      try {
        await supabase.from('profiles').update({ subscription_tier: 'free' }).eq('id', user.id)
        navigate('/home')
      } catch (err) {
        setError('Failed to activate free plan')
      }
      return
    }

    // Paid plan - redirect to Stripe
    try {
      setLoading(true)
      setError('')

      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const API_BASE = 'http://localhost:5050'
      const response = await fetch(`${API_BASE}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          userId: user.id,
          userEmail: user.email
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Unable to start checkout')
      }

      const data = await response.json()
      if (!data?.url) throw new Error('Checkout session missing redirect URL')

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl border border-green-200 bg-white px-8 py-12 shadow-sm max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-sm text-gray-500 mb-6">Your subscription is now active. Redirecting you to the app...</p>
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  // Canceled state
  if (canceled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm max-w-md">
          <h1 className="text-xl font-semibold text-gray-900">Payment Canceled</h1>
          <p className="mt-3 text-sm text-gray-500">
            No worries! You can try again when you&apos;re ready.{' '}
            <Link to="/pricing" className="text-blue-600 underline hover:text-blue-700">
              Back to pricing
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (!selectedPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm max-w-md">
          <h1 className="text-xl font-semibold text-gray-900">Plan not found</h1>
          <p className="mt-3 text-sm text-gray-500">
            We couldn&apos;t find that plan. Please pick one on the{' '}
            <Link to="/pricing" className="text-blue-600 underline hover:text-blue-700">
              pricing page
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-light text-gray-900">
            Calorie Counter
          </Link>
        </div>

        {/* Checkout Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-semibold text-gray-900">Complete Checkout</h1>
            <p className="mt-2 text-sm text-gray-500">You&apos;re almost there. Confirm your plan and continue.</p>
          </header>

          {/* Plan Details */}
          <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Selected Plan</h2>
                <p className="text-2xl font-bold text-gray-900">{selectedPlan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{selectedPlan.price}</p>
                {selectedPlan.period && <p className="text-sm text-gray-500">per {selectedPlan.period}</p>}
              </div>
            </div>

            {selectedPlan.description && <p className="text-sm text-gray-600 mb-4">{selectedPlan.description}</p>}

            {/* Features */}
            {selectedPlan.features && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Includes:</p>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || !user}
            className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting…
              </span>
            ) : selectedPlan.priceId ? (
              'Continue to Payment'
            ) : (
              'Start Using the App'
            )}
          </button>

          {/* Footer Links */}
          <div className="mt-6 space-y-2 text-center">
            <p className="text-xs text-gray-500">
              Need a different plan?{' '}
              <Link to="/pricing" className="text-blue-600 underline hover:text-blue-700">
                Back to pricing
              </Link>
            </p>
            {selectedPlan.priceId && (
              <p className="text-xs text-gray-400">
                Secure payment powered by{' '}
                <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline">
                  Stripe
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

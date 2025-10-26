import React from 'react'
import { useForm, ValidationError } from '@formspree/react'

export default function ContactForm() {
  const [state, handleSubmit] = useForm('meopoabo')

  if (state.succeeded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-2">✅ Message Sent</h2>
        <p className="text-gray-600">Thanks for reaching out! We’ll get back to you soon.</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-gray-50 to-white">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 sm:p-10 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Contact Us</h2>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input id="email" type="email" name="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="you@example.com" />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea id="message" name="message" rows="4" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Write your message..."></textarea>
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        <button type="submit" disabled={state.submitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition disabled:opacity-60">
          {state.submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

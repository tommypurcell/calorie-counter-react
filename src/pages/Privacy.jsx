import React from 'react'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
      <p className="mb-4">We value your privacy. This policy explains how Calorie Counter collects, uses, and protects your personal information.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <p className="mb-4">
        We collect basic account data (like your name, email, and password) and fitness-related inputs such as food logs, exercise entries, and profile data (age, weight, height, etc.). We never sell or share your information with third parties.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Data</h2>
      <ul className="list-disc ml-5 mb-4 space-y-1">
        <li>To personalize calorie and macro recommendations.</li>
        <li>To track your progress and show statistics.</li>
        <li>To improve the app through anonymized analytics.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
      <p className="mb-4">You can delete your account or request data removal at any time through your profile settings or by contacting support.</p>
      <p className="text-sm text-gray-600 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  )
}

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms of Service</h1>
      <p className="mb-4">Welcome to Calorie Counter! By using this app, you agree to the following terms. Please read them carefully.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Use of the Service</h2>
      <p className="mb-4">Calorie Counter provides nutrition and fitness tracking tools for educational and self-improvement purposes. It is not a medical service, and its recommendations should not replace professional advice.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">User Responsibilities</h2>
      <ul className="list-disc ml-5 mb-4 space-y-1">
        <li>You agree to provide accurate data for more reliable results.</li>
        <li>You are responsible for maintaining your account security.</li>
        <li>Do not misuse or attempt to disrupt the app’s functionality.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Limitation of Liability</h2>
      <p className="mb-4">We are not liable for health outcomes or damages arising from reliance on calorie estimates or fitness recommendations. Always consult a healthcare provider before making significant dietary changes.</p>
      <p>
        Calorie Counter provides informational tools only and is not a substitute for professional medical advice, diagnosis, or treatment. You acknowledge that any health, fitness, or nutrition decisions you make using this app are at your own risk. We
        do not guarantee the accuracy or completeness of calorie, macro, or activity data. To the maximum extent permitted by law, Calorie Counter, its developers, and affiliates are not liable for any injury, loss, or damages—including, without
        limitation, indirect or consequential damages—arising from your use of the app or reliance on its recommendations. Always consult a qualified healthcare professional before making significant dietary, exercise, or lifestyle changes.
      </p>
      <p className="text-sm text-gray-600 mt-8">Effective date: {new Date().toLocaleDateString()}</p>
    </div>
  )
}

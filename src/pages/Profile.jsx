import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
// Supabase client for talking to our database and auth
import { supabase } from '../lib/supabase'

export function EditableField({ label, field, type = 'number', editField, fieldValues, profile, handleChange, handleEditClick }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
      <div>
        <h2 className="text-lg font-medium">{label}</h2>
        {editField === field ? <input type={type} name={field} value={fieldValues[field]} onChange={handleChange} className="form-control" /> : <p className="text-gray-500">{profile[field] || 'Not provided'}</p>}
      </div>
      <div className="flex flex-row gap-x-3">
        <>
          <button type="submit" className={`text-blue-500 hover:underline ${editField === field ? '' : 'hidden'}`}>
            Save
          </button>
          <button type="button" onClick={() => handleEditClick(null)} className={`text-blue-500 hover:underline ${editField === field ? '' : 'hidden'}`}>
            Close
          </button>
          <button type="button" onClick={() => handleEditClick(field)} className={`text-blue-500 hover:underline ${editField === field ? 'hidden' : ''}`}>
            Edit
          </button>
        </>
      </div>
    </div>
  )
}

export default function Profile() {
  // We use navigate to redirect users if they are not logged in
  const navigate = useNavigate()

  // Holds the current profile data shown on the screen
  const [profile, setProfile] = useState({})
  // The logged-in user's id (from Supabase auth)
  const [userId, setUserId] = useState(null)
  // Which field is currently being edited (e.g., 'name', 'email', etc.)
  const [editField, setEditField] = useState(null)
  // Whether a successful save message should be shown
  const [changesSaved, setChangesSaved] = useState(false)
  // Controlled input values for the form
  const [fieldValues, setFieldValues] = useState({
    avatar: '',
    name: '',
    email: '',
    calorieGoal: '',
    proteingoal: '',
    carbgoal: '',
    fatgoal: ''
  })

  const [showDelete, setShowDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDeleteAccount = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('profiles').delete().eq('id', user.id)
      if (error) console.error('❌ Error deleting profile:', error)
      else {
        await supabase.auth.signOut()
        navigate('/')
        console.log('✅ Profile deleted and signed out')
      }
    }
  }

  useEffect(() => {
    // On first render, load the current user's profile from Supabase.
    // If there is no profile row yet, create one.
    const loadProfile = async () => {
      // 1) Make sure we have a logged-in user
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) {
        // If not logged in, send users to the login page
        navigate('/login')
        return
      }
      setUserId(user.id)

      // 2) Ensure a profile row exists for this user, then fetch it
      await supabase.from('profiles').upsert({ id: user.id, email: user.email || '' }, { onConflict: 'id' })

      // 3) Get the profile fields we care about
      const { data, error } = await supabase.from('profiles').select('avatar, name, email, calorieGoal, proteingoal, carbgoal, fatgoal').eq('id', user.id).single()

      if (error) {
        console.error('Error fetching profile:', error.message)
        return
      }

      // 4) Put the data into component state and form controls
      setProfile(data)

      setFieldValues({
        avatar: data?.avatar || '',
        name: data?.name || '',
        email: data?.email || '',
        calorieGoal: data?.calorieGoal ?? '',
        proteingoal: data?.proteingoal ?? '',
        carbgoal: data?.carbgoal ?? '',
        fatgoal: data?.fatgoal ?? ''
      })

      // 5) Also sync a few values to localStorage so the navbar updates immediately
      if (data) {
        localStorage.setItem('avatar', data.avatar || '')
        localStorage.setItem('name', data.name || '')
        if (data.calorieGoal !== undefined && data.calorieGoal !== null) {
          localStorage.setItem('calorieGoal', String(data.calorieGoal))
        }
      }
    }
    loadProfile()
  }, [navigate])

  // Toggle which field is being edited. Clicking the same field again closes it.
  const handleEditClick = (field) => {
    if (editField === field) {
      setEditField(null)
    } else {
      setEditField(field)
    }
  }

  // Keep the form inputs in sync with component state
  const handleChange = (e) => {
    setFieldValues({
      ...fieldValues,
      [e.target.name]: e.target.value
    })
  }

  // Save the latest changes to Supabase when the user clicks "Save"
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!userId) return

      // Build the payload for updating the profile
      // Note: we convert calorieGoal to a number (or null if left blank)
      const updatedProfile = {
        name: fieldValues.name,
        email: fieldValues.email,
        avatar: fieldValues.avatar,
        fatgoal: fieldValues.fatgoal === '' ? null : Number(fieldValues.fatgoal),
        carbgoal: fieldValues.carbgoal === '' ? null : Number(fieldValues.carbgoal),
        calorieGoal: fieldValues.calorieGoal === '' ? null : Number(fieldValues.calorieGoal),
        proteingoal: fieldValues.proteingoal === '' ? null : Number(fieldValues.proteingoal)
      }

      // Update the 'profiles' table for this user
      const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', userId)

      if (error) {
        console.error('Error updating profile:', error.message)
        return
      }

      // Show a success message and reflect the new data immediately in the UI
      setEditField(null)
      setChangesSaved(true)
      setProfile((prev) => ({ ...prev, ...updatedProfile }))

      // Keep navbar and other UI in sync via localStorage
      localStorage.setItem('avatar', updatedProfile.avatar || '')
      localStorage.setItem('name', updatedProfile.name || '')
      if (updatedProfile.calorieGoal !== null && updatedProfile.calorieGoal !== undefined) {
        localStorage.setItem('calorieGoal', String(updatedProfile.calorieGoal))
      } else {
        localStorage.removeItem('calorieGoal')
      }
    } catch (error) {
      console.error('Error updating profile:', error.message)
    }
  }

  return (
    <>
      <div className="max-w-3xl mx-auto py-10">
        {/* Page title */}
        <h1 className="text-3xl font-semibold mb-6">Personal info</h1>
        {changesSaved && <div className="mb-4 text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2">Changes saved.</div>}
        {/* The entire profile form. Each row is editable. */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mx-6">
            {/* Profile Image (avatar URL) */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-lg font-medium">Profile Image</h2>
                {editField === 'avatar' ? (
                  <input type="text" name="avatar" value={fieldValues.avatar} onChange={handleChange} className="form-control" />
                ) : profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="h-16 w-16 rounded-full border border-gray-300" />
                ) : (
                  <div className="h-16 w-16 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <div className="flex flex-row gap-x-3">
                <>
                  <button type="submit" className={`text-blue-500 hover:underline ${editField === 'avatar' ? '' : 'hidden'}`}>
                    Save
                  </button>
                  <button type="button" onClick={() => handleEditClick(null)} className={`text-blue-500 hover:underline ${editField === 'avatar' ? '' : 'hidden'}`}>
                    Close
                  </button>
                  <button type="button" onClick={() => handleEditClick('avatar')} className={`text-blue-500 hover:underline ${editField === 'avatar' ? 'hidden' : ''}`}>
                    Edit
                  </button>
                </>
              </div>
            </div>
            {/* Name */}
            <EditableField label="Name" field="name" editField={editField} fieldValues={fieldValues} profile={profile} handleChange={handleChange} handleEditClick={handleEditClick} />
            {/* Email */}
            <EditableField label="Email" field="email" editField={editField} fieldValues={fieldValues} profile={profile} handleChange={handleChange} handleEditClick={handleEditClick} />
            {/* Calorie Goal */}
            <EditableField label="Calorie Goal" field="calorieGoal" editField={editField} fieldValues={fieldValues} profile={profile} handleChange={handleChange} handleEditClick={handleEditClick} />
            {/* Protein Goal */}
            <EditableField label="Protein Goal" field="proteingoal" editField={editField} fieldValues={fieldValues} profile={profile} handleChange={handleChange} handleEditClick={handleEditClick} />
            {/* Carbohydrate Goal */}
            <EditableField label="Carbohydrate Goal" field="carbgoal" editField={editField} fieldValues={fieldValues} profile={profile} handleChange={handleChange} handleEditClick={handleEditClick} />
            {/* Fat Goal */}
            <EditableField label="Fat Goal" field="fatgoal" editField={editField} fieldValues={fieldValues} profile={profile} handleChange={handleChange} handleEditClick={handleEditClick} />
          </div>
        </form>
        <div className="flex justify-end max-w-3xl mx-auto mt-2 border-gray-300 pt-6">
          <button onClick={() => setShowDelete(true)} className="border-1 border-red-500 text-black px-2 py-1 rounded hover:bg-red-300 text-sm">
            Delete Account
          </button>

          {showDelete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-white p-6 rounded shadow-md w-80">
                <h3 className="text-lg font-semibold mb-3 text-red-600">Confirm Deletion</h3>
                <p className="text-sm mb-3 text-gray-700">
                  Type <span className="font-bold">&quot;Delete account for {profile.name}&quot;</span> to confirm.
                </p>
                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="border rounded w-full p-2 mb-4" placeholder="Type here..." />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowDelete(false)} className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== `Delete account for ${profile.name}`}
                    className={`px-3 py-1 rounded text-white ${confirmText === `Delete account for ${profile.name}` ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400'}`}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

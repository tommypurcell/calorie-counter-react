import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
// Supabase client for talking to our database and auth
import { supabase } from '../supabase'

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
    calorieGoal: ''
  })

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
      await supabase.from('profiles').upsert(
        { id: user.id, email: user.email || '' },
        { onConflict: 'id' }
      )

      // 3) Get the profile fields we care about
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar, name, email, calorieGoal')
        .eq('id', user.id)
        .single()

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
        calorieGoal: data?.calorieGoal ?? ''
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
        avatar: fieldValues.avatar,
        name: fieldValues.name,
        email: fieldValues.email,
        calorieGoal: fieldValues.calorieGoal === '' ? null : Number(fieldValues.calorieGoal)
      }

      // Update the 'profiles' table for this user
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', userId)

      if (error) {
        console.error('Error updating profile:', error.message)
        return
      }

      // Show a success message and reflect the new data immediately in the UI
      setChangesSaved(true)
      setEditField(null)
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
        {changesSaved && (
          <div className="mb-4 text-green-700 bg-green-100 border border-green-200 rounded px-3 py-2">
            Changes saved.
          </div>
        )}
        {/* The entire profile form. Each row is editable. */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-lg font-medium">Name</h2>
                {editField === 'name' ? (
                  <input type="text" name="name" value={fieldValues.name} onChange={handleChange} className="form-control" />
                ) : profile.name ? (
                  <div>{editField === 'name' ? <input type="text" name="name" value={fieldValues.name} onChange={handleChange} className="form-control" /> : <p className="text-gray-500">{profile.name || 'Not provided'}</p>}</div>
                ) : (
                  <div className="h-16 w-16 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <div className="flex flex-row gap-x-3">
                <>
                  <button type="submit" className={`text-blue-500 hover:underline ${editField === 'name' ? '' : 'hidden'}`}>
                    Save
                  </button>
                  <button type="button" onClick={() => handleEditClick(null)} className={`text-blue-500 hover:underline ${editField === 'name' ? '' : 'hidden'}`}>
                    Close
                  </button>
                  <button type="button" onClick={() => handleEditClick('name')} className={`text-blue-500 hover:underline ${editField === 'name' ? 'hidden' : ''}`}>
                    Edit
                  </button>
                </>
              </div>
            </div>
            {/* Email */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-lg font-medium">Email Address</h2>
                {editField === 'email' ? (
                  <input type="text" name="email" value={fieldValues.email} onChange={handleChange} className="form-control" />
                ) : profile.email ? (
                  <div>{editField === 'email' ? <input type="text" name="email" value={fieldValues.email} onChange={handleChange} className="form-control" /> : <p className="text-gray-500">{profile.email || 'Not provided'}</p>}</div>
                ) : (
                  <div className="h-16 w-16 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <div className="flex flex-row gap-x-3">
                <>
                  <button type="submit" className={`text-blue-500 hover:underline ${editField === 'email' ? '' : 'hidden'}`}>
                    Save
                  </button>
                  <button type="button" onClick={() => handleEditClick(null)} className={`text-blue-500 hover:underline ${editField === 'email' ? '' : 'hidden'}`}>
                    Close
                  </button>
                  <button type="button" onClick={() => handleEditClick('email')} className={`text-blue-500 hover:underline ${editField === 'email' ? 'hidden' : ''}`}>
                    Edit
                  </button>
                </>
              </div>
            </div>
            {/* Calorie Goal */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-lg font-medium">Calorie Goal</h2>
                {editField === 'calorieGoal' ? <input type="number" name="calorieGoal" value={fieldValues.calorieGoal} onChange={handleChange} className="form-control" /> : <p className="text-gray-500">{profile.calorieGoal || 'Not provided'}</p>}
              </div>
              <div className="flex flex-row gap-x-3">
                <>
                  <button type="submit" className={`text-blue-500 hover:underline ${editField === 'calorieGoal' ? '' : 'hidden'}`}>
                    Save
                  </button>
                  <button type="button" onClick={() => handleEditClick(null)} className={`text-blue-500 hover:underline ${editField === 'calorieGoal' ? '' : 'hidden'}`}>
                    Close
                  </button>
                  <button type="button" onClick={() => handleEditClick('calorieGoal')} className={`text-blue-500 hover:underline ${editField === 'calorieGoal' ? 'hidden' : ''}`}>
                    Edit
                  </button>
                </>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'

axios.defaults.withCredentials = true

const local_url = process.env.REACT_APP_LOCAL_URL
const render_url = process.env.REACT_APP_RENDER_USA_URL

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({})
  const [editField, setEditField] = useState(null)
  const [changesSaved, setChangesSaved] = useState(false)
  const [fieldValues, setFieldValues] = useState({
    avatar: '',
    name: '',
    email: '',
    calorieGoal: ''
  })

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get(`${render_url}/profile`, { withCredentials: true })
        setProfile(response.data)
        setFieldValues({
          avatar: response.data.avatar || '',
          name: response.data.name || '',
          email: response.data.email || '',
          calorieGoal: response.data.calorieGoal || ''
        })
      } catch (error) {
        console.error('Error fetching profile:', error.message)
      }
    }
    getProfile()
  }, [])

  const handleEditClick = (field) => {
    if (editField === field) {
      setEditField(null)
    } else {
      setEditField(field)
    }
  }

  const handleChange = (e) => {
    setFieldValues({
      ...fieldValues,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updatedProfile = { ...fieldValues }
      await axios.patch(`${render_url}/profile`, updatedProfile)
      setChangesSaved(true)
      setEditField(null)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile:', error.message)
    }
  }

  return (
    <>
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-6">Personal info</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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

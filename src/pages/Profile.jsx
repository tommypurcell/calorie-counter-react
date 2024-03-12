import Nav from '../components/Nav'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-singapore.onrender.com'
let local_url = 'http://localhost:4100'

export default function Profile() {
  // create state variable for user
  const [user, setUser] = useState({})
  const [profile, setProfile] = useState({})
  const [changesSaved, setChangesSaved] = useState(false)

  const getProfile = async () => {
    try {
      const response = await axios.get(`${render_url}/profile`, {
        withCredentials: true // Include credentials in the request
      })
      console.log('Response:', response)
      setProfile(response.data)
    } catch (error) {
      alert(error.message)
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    let form = new FormData(e.target)
    let formObject = Object.fromEntries(form.entries())
    setChangesSaved(true)
    await saveProfile(formObject)

    // Redirect or perform any other actions after saving profile
  }

  const saveProfile = async (profile) => {
    try {
      const updatedProfile = { id: profile._id }
      if (profile.name) {
        updatedProfile.name = profile.name
      }
      if (profile.avatar) {
        updatedProfile.avatar = profile.avatar
      }
      console.log(updatedProfile)
      await axios.patch(`${render_url}/profile`, updatedProfile)
      setChangesSaved(false)
    } catch (err) {
      console.error('Error fetching profile:', err.message)
    }
    return null
  }

  useEffect(() => {
    getProfile()
  }, [])

  return (
    <>
      {!changesSaved ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <form onSubmit={(e) => handleSubmit(e)} className="w-75">
            <div className="container p-5">
              {profile.avatar ? <img src={profile.avatar} alt="" className="rounded-circle border border-2 border-dark" style={{ height: '150px', width: '150px' }} /> : null}
              <h2>Edit Profile</h2>
              <ul>
                <li>{profile.name}</li>
                <li>{profile.email}</li>
              </ul>
              <div className="mt-3">
                <span>Name</span>
                <input type="text" className="form-control text-start" placeholder={`${profile.name}`} name="name" />
              </div>
              <div className="mt-3">
                <span>Bio</span>
                <div>
                  <textarea className="form-control" style={{ height: 150 }} defaultValue={''} placeholder="Write a catchy bio here..." name="description" />
                </div>
              </div>
              <div className="mt-3">
                <span>Add Avatar Photo</span>
                <input type="text" className="form-control mt-1 text-start" placeholder="https://..." name="avatar" />
              </div>
            </div>
            <button type="submit">Submit Profile </button>
          </form>
        </div>
      ) : (
        <p>lodaing...</p>
      )}
    </>
  )
}

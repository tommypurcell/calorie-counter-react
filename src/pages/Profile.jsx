import Nav from '../components/Nav'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-portalversion.onrender.com'
let local_url = 'http://localhost:4000'

export default function Profile() {
  // create state variable for user
  const [user, setUser] = useState({})
  const [profile, setProfile] = useState({})

  // define houses
  const [houses, setHouses] = useState([])

  // navigate
  const navigate = useNavigate()

  const getProfile = async () => {
    try {
      let profile = await axios.get(`${local_url}/profile`, {
        withCredentials: true
      })
      console.log(profile.data)
      setProfile(profile.data)
    } catch (err) {
      console.error('Error fetching profile:', err.message)
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    return null
  }

  return (
    <>
      <Nav />
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div>
          <button className="h-50 w-100" onClick={getProfile}>
            Get Profile
          </button>
          <ul>
            <li>id: {profile._id}</li>
            <li>name: {profile.name}</li>
            <li>email: {profile.email}</li>
            <li>avatar: {profile.avatar}</li>
          </ul>
        </div>
        <form onSubmit={(e) => saveProfile(e)} className="w-75">
          <div className="container p-5">
            <h2>Edit Profile</h2>
            <div className="mt-3">
              <span>Name</span>
              <input type="text" className="form-control text-start" placeholder={`${profile.name}`} name="name" />
            </div>
            <div className="mt-3">
              <span>Bio</span>
              <div>
                <textarea
                  className="form-control"
                  style={{ height: 150 }}
                  defaultValue={''}
                  placeholder="Write a catchy bio here..."
                  name="description"
                />
              </div>
            </div>
            <div className="mt-3">
              <span>Add Avatar Photo</span>
              <input type="text" className="form-control mt-1 text-start" placeholder="https://..." name="photo1" />

              <div></div>
              <button type="submit" className="saveEdits btn btn-success mt-3">
                Save Changes
              </button>
            </div>
            <div>
              <button type="submit" className="deleteEdits btn btn-danger mt-3">
                Delete
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

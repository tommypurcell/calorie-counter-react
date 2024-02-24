import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-portalversion.onrender.com'
let local_url = 'http://localhost:4000'

export default function Nav() {
  const navigate = useNavigate()

  const [loggedIn, setLoggedIn] = useState(false)

  // check if user is logged in
  const checkLogin = async () => {
    let user = await axios.get(`${render_url}/profile`)
    if (user.data !== 'Not authorized') {
      setLoggedIn(true)
    } else {
      setLoggedIn(false)
    }
  }

  const requestLogout = async (e) => {
    e.preventDefault()
    let userToLogout = await axios.get(`${render_url}/logout`)
    console.log(userToLogout.data)
    navigate('/login')
  }

  useEffect(() => {
    checkLogin()
  }, [])

  return (
    <>
      {/* nav bar */}
      <nav className="logo-bar container">
        <div className="d-flex flex-column flex-md-row nav-div">
          <Link to="/calorie-counter" className="m-2 w-100 text-center nav-button">
            Calorie Counter
          </Link>
          <Link to="/foodlog" className="m-2 w-100 text-center nav-button">
            Food Log
          </Link>
          <Link to="/meal-plan-generator" className="m-2 w-100 text-center nav-button">
            Meal Plan Generator
          </Link>
          <Link to="/stats" className="m-2 w-100 text-center nav-button">
            Stats
          </Link>
          <Link to="/profile" className='m-2 w-100 text-center nav-button '>Profile</Link>
          {loggedIn ? (
            <a
              onClick={(e) => requestLogout(e)}
              type="submit"
              className="btn btn-outline-secondary m-2 w-100 text-center nav-button"
              style={{ height: 44, marginLeft: 5 }}
            >
              Logout
            </a>
          ) : (
            <a
              href="/login"
              className="btn btn-outline-secondary m-2 w-100 text-center nav-button"
              style={{ height: 44, marginLeft: 5 }}
            >
              Login
            </a>
          )}
        </div>
      </nav>
    </>
  )
}

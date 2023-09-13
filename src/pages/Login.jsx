import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
axios.defaults.withCredentials = true

let render_url = 'https://calorie-counter-api-portalversion.onrender.com'
let local_url = 'http://localhost:4000'

export default function Login() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')
  const [loginAttempt, setLoginAttempt] = useState(false)

  const requestLogin = async (e) => {
    e.preventDefault()
    setLoginAttempt(true)

    let loginAccount = await axios.post(
      `${render_url}/login`,
      {
        email: e.target.email.value,
        password: e.target.password.value,
      },
      { withCredentials: true } // This is necessary to receive and send cookies
    )

    console.log(loginAccount.data)
    if (
      loginAccount.data !==
      'Cannot login: User does not exist. Please sign up instead.'
    ) {
      navigate('/calorie-counter')
    } else {
      setErrorMsg(loginAccount.data)
    }
  }

  return (
    <>
      <div className="login-card card align-items-center position-absolute top-50 start-50 translate-middle w-50 h-auto p-5">
        <form onSubmit={(e) => requestLogin(e)}>
          {loginAttempt && !errorMsg ? (
            <h1>Logging in. Please Wait...</h1>
          ) : (
            <div className="card-body container">
              <h4 className="text-danger">{errorMsg}</h4>
              <label>Email</label>
              <input
                name="email"
                type="email"
                className="border rounded form-control"
                required={true}
              />
              <label>Password</label>
              <input
                type="password"
                className="border rounded form-control"
                required={true}
                name="password"
              />
              <button
                type="submit"
                className="login-button btn btn-success mt-3"
              >
                Login
              </button>
              <div>
                <span>
                  New to Calorie Counter?{' '}
                  <Link to="/signup" className="signup-link">
                    Signup
                  </Link>
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}

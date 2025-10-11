import React from 'react'
import axios from 'axios'
import Nav from '../components/Nav'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

axios.defaults.withCredentials = true
// using edamam instead of spoonacular
// https://developer.edamam.com/edamam-docs-nutrition-api

let render_url = 'https://calorie-counter-api-portalversion.onrender.com'
let local_url = 'http://localhost:4000'

export default function LandingPage() {
  const healthfoodimg = process.env.PUBLIC_URL + '/images/healthfoodimg.jpg'
  const blobUrl = process.env.PUBLIC_URL + '/images/blob.svg'
  return (
    <>
      {/* Add the link tag to include the CSS file */}
      <link rel="stylesheet" href={process.env.PUBLIC_URL + '/styles/landingpage.css'} />
      <section>
        <div className="container">
          <div className="row">
            <div className="col">
              <h1 className="text-center">Welcome to Calorie Counter</h1>
              <h4>a simple app to track your calories.</h4>
              <div className="login">
                <img className="healthfoodimg" src={healthfoodimg} alt="" />
                <h4>start by signing up or loggin in</h4>
              </div>
              <div className="buttons">
                <Link to="/signup" className="m-2">
                  Sign Up
                </Link>
                <Link to="/login" className="m-2">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

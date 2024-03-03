/* eslint-disable react/prop-types */

import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav'

import { Link } from 'react-router-dom'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faCoffee, faPen } from '@fortawesome/free-solid-svg-icons'

function Facebook() {
  const numberOfCards = 3
  const cards = [...new Array(numberOfCards)]

  return (
    <div className="container mx-auto p-4">
      <div className="grid">
        <div className="row row-cols-3 g-4">
          {cards.map((card, index) => (
            <div key={index} className="col">
              <Card2 />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center h-20 mt-10 pt-10 border-t border-gray-100"></div>
    </div>
  )
}

export default Facebook

function User(props) {
  console.log(props.username)
  const { username, age, isLoggedIn } = props

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        {username}
        <div className="w-8 h-8 rounded-full bg-white overflow-hidden border-0 border-solid border-white">
          <img src="https://avatars.githubusercontent.com/u/4212467?v=4" alt="user" />
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex gap-1">
        <Link to="/login">Login</Link>
        <div> | </div>
        <Link to="/register">Sign Up</Link>
      </div>
    )
  }
}

function Card2() {
  return (
    <>
      <div className="card" aria-hidden="true" style={{ height: '70vh' }}>
        <img src="..." className="card-img-top" alt="..." />
        <div className="card-body">
          <h5 className="card-title placeholder-glow">
            <span className="placeholder col-6" />
          </h5>
          <p className="card-text placeholder-glow">
            <span className="placeholder col-7" />
            <span className="placeholder col-4" />
            <span className="placeholder col-4" />
            <span className="placeholder col-6" />
            <span className="placeholder col-8" />
          </p>
          <a href="#" tabIndex={-1} className="btn btn-primary disabled placeholder col-6" />
        </div>
      </div>
    </>
  )
}

function Card() {
  return (
    <div role="status" className="border border-gray-300 p-4 rounded-md shadow-md">
      <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded mb-4">{/* <img src="https://placekitten.com/200/200" alt="kitten" /> */}</div>
      <div>
        <div className="h-3 bg-gray-200 rounded-full max-w-[70%] mb-4"></div>
        <div className="h-3 bg-gray-200 rounded-full max-w-[80%] mb-2.5"></div>
        <div className="h-3 bg-gray-200 rounded-full mb-2.5"></div>
        <div className="h-3 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
        <div className="h-3 bg-gray-200 rounded-full max-w-[460px] mb-2.5"></div>
        <div className="h-3 bg-gray-200 rounded-full max-w-[360px]"></div>
      </div>
    </div>
  )
}

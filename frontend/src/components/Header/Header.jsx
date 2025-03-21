import React from 'react'
import './Header.css'
import logo from '../../assets/soen_logo.png'
import { useState } from 'react';
import {useSelector} from 'react-redux'
import { Link } from 'react-router-dom';

function Header() {

  return (
    <div className='header'>
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div className="header-title">
        <h1>AI Content Creator</h1>
      </div>
    </div>
  )
}

export default Header
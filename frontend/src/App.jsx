import React from 'react'
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'
import Home from "./pages/Home/Home"
import { Provider } from 'react-redux'
import store from './store'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState } from 'react'
import Header from './components/Header/Header'


function App() {


  return (
    <Provider store={store}>
    <Router>
    <div className="top-Header">
        <Header/>
    </div>
        <div className="main-container">
        <ToastContainer position="top-right" autoClose={2000} />     
          <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
        </div>
    </Router>
    </Provider>
  )
}

export default App
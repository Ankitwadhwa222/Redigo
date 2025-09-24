import { useState } from 'react'
import './App.css'
import SearchRides from './pages/SearchRides'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PublishRide from './pages/addRide'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import SignEmail from './pages/SignEmail'
import ProtectedRoutes from './components/ProtectedRoutes'

function App() {
  

  return (
    <>
     <BrowserRouter>
      <Routes>
 
        <Route path="/" element={<Dashboard />} />
        <Route path="/search-rides" element={<SearchRides />} />
        <Route path="/add-ride" element={
          <ProtectedRoutes>
            <PublishRide />
          </ProtectedRoutes>
        } />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin/email" element={<SignEmail />} />
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App

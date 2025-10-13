 
import './App.css'
import SearchRides from './pages/SearchRides'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PublishRide from './pages/addRide'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import SignEmail from './pages/SignEmail'
import ProtectedRoutes from './components/ProtectedRoutes'
import DashboardPage from './pages/UserDashBoard'
import ChatTest from './pages/RideChat'
import Messages from './pages/Messages'
 
import LiveMap from './pages/LiveMap'
import PaymentPage from './pages/Payment'

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
        <Route path="/user/dashboard" element={
          <ProtectedRoutes>
            <DashboardPage />
          </ProtectedRoutes>
        } />

        <Route path = "/user/rides/edit-ride/:rideId" element={
          <ProtectedRoutes>
            <PublishRide />
          </ProtectedRoutes>
        } />
      <Route path = "/ride-chat/:rideId" element={<ChatTest />} />
      <Route path = "/messages" element={<Messages />} />
      <Route path = "/ride/:rideId/chat" element={<ChatTest />} />

      <Route path="/ride/:rideId/tracking" element={
        <ProtectedRoutes>
          <LiveMap/>
        </ProtectedRoutes>
      } />
      <Route path = "/checkout/:rideId" element = {
        <ProtectedRoutes>
          <PaymentPage/>
        </ProtectedRoutes>
      } />

      </Routes>
      
     </BrowserRouter>
    </>
  )
}

export default App

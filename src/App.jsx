import { Routes, Route, useNavigate } from "react-router-dom"
import {supabase} from "./lib/supabase"
import Register from "./pages/register"
import Login from "./pages/login"
import ProtectedRoute from "./pages/protectedroute"
import "./pages/style/dashboard.css"

function Dashboard() {
  const navigate = useNavigate()
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/login")
    } catch (error) {
      console.error("Error logging out:", error.message)
    }
  }
  return (
    <>
      <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
    </>
  )
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
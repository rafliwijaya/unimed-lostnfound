import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import "./style/dashboard.css"

export default function Dashboard() {
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
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <button onClick={handleLogout} className="btn-logout">
        Logout
      </button>
    </div>
  )
}
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let timeout
    const IDLE_TIMEOUT = 60 * 1000 // 🔥 1 MENIT (TESTING)

    const resetTimer = () => {
      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = "/login"
      }, IDLE_TIMEOUT)
    }

    // Event aktivitas user
    window.addEventListener("mousemove", resetTimer)
    window.addEventListener("keydown", resetTimer)
    window.addEventListener("click", resetTimer)
    window.addEventListener("scroll", resetTimer)

    resetTimer()

    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    getSession()

    return () => {
      clearTimeout(timeout)
      window.removeEventListener("mousemove", resetTimer)
      window.removeEventListener("keydown", resetTimer)
      window.removeEventListener("click", resetTimer)
      window.removeEventListener("scroll", resetTimer)
    }
  }, [])

  if (loading) return <p>Loading...</p>

  if (!session) return <Navigate to="/login" />

  return children
}
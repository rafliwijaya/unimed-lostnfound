import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!email.endsWith("@mhs.unimed.ac.id")) {
      setError("Gunakan email kampus (@mhs.unimed.ac.id)")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          phone: phone
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    if (!user) {
      setError("User tidak ditemukan")
      setLoading(false)
      return
    }


    const { error: insertError } = await supabase.from("users").insert([{
      id: user.id,
      full_name: name,
      phone: phone,
      role: "user",
    }])

    if (insertError) {
      alert(insertError.message)
    } else {
      alert("Register berhasil!")
    }

    navigate("/login")
  }

  return (
    <div className="login-root">
      <div className="login-card">

        <div className="login-eyebrow">
          <span className="login-eyebrow-dot" />
          Portal Kampus
        </div>

        <h1 className="login-title">Selamat <span>Datang</span></h1>
        <p className="login-subtitle">Daftar menggunakan akun <span>Unimed</span> anda</p>
        {error && (
          <div className="login-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            {error}
          </div>
        )}

        

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <br /><br />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <br /><br />

          <input
            type="email"
            placeholder="Email @univ.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <br /><br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <br /><br />

          <button onClick={() => navigate("/login")}>
            Sudah punya akun?
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  )
}
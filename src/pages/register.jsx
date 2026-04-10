import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import "./style/login.css"

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
        <p className="login-subtitle">Silakan daftar menggunakan akun <span>Unimed</span> anda</p>
        {error && (
          <div className="login-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>

          <label className="login-label" htmlFor="name">Nama Lengkap</label>
          <div className="login-field">
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <span className="login-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          </div>

          <label className="login-label" htmlFor="phone">Nomor Telepon/Whatsapp</label>
          <div className="login-field">
            <input
              type="tel"
              placeholder="Nomor Telepon/Whatsapp"
              className="login-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span className="login-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </span>
          </div>

          <label className="login-label" htmlFor="email">Email</label>
          <div className="login-field">
            <input
              type="email"
              placeholder="Email@mhs.unimed.ac.id"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="login-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
          </div>

          <label className="login-label" htmlFor="password">Kata Sandi</label>
          <div className="login-field">
            <input
              type="password"
              placeholder="Kata Sandi"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="login-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          </div>

            <button type="submit" className="login-btn" disabled={loading}>
              <span className="login-btn-inner">
                {loading && <span className="login-spinner" />}
                {loading ? "Loading..." : "Daftar"}
              </span>
            </button>

            <br /><br />

            <p className="login-register">
              Sudah punya akun?{" "}
              <span
                className="login-register-link"
                onClick={() => navigate("/login")}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
              >
                Masuk
              </span>
            </p>

            <div className="login-badge">
              <span className="login-badge-dot" />
              Universitas Negeri Medan
              <span className="login-badge-dot" />
            </div>
            
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  )
}
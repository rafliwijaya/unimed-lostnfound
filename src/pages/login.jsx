import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import "./style/login.css"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate("/dashboard")
  }

  return (
    <div className="login-root">
      <div className="login-card">

        {/* Header */}
        <div className="login-eyebrow">
          <span className="login-eyebrow-dot" />
          Portal Kampus
        </div>

        <h1 className="login-title">
          Selamat<br />
          <span>Datang</span> Kembali
        </h1>

        <p className="login-subtitle">
          Masuk ke akun Unimed Lost &amp; Found kamu
        </p>

        {/* Error */}
        {error && (
          <div className="login-error">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="login-field">
            <label className="login-label" htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="nama@unimed.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            <span className="login-btn-inner">
              {loading && <span className="login-spinner" />}
              {loading ? "Memproses..." : "Masuk"}
            </span>
          </button>

        </form>

        {/* dvider */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">atau</span>
          <div className="login-divider-line" />
        </div>

        <p className="login-register">
          Belum punya akun?{" "}
          <span
            className="login-register-link"
            onClick={() => navigate("/register")}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/register")}
          >
            Daftar sekarang
          </span>
        </p>

        <div className="login-badge">
          <span className="login-badge-dot" />
          Universitas Negeri Medan
          <span className="login-badge-dot" />
        </div>

      </div>
    </div>
  )
}
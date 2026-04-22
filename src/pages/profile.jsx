import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import "./style/profile.css"
import "boxicons/css/boxicons.min.css"

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullName, setFullName] = useState("")

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const closeSidebar = () => setSidebarOpen(false)

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate("/login"); return }

    const { data, error } = await supabase
      .from("users")
      .select("full_name, phone")
      .eq("id", user.id)
      .single()

    if (error) {
      setErrorMsg("Gagal memuat profil: " + error.message)
    } else {
      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        email: user.email || "",
      })
    }
    setLoading(false)
  }

  useEffect(() => { fetchProfile() }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg("")
    setErrorMsg("")

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("users")
      .update({
        full_name: form.full_name,
        phone: form.phone,
      })
      .eq("id", user.id)

    if (error) {
      setErrorMsg("Gagal menyimpan: " + error.message)
    } else {
      setFullName(form.full_name)
      setSuccessMsg("Profil berhasil diperbarui!")
      setTimeout(() => setSuccessMsg(""), 3000)
    }
    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (passwordForm.newPassword.length < 6) {
      setErrorMsg("Password minimal 6 karakter.")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.")
      return
    }

    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    })

    if (error) {
      setErrorMsg("Gagal ubah password: " + error.message)
    } else {
      setSuccessMsg("Password berhasil diubah!")
      setPasswordForm({ newPassword: "", confirmPassword: "" })
      setShowPasswordSection(false)
      setTimeout(() => setSuccessMsg(""), 3000)
    }
    setChangingPassword(false)
  }

  const getInitials = (name) => {
    if (!name) return "?"
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <i className="bx bx-loader-alt bx-spin"></i>
        <span>Memuat profil...</span>
      </div>
    )
  }

  return (
    <div className="profile-page">

      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className={`bx ${sidebarOpen ? "bx-x" : "bx-menu"}`}></i>
      </button>

      {/* ← Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {/* ← Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          UNIMED <span>Lost</span> & <span>Found</span>
        </div>

        <div className="sidebar-profile" onClick={() => { navigate("/profile"); closeSidebar() }}>
          <div className="sidebar-avatar">
            <i className="bx bx-user"></i>
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{fullName}</div>
            <div className="sidebar-profile-label">Lihat Profil</div>
          </div>
        </div>

        <hr className="sidebar-divider" />

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => { navigate("/dashboard"); closeSidebar() }}>
            <i className="bx bx-home-alt-2"></i>
            Beranda
          </button>
          <button
            className={`sidebar-nav-item ${location.pathname === "/posts" ? "active" : ""}`}
            onClick={() => { navigate("/posts"); closeSidebar() }}>
            <i className="bx bx-collection"></i>
            Post Barang
          </button>
          <button
            className={`sidebar-nav-item ${location.pathname === "/notification" ? "active" : ""}`}
            onClick={() => { navigate("/notification"); closeSidebar() }}>
            <i className="bx bx-bell"></i>
            Notifikasi
          </button>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="bx bx-log-out"></i>
          Keluar
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="profile-container">
          {/* Avatar & nama */}
          <div className="profile-hero">
            <div className="sidebar-avatar">
              <i className="bx bx-user"></i>
            </div>
            <div className="profile-hero-info">
              <h1>{form.full_name || "Pengguna"}</h1>
              <p>{form.email}</p>
            </div>
          </div>

          {/* Notifikasi */}
          {successMsg && (
            <div className="profile-alert profile-alert-success">
              <i className="bx bx-check-circle"></i>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="profile-alert profile-alert-error">
              <i className="bx bx-error-circle"></i>
              {errorMsg}
            </div>
          )}

          {/* Form profil */}
          <div className="profile-card">
            <div className="profile-card-header">
              <i className="bx bx-user-circle"></i>
              <h2>Informasi Profil</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">

              <div className="form-group">
                <label htmlFor="full_name">Nama Lengkap</label>
                <div className="input-wrapper">
                  <i className="bx bx-user"></i>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Nama lengkap kamu"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Nomor HP</label>
                <div className="input-wrapper">
                  <i className="bx bx-phone"></i>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper input-disabled">
                  <i className="bx bx-envelope"></i>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    disabled
                  />
                </div>
                <span className="form-hint">Email tidak dapat diubah</span>
              </div>

              <button type="submit" className="btn-save-profile" disabled={saving}>
                {saving ? (
                  <><i className="bx bx-loader-alt bx-spin"></i> Menyimpan...</>
                ) : (
                  <>Simpan Perubahan</>
                )}
              </button>

            </form>
          </div>

          {/* Section ganti password */}
          <div className="profile-card">
            <div
              className="profile-card-header profile-card-header-clickable"
              onClick={() => {
                setShowPasswordSection(!showPasswordSection)
                setErrorMsg("")
                setSuccessMsg("")
              }}>
              <div className="profile-card-header-left">
                <i className="bx bx-lock-alt"></i>
                <h2>Ganti Password</h2>
              </div>
              <i className={`bx ${showPasswordSection ? "bx-chevron-up" : "bx-chevron-down"} profile-chevron`}></i>
            </div>

            {showPasswordSection && (
              <form onSubmit={handleChangePassword} className="profile-form">

                <div className="form-group">
                  <label htmlFor="newPassword">Password Baru</label>
                  <div className="input-wrapper">
                    <i className="bx bx-lock"></i>
                    <input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNew(!showNew)}>
                      <i className={`bx ${showNew ? "bx-hide" : "bx-show"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Konfirmasi Password</label>
                  <div className="input-wrapper">
                    <i className="bx bx-lock-open"></i>
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirm(!showConfirm)}>
                      <i className={`bx ${showConfirm ? "bx-hide" : "bx-show"}`}></i>
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-save-profile btn-password" disabled={changingPassword}>
                  {changingPassword ? (
                    <><i className="bx bx-loader-alt bx-spin"></i> Mengubah...</>
                  ) : (
                    <>Ubah Password</>
                  )}
                </button>

              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
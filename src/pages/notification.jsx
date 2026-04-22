import { use, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import "./style/notification.css"
import "boxicons/css/boxicons.min.css"

// ── KMP Algorithm ─────────────────────────────────────────
function buildKMPTable(pattern) {
  const table = [0]
  let prefix = 0, i = 1
  while (i < pattern.length) {
    if (pattern[i] === pattern[prefix]) { prefix++; table[i] = prefix; i++ }
    else if (prefix !== 0) { prefix = table[prefix - 1] }
    else { table[i] = 0; i++ }
  }
  return table
}

function kmpSearch(text, pattern) {
  if (!pattern || pattern.length === 0) return false
  const t = text.toLowerCase(), p = pattern.toLowerCase()
  const table = buildKMPTable(p)
  let ti = 0, pi = 0
  while (ti < t.length) {
    if (t[ti] === p[pi]) { ti++; pi++; if (pi === p.length) return true }
    else if (pi !== 0) { pi = table[pi - 1] }
    else { ti++ }
  }
  return false
}

const STOPWORDS = new Set([
  "yang","dan","di","ke","dari","ada","ini","itu","dengan","untuk","pada",
  "atau","juga","sudah","saya","nya","aku","kamu","dia","kami","kita",
  "tidak","bisa","the","and","for","with","this","that","has","was","sebuah",
  "sebuah","milik","punya","saat","ketika","karena","jika","agar","supaya"
])

function extractKeywords(text) {
  if (!text) return []
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOPWORDS.has(w))
  // Deduplikasi
  return [...new Set(words)]
}

function getMatchedKeywords(lostPost, foundPost) {
  const lostText = [lostPost.title, lostPost.description, lostPost.location, lostPost.category]
    .filter(Boolean).join(" ")
  const foundText = [foundPost.title, foundPost.description, foundPost.location, foundPost.category]
    .filter(Boolean).join(" ")

  const keywords = extractKeywords(lostText)
  const matched = []
  for (const kw of keywords) {
    if (kmpSearch(foundText, kw) && !matched.includes(kw)) matched.push(kw)
  }
  return matched
}

// ── Komponen ───────────────────────────────────────────────
export default function Notification() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [expanded, setExpanded] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullName, setFullName] = useState("")

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single()
      if (data) setFullName(data.full_name)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const closeSidebar = () => setSidebarOpen(false)

  const runMatching = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate("/login"); return }

    const { data: myLostPosts } = await supabase
      .from("posts").select("*")
      .eq("user_id", user.id)
      .ilike("type", "%Kehilangan%")

    const { data: otherFoundPosts } = await supabase
      .from("posts").select("*, users(full_name)")
      .neq("user_id", user.id)
      .ilike("type", "%Ditemukan%")

    if (!myLostPosts?.length || !otherFoundPosts?.length) {
      setNotifications([])
      setLoading(false)
      return
    }

    const results = []
    for (const lostPost of myLostPosts) {
      for (const foundPost of otherFoundPosts) {
        const matchedKeywords = getMatchedKeywords(lostPost, foundPost)
        if (matchedKeywords.length >= 1) {
          results.push({
            id: `${lostPost.id}-${foundPost.id}`,
            lostPost, foundPost, matchedKeywords,
            score: matchedKeywords.length,
          })
        }
      }
    }

    results.sort((a, b) => b.score - a.score)
    setNotifications(results)
    setLoading(false)
  }

  useEffect(() => { 
    runMatching()
    fetchUserData()
  }, [])

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const getScoreInfo = (score) => {
    if (score >= 5) return { label: "Sangat Mirip", cls: "high", icon: "bx-radar" }
    if (score >= 3) return { label: "Cukup Mirip", cls: "mid", icon: "bx-search-alt" }
    return { label: "Mungkin Cocok", cls: "low", icon: "bx-question-mark" }
  }

  return (
    <div className="notif-page">

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
        <div className="notif-container">

          {/* Header */}
          <div className="notif-header">
            <div className="notif-header-icon">
              <i className="bx bx-bell"></i>
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </div>
            <div className="notif-header-text">
              <h1>Notifikasi</h1>
              <p>Barang yang mungkin mirip dengan yang Anda cari</p>
            </div>
            <button className="notif-refresh" onClick={runMatching} disabled={loading} title="Refresh">
              <i className={`bx bx-refresh ${loading ? "bx-spin" : ""}`}></i>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="notif-state">
              <div className="notif-spinner">
                <i className="bx bx-loader-alt bx-spin"></i>
              </div>
              <p>Menganalisis kecocokan barang...</p>
            </div>

          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">
                <i className="bx bx-bell-off"></i>
              </div>
              <h3>Belum ada kecocokan</h3>
              <p>Notifikasi akan muncul otomatis saat ada post temuan yang cocok dengan barang hilangmu.</p>
            </div>

          ) : (
            <div className="notif-list">
              {notifications.map((n, idx) => {
                const { label, cls, icon } = getScoreInfo(n.score)
                const isOpen = expanded[n.id]

                return (
                  <div
                    key={n.id}
                    className={`notif-card notif-card-${cls}`}
                    style={{ animationDelay: `${idx * 60}ms` }}>

                    {/* Card header — selalu terlihat */}
                    <div className="notif-card-top" onClick={() => toggleExpand(n.id)}>
                      <div className="notif-score-pill">
                        <i className={`bx ${icon}`}></i>
                        {label}
                      </div>

                      <div className="notif-card-titles">
                        <div className="notif-item-row">
                          <span className="notif-type-tag lost">
                            <i className="bx bx-search"></i> Hilang
                          </span>
                          <span className="notif-item-title">{n.lostPost.title}</span>
                        </div>
                        <div className="notif-connector">
                          <i className="bx bx-git-compare"></i>
                        </div>
                        <div className="notif-item-row">
                          <span className="notif-type-tag found">
                            <i className="bx bx-check-circle"></i> Temuan
                          </span>
                          <span className="notif-item-title">{n.foundPost.title}</span>
                        </div>
                      </div>

                      {/* Keywords preview */}
                      <div className="notif-kw-preview">
                        {n.matchedKeywords.slice(0, 3).map(kw => (
                          <span key={kw} className="kw-chip">{kw}</span>
                        ))}
                        {n.matchedKeywords.length > 3 && (
                          <span className="kw-chip kw-more">+{n.matchedKeywords.length - 3}</span>
                        )}
                      </div>

                      <button className="notif-toggle">
                        <i className={`bx ${isOpen ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                      </button>
                    </div>

                    {/* Detail — expand/collapse */}
                    {isOpen && (
                      <div className="notif-card-detail">
                        <div className="notif-detail-grid">

                          {/* Post hilang */}
                          <div className="notif-detail-box notif-detail-lost">
                            <div className="detail-box-label">
                              <i className="bx bx-search-alt"></i>
                              Barang Hilangmu
                            </div>
                            <h4>{n.lostPost.title}</h4>
                            {n.lostPost.description && <p>{n.lostPost.description}</p>}
                            <div className="detail-meta-list">
                              {n.lostPost.location && (
                                <span><i className="bx bx-map-pin"></i>{n.lostPost.location}</span>
                              )}
                              {n.lostPost.category && (
                                <span><i className="bx bx-tag"></i>{n.lostPost.category}</span>
                              )}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="notif-detail-divider">
                            <i className="bx bx-transfer-alt"></i>
                          </div>

                          {/* Post temuan */}
                          <div className="notif-detail-box notif-detail-found">
                            <div className="detail-box-label">
                              <i className="bx bx-check-shield"></i>
                              Ditemukan oleh {n.foundPost.users?.full_name || "seseorang"}
                            </div>
                            <h4>{n.foundPost.title}</h4>
                            {n.foundPost.description && <p>{n.foundPost.description}</p>}
                            <div className="detail-meta-list">
                              {n.foundPost.location && (
                                <span><i className="bx bx-map-pin"></i>{n.foundPost.location}</span>
                              )}
                              {n.foundPost.category && (
                                <span><i className="bx bx-tag"></i>{n.foundPost.category}</span>
                              )}
                            </div>
                            {n.foundPost.image_url && (
                              <img src={n.foundPost.image_url} alt={n.foundPost.title} className="detail-img" />
                            )}
                          </div>

                        </div>

                        {/* Semua matched keywords */}
                        <div className="notif-kw-full">
                          <span className="kw-full-label">
                            <i className="bx bx-purchase-tag-alt"></i>
                            {n.matchedKeywords.length} kata serupa:
                          </span>
                          <div className="kw-full-list">
                            {n.matchedKeywords.map(kw => (
                              <span key={kw} className="kw-chip kw-chip-full">{kw}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
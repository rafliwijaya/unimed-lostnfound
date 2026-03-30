import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useEffect, useState, useRef } from "react"
import "./style/style.css"
import "./style/dashboard.css"
import "boxicons/css/boxicons.min.css"

// fuzzy string mathcing
function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

// Hitung skor kemiripan antara satu token query dan satu token teks.

function tokenScore(queryToken, textToken) {
  if (textToken === queryToken) return 1.0
  if (textToken.includes(queryToken) || queryToken.includes(textToken)) return 0.85
  const maxLen = Math.max(queryToken.length, textToken.length)
  if (maxLen === 0) return 1.0
  const dist = levenshtein(queryToken, textToken)
  const similarity = 1 - dist / maxLen
  return similarity > 0.5 ? similarity * 0.7 : 0
}

function computeScore(query, post) {
  const normalize = (str) =>
    (str || "").toLowerCase().replace(/[^a-z0-9\s]/gi, " ").trim()

  const queryTokens = normalize(query).split(/\s+/).filter(Boolean)
  if (queryTokens.length === 0) return 0

  const fields = [
    { text: normalize(post.description), weight: 0.7 },
    { text: normalize(post.location), weight: 0.3 },
  ]

  let totalScore = 0

  for (const { text, weight } of fields) {
    const textTokens = text.split(/\s+/).filter(Boolean)
    if (textTokens.length === 0) continue

    let fieldScore = 0
    for (const qt of queryTokens) {
      const best = Math.max(...textTokens.map((tt) => tokenScore(qt, tt)))
      fieldScore += best
    }

    totalScore += (fieldScore / queryTokens.length) * weight
  }

  return totalScore
}

// flter dan uruktan posts berdasarkan skor kemiripan dengan query.
function fuzzySearch(query, posts, threshold = 0.35) {
  if (!query.trim()) return posts

  const scored = posts
    .map((post) => ({ post, score: computeScore(query, post) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)

  return scored.map(({ post }) => post)
}


export default function Posts() {
  const navigate = useNavigate()
  const location = useLocation()

  const [allPosts, setAllPosts] = useState([])       // data asli dari Supabase
  const [displayPosts, setDisplayPosts] = useState([]) // data yang ditampilkan
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false) // mode pencarian aktif
  const [searchResultCount, setSearchResultCount] = useState(null)

  const searchInputRef = useRef(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error.message)
    } else {
      setAllPosts(data)
      setDisplayPosts(data)
    }
    setLoading(false)
  }

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, phone")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error(error.message)
      } else {
        setFullName(data.full_name)
        setPhone(data.phone)
      }
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchUserData()
  }, [])

  const handleSearch = () => {
    const query = searchQuery.trim()
    if (!query) {
      handleClearSearch()
      return
    }
    const results = fuzzySearch(query, allPosts)
    setDisplayPosts(results)
    setIsSearching(true)
    setSearchResultCount(results.length)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setDisplayPosts(allPosts)
    setIsSearching(false)
    setSearchResultCount(null)
    searchInputRef.current?.focus()
  }

  // Tekan Enter di input juga trigger pencarian
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch()
    if (e.key === "Escape") handleClearSearch()
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="dashboard-page">

      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className={`bx ${sidebarOpen ? "bx-x" : "bx-menu"}`}></i>
      </button>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="sidebar-logo">
          Unimed <span>Lost</span> & <span>Found</span>
        </div>

        <div
          className="sidebar-profile"
          onClick={() => { navigate("/profil"); closeSidebar() }}
        >
          <div className="sidebar-avatar">
            <i className="bx bx-user"></i>
          </div>
          <div className="sidebar-profile-info" onClick={() => { navigate("/profile") }}>
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
            Dashboard
          </button>

          <button
            className={`sidebar-nav-item ${location.pathname === "/posts" ? "active" : ""}`}
            onClick={() => { navigate("/posts"); closeSidebar() }}>
            <i className="bx bx-collection"></i>
            Post
          </button>

          <button
            className={`sidebar-nav-item ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={() => { navigate("/profile"); closeSidebar() }}>
            <i className="bx bx-bell"></i>
            Notification
          </button>

        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="bx bx-log-out"></i>
          Log Out
        </button>

      </aside>

      <main className="dashboard-main">

        <div className="dashboard-topbar">
          <div>
            <h1>Post</h1>
            <p className="dashboard-topbar-subtitle">Temukan barang kamu disini</p>
          </div>
          <button className="btn-create" onClick={() => navigate("/create-post")}>
            <i className="bx bx-plus"></i>
            Buat Post
          </button>
        </div>

        {/* ── Search Bar ── */}
        <div className="search-wrapper">
          <div className="search-input-group">
            <i className="bx bx-search search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder='Cari barang... contoh: "dompet hitam" atau "tas putih kampus"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={handleClearSearch} title="Hapus pencarian">
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>
          <button className="search-btn" onClick={handleSearch}>
            <i className="bx bx-search-alt"></i>
            Cari
          </button>
        </div>

        {/* ── Info Hasil Pencarian ── */}
        {isSearching && (
          <div className="search-result-info">
            {searchResultCount > 0 ? (
              <>
                <i className="bx bx-check-circle"></i>
                Ditemukan <strong>{searchResultCount}</strong> hasil untuk{" "}
                <em>"{searchQuery}"</em> — diurutkan berdasarkan kemiripan
              </>
            ) : (
              <>
                <i className="bx bx-info-circle"></i>
                Tidak ada hasil untuk <em>"{searchQuery}"</em>.{" "}
                <button className="search-reset-link" onClick={handleClearSearch}>
                  Tampilkan semua post
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Konten ── */}
        {loading ? (
          <div className="dashboard-state">
            <i className="bx bx-loader-alt bx-spin"></i>
            <span>Tunggu bentar ya...</span>
          </div>
        ) : displayPosts.length === 0 && !isSearching ? (
          <div className="dashboard-state">
            <i className="bx bx-folder-open"></i>
            <span>Belum ada post</span>
          </div>
        ) : displayPosts.length === 0 && isSearching ? (
          <div className="dashboard-state">
            <i className="bx bx-search-alt"></i>
            <span>Tidak ditemukan hasil yang cocok</span>
          </div>
        ) : (
          <div className="post-grid">
            {displayPosts.map((post) => (
              <div key={post.id} className="post-card">

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="post-image"
                  />
                )}

                <div className="post-card-body">
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>

                  <div className="post-meta">
                    <i className="bx bx-map"></i>
                    {post.location}
                  </div>

                  <div className="post-meta">
                    <i className="bx bx-category-alt"></i>
                    {post.category}
                  </div>

                  <div className="post-meta">
                    <i className="bx bxs-phone"></i>
                    {phone}
                  </div>

                  <div className="post-badges">
                    <span className={`badge badge-status-${post.status}`}>
                      {post.status}
                    </span>
                    <span className={`badge badge-type-${post.type}`}>
                      {post.type}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
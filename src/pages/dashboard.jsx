import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"
import "./style/style.css"
import "./style/dashboard.css"
import "boxicons/css/boxicons.min.css"


export default function Dashboard() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullName, setFullName] = useState("")

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
      setPosts(data)
    }
    setLoading(false)
  }

  const fetchUserData = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data, error } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error(error.message)
    } else {
      setFullName(data.full_name)
    }
  }
}

  useEffect(() => {
    fetchPosts()
    fetchUserData()
  }, [])

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
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{fullName}</div>
            <div className="sidebar-profile-label">Lihat Profil</div>
          </div>
        </div>

        <hr className="sidebar-divider" />

        <nav className="sidebar-nav">

          <button
            className="sidebar-nav-item active"
            onClick={() => { navigate("/dashboard"); closeSidebar() }}
          >
            <i className="bx bx-home-alt-2"></i>
            Dashboard
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => { navigate("/posts"); closeSidebar() }}
          >
            <i className="bx bx-collection"></i>
            Post
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
            <h1>Dashboard</h1>
            <p className="dashboard-topbar-subtitle">Kelola semua laporan barang hilang & temuan</p>
          </div>
          <button className="btn-create" onClick={() => navigate("/create-post")}>
            <i className="bx bx-plus"></i>
            Buat Post
          </button>
        </div>

        {loading ? (
          <div className="dashboard-state">
            <i className="bx bx-loader-alt bx-spin"></i>
            <span>Memuat data...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="dashboard-state">
            <i className="bx bx-folder-open"></i>
            <span>Belum ada post</span>
          </div>
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
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
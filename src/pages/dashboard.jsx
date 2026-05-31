import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"
import "./style/style.css"
import "./style/dashboard.css"
import "boxicons/css/boxicons.min.css"

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [deleteModal, setDeleteModal] = useState({ open: false, postId: null })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) console.error(error.message)
    else setPosts(data)
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

      if (error) console.error(error.message)
      else setFullName(data.full_name)
    }
  }

  // Fungsi delete
  const handleDelete = async () => {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", deleteModal.postId)

    if (error) {
      console.error(error.message)
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== deleteModal.postId))
    }
    setDeleteModal({ open: false, postId: null })
  }

  const handleClaimed = async (postId) => {
    const konfirmasi = window.confirm("Tandai barang ini sudah diambil pemiliknya?")
    if (!konfirmasi) return

    const { error } = await supabase
      .from("posts")
      .update({
        status: "Diklaim",
        claimed_at: new Date().toISOString(),
      })
      .eq("id", postId)

    if (error) {
      alert("Gagal menandai: " + error.message)
    } else {
      fetchPosts()
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchUserData()
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  const formatTimestamp = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

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
          UNIMED <span>Lost</span> & <span>Found</span>
        </div>

        <div className="sidebar-profile" onClick={() => { navigate("/profile"); closeSidebar() }}>
          <div className="sidebar-avatar">
            <i className="bx bx-user"></i>
          </div>
          <div className="sidebar-profile-info" onClick={() => { navigate("/dashboard") }}>
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
        <div className="dashboard-topbar">
          <div>
            <h1>Beranda</h1>
            <p className="dashboard-topbar-subtitle">Kelola semua laporan barang hilang & temuan milikmu</p>
          </div>
          <button className="btn-create" onClick={() => navigate("/create-post")}>
            <i className="bx bx-plus"></i>
            Buat Post
          </button>
        </div>
        
        {loading ? (
          <div className="dashboard-state">
            <i className="bx bx-loader-alt bx-spin"></i>
            <span>Tunggu bentar ya...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="dashboard-state">
            <i className="bx bx-folder-open"></i>
            <span>Kamu belum post apa-apa. Buat post sekarang atau <a href="" onClick={() => navigate("/posts")}>jelajahi post</a></span>
          </div>
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-card">

                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="post-image" />
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
                    <span className={`badge badge-status-${post.status}`}>{post.status}</span>
                    <span className={`badge badge-type-${post.type}`}>{post.type}</span>
                  </div>

                  <div className="post-card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/EditPost/${post.id}`)}>
                      <i className="bx bx-edit-alt"></i>
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => setDeleteModal({ open: true, postId: post.id })}>
                      <i className="bx bx-trash"></i>
                      Hapus
                    </button>
                  </div>
                  {post.type === "Ditemukan" && post.status !== "Diklaim" && (
                    <button
                      className="btn-claimed"
                      onClick={() => handleClaimed(post.id)}>
                      <i className="bx bx-check-double"></i>
                      Tandai Diklaim
                    </button>
                  )}

                  <div className="post-timestamp">
                    <i className="bx bx-time-five"></i>
                    {formatTimestamp(post.created_at)}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteModal.open && (
        <div className="modal-backdrop" onClick={() => setDeleteModal({ open: false, postId: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Hapus post ini?</h3>
            <p>Post yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?</p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setDeleteModal({ open: false, postId: null })}>
                Batal
              </button>
              <button className="btn-modal-delete" onClick={handleDelete}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
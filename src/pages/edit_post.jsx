import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"
import "./style/style.css"
import "./style/edit_post.css"
import "boxicons/css/boxicons.min.css"

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    status: "Terbuka",
    type: "Kehilangan",
    image_url: "",
  })

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      setError("Post tidak ditemukan.")
    } else {
      setForm({
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        category: data.category || "",
        status: data.status || "Terbuka",
        type: data.type || "Kehilangan",
        image_url: data.image_url || "",
      })
      if (data.image_url && data.image_url.trim() !== "")  {
        setImagePreview(data.image_url || null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPost()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async () => {
    if (form.image_url) {
    const oldFileName = form.image_url.split("/").pop()
    await supabase.storage
      .from("post-images")
      .remove([oldFileName])
  }

    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, imageFile)

    if (error) throw new Error("Gagal upload gambar: " + error.message)

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      let imageUrl = form.image_url

      // Upload gambar baru kalau ada
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const { error } = await supabase
        .from("posts")
        .update({
          title: form.title,
          description: form.description,
          location: form.location,
          category: form.category,
          status: form.status,
          type: form.type,
          image_url: imageUrl,
        })
        .eq("id", id)

      if (error) throw new Error(error.message)

      navigate("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="editpost-loading">
        <i className="bx bx-loader-alt bx-spin"></i>
        <span>Memuat data post...</span>
      </div>
    )
  }

  return (
    <div className="editpost-page">
      <div className="editpost-container">

        {/* Header */}
        <div className="editpost-header">
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            <i className="bx bx-arrow-back"></i>
          </button>
          <div>
            <h1>Edit Post</h1>
            <p>Perbarui informasi laporan kamu</p>
          </div>
        </div>

        {error && (
          <div className="editpost-error">
            <i className="bx bx-error-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="editpost-form">

          {/* Upload Gambar */}
          <div className="form-group">
            <label>Foto Barang</label>
            <div
              className="image-upload-area"
              onClick={() => document.getElementById("image-input").click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="image-preview" />
              ) : (
                <div className="image-placeholder">
                  <i className="bx bx-image-add"></i>
                  <span>Klik untuk upload foto</span>
                </div>
              )}
              {imagePreview && (
                <div className="image-overlay">
                  <i className="bx bx-camera"></i>
                  <span>Ganti foto</span>
                </div>
              )}
            </div>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Judul */}
          <div className="form-group">
            <label htmlFor="title">Judul</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Contoh: Dompet kulit warna coklat"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              placeholder="Jelaskan ciri-ciri barang, kondisi, atau detail penting lainnya..."
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          {/* Lokasi */}
          <div className="form-group">
            <label htmlFor="location">Lokasi</label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Contoh: Kantin lantai 2, Parkir basement"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label htmlFor="category">Kategori</label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="Contoh: Dompet, Kunci, HP, KTP"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipe & Status — 2 kolom */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Tipe</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                <option value="Kehilangan">Kehilangan</option>
                <option value="Ditemukan">Ditemukan</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="Terbuka">Terbuka</option>
                <option value="Diklaim">Diklaim</option>
              </select>
            </div>
          </div>

          {/* Tombol aksi */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/dashboard")}>
              Batal
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? (
                <>
                  <i className="bx bx-loader-alt bx-spin"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="bx bx-save"></i>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
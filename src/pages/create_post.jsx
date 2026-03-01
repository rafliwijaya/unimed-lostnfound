import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import "./style/style.css"
import "./style/post.css"
import postImg from './img/post.png';
import 'boxicons/css/boxicons.min.css'

function CreatePost() {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [image, setImage] = useState(null)
  const [location, setLocation] = useState("")
  const [error, setError] = useState("")

  const handleCreatePost = async (e) => {
    e.preventDefault()

    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      alert("Anda harus login terlebih dahulu")
      return
    }

    let imageUrl = null

    if (image) {
      const fileName = `${user.id}/${Date.now()}-${image.name}`

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, image)

      if (uploadError) {
        alert("Gagal upload gambar: " + uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName)

      imageUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase
      .from("posts")
      .insert([
        {
          title,
          description,
          category,
          status,
          type,
          image_url: imageUrl,
          location,
          user_id: user.id
        }
      ])

    if (insertError) {
      alert("Gagal membuat post: " + insertError.message)
    } else {
      alert("Post berhasil ditambahkan!")
      navigate("/dashboard")
    }
  }

  return (
    <div className="create-post-page">
      <div className="create-post-container">

        <div className="create-post-form-side">
          <h2>Buat <span>Post</span></h2>
          <p className="create-post-subtitle">Laporkan barang hilang atau temuan kamu</p>

          {error && <div className="create-post-error">{error}</div>}

          <form className="create-post-form" onSubmit={handleCreatePost}>

            <div className="input-group">
              <i className="bx bx-purchase-tag input-icon"></i>
              <input
                type="text"
                placeholder="Judul Barang"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <i className="bx bx-file-blank input-icon"></i>
              <input
                type="text"
                placeholder="Deskripsi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <i className="bx bx-category-alt input-icon"></i>
              <input
                type="text"
                placeholder="Kategori (Elektronik, Dokumen, Tas..)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <i className="bx bx-radio-circle-marked input-icon"></i>
              <div className="select-wrapper">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Status</option>
                  <option value="Open">Open</option>
                  <option value="Claimed">Claimed</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <i className="bx bx-chevron-down select-arrow"></i>
              </div>
            </div>

            <div className="input-group">
              <i className="bx bx-transfer input-icon"></i>
              <div className="select-wrapper">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Type</option>
                  <option value="Lost">Lost / Kehilangan</option>
                  <option value="Found">Found / Ditemukan</option>
                </select>
                <i className="bx bx-chevron-down select-arrow"></i>
              </div>
            </div>

            <div className="input-group">
              <i className="bx bx-map input-icon"></i>
              <input
                type="text"
                placeholder="Lokasi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <i className="bx bx-image-add input-icon"></i>
              <label className="file-label" htmlFor="post-image-upload">
                <span className={`file-label-text ${image ? "has-file" : ""}`}>
                  {image ? image.name : "Upload Foto Barang"}
                </span>
                <span className="file-browse-btn">Pilih File</span>
              </label>
              <input
                id="post-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <button onClick={() => navigate("/dashboard")} className="cancel-btn">
              Kembali
            </button>
            <button className="submit-btn" type="submit">Buat Post</button>

          </form>
        </div>

        <div className="create-post-image-side">
          <img src={postImg} alt="Post visual" />
          <div className="image-overlay"></div>
          <div className="image-badge">
            <h3>Temukan & Laporkan</h3>
            <p>Isi formulir nya dulu ya, semakin detail informasi nya semakin baik. <span>Panduan Postingannya</span> ada di bawah.</p>
          </div>
        </div>

        <div className="panduan-post">
          <h3>Panduan Postingan</h3>
          <p><span>Judul Barang</span>: Informasi utama barang Mis. dompet, kunci motor, ktp, tas, charger, jaket dsb.</p>
          <p><span>Deskripsi</span>: Berisi informasi atau spesifikasi lengkap dari barang bersangkutan. Mis. Dompet berisi uang tunai 200 ribu dengan ktp bernama Fulan Al Fulani.</p>
          <p><span>Kategori</span>: Mis. Elektronik, dokumen, tas, buku, pakaian, aksesoris dsb.</p>
          <p><span>Status</span>: Default <span>Open</span></p>
          <p><span>Type</span>: <span>Lost</span> untuk barang kehilangan. <span>Found</span> untuk barang temuan. Jika anda menemukan barang maka gunakan opsi <span>Post</span></p>
          <p><span>Lokasi</span>: Lokasi terakhir dari barang bersangkutan</p>
          <p><span>Foto</span>: Visual dari barang yang hilang atau barang temuan</p>
        </div>

      </div>
    </div>
  )
}

export default CreatePost
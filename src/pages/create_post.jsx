import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

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
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h2>Buat Post</h2>

      <form onSubmit={handleCreatePost}>

        <input
          type="text"
          placeholder="Judul Barang"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="text"
          placeholder="Kategori"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <br /><br />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        >
          <option value="" disabled>Pilih Status</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved</option>
        </select>
        <br /><br />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="" disabled>Pilih Type</option>
          <option value="lost">Lost / Kehilangan</option>
          <option value="found">Found / Ditemukan</option>
        </select>
        <br /><br />

        <input
          type="text"
          placeholder="Lokasi"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <br /><br />

        <button type="submit">Buat Post</button>

      </form>
    </div>
  )
}

export default CreatePost
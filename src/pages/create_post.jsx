import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

function createPost() {
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [status, setStatus] = useState("")
    const [type, setType] = useState("")
    const [imageurl, setImageUrl] = useState("")
    const [location, setLocation] = useState("")
    const [error, setError] = useState("")

    const handleRegister = async (e) => {
        e.preventDefault()

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Error mengambil user:", userError);
            alert("Anda harus login terlebih dahulu");
            return;
        }
        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    title: title,
                    description: description,
                    category: category,
                    status: status,
                    type: type,
                    image_url: imageurl,
                    location: location,
                    user_id: user.id
                }
            ])
            .select();
        if (error) {
            setError("Error insert data:", error.message);
            alert("Gagal membuat post: " + error.message);
        } else {
            setError("Post berhasil dibuat:", data);
            alert("Post berhasil ditambahkan!");
        }
    }

    return (
        <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h2>Register</h2>
      </div>
    )

}

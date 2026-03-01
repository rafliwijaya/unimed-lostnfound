import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"
import "./style/style.css"
import "./style/dashboard.css"
import "boxicons/css/boxicons.min.css"
import imgDev from './img/dev.png';

function Profile() {
    const navigate = useNavigate()

    return (
        <div>
        <img src={imgDev} alt="develop" style={{width:"20rem", height:"20rem"}} />
        <h3>Sabar ya.. fitur nya masih di kembangin :)</h3>
        <button onClick={() => {navigate("/dashboard")}}>Kembali</button>
        </div>
    )
}

export default Profile;
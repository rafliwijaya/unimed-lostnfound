import { Routes, Route } from "react-router-dom"
import Login from "./pages/login"
import Register from "./pages/register"

function Dashboard() {
  return <h1>Dashboard (Protected)</h1>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
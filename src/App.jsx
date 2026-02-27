import { Routes, Route } from "react-router-dom"
import Register from "./pages/register"
import Login from "./pages/login"
import ProtectedRoute from "./pages/protectedroute"

function Dashboard() {
  return <h1>Dashboard (Protected)</h1>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
import { Routes, Route, Navigate } from "react-router-dom"
import Register from "./pages/register"
import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import ProtectedRoute from "./pages/protectedroute"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/register" element={<Register />} />
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
import { Routes, Route, Navigate } from "react-router-dom"
import Register from "./pages/register"
import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import ProtectedRoute from "./pages/protectedroute"
import CreatePost from "./pages/create_post"
import Post from "./pages/post"
import Profile from "./pages/profile"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/create-post" element={<CreatePost />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts"
        element={
          <ProtectedRoute>
            <Post />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>

  )
}

export default App
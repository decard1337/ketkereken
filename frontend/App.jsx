import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import MapPage from "./pages/MapPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
<<<<<<< HEAD
import ResetPassword from "./pages/ResetPassword"
=======
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
import Admin from "./pages/Admin"
import Profile from "./pages/Profile"
import { AuthProvider, useAuth } from "./lib/auth"
import NotFound from "./pages/NotFound"
import LoadingScreen from "./components/LoadingScreen"
import Feed from "./pages/Feed"

function AdminRoute({ children }) {
  const { user, ready } = useAuth()

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/terkep" replace />
  return children
}

function ProfileRedirect() {
  const { user, ready } = useAuth()

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (!user.username) return <Navigate to="/" replace />

  return <Navigate to={`/u/${encodeURIComponent(user.username)}`} replace />
}

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(t)
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terkep" element={<MapPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
<<<<<<< HEAD
          <Route path="/reset-jelszo" element={<ResetPassword />} />
=======
>>>>>>> d3fda18727ce8b2d98d799fc65d84bbb28bad97f
          <Route path="/profile" element={<ProfileRedirect />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="/map" element={<MapPage />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
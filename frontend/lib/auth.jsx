import { createContext, useContext, useEffect, useState } from "react"
import { api } from "./api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await api.me()
        if (!cancelled) {
          setUser(res?.user || null)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email, password) {
    const res = await api.login(email, password)
    setUser(res?.user || null)
    return res
  }

  async function register(email, username, password) {
    const res = await api.register(email, username, password)
    setUser(res?.user || null)
    return res
  }

  async function logout() {
    try {
      await api.logout()
    } finally {
      setUser(null)
    }
  }

  async function refreshUser() {
    const res = await api.me()
    setUser(res?.user || null)
    return res?.user || null
  }

  function updateUser(nextUser) {
    setUser(nextUser || null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        setUser,
        updateUser,
        refreshUser,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return ctx
}
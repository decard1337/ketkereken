import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  async function refresh() {
    try {
      const r = await api.me();
      setUser(r.user);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => { refresh(); }, []);

  const value = useMemo(() => ({
    user,
    ready,
    refresh,
    login: async (email, password) => {
      const r = await api.login(email, password);
      setUser(r.user);
      return r.user;
    },
    register: async (email, username, password) => {
      const r = await api.register(email, username, password);
      setUser(r.user);
      return r.user;
    },
    logout: async () => {
      await api.logout();
      setUser(null);
    },
  }), [user, ready]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
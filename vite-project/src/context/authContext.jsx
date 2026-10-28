import { createContext, useEffect, useState } from "react";
import { getMe } from "../services/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setuser] = useState(null);
  const [Loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await getMe();
      if (res?.user) {
        setuser(res.user);
      } else {
        setuser(null);
      }
    } catch (err) {
      setuser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setuser, Loading, setLoading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
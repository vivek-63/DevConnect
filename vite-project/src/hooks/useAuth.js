import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { login, register, logout } from "../services/auth";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, setuser, Loading, setLoading, checkAuth } = context;

  const handleLogin = async ({ username, password }) => {
    setLoading(true);
    try {
      const data = await login({ username, password });
      if (data?.user) {
        setuser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error("Login failed");
    } catch (err) {
      const message = err.message || "Login failed";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({
        username,
        email,
        password,
      });
      if (data?.user) {
        setuser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error("Registration failed");
    } catch (err) {
      const message = err.message || "Registration failed";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setuser(null);
      sessionStorage.clear();
      return { success: true };
    } catch (err) {
      setuser(null);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    Loading,
    handleLogin,
    handleRegister,
    handleLogout,
    checkAuth,
  };
};
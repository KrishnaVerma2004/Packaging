import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { login, logout } from "../Api/login.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  const handleLogin = async ({ mobile, password }) => {
    setLoading(true);

    try {
      const data = await login({ mobile, password });

      if (data?.user) {
        setUser(data.user);
        return { success: true, user: data.user, message: data.message };
      }

      return {
        success: false,
        message: data?.message || "Login failed. Please try again.",
      };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Login failed. Please try again.";

      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      await logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, handleLogin, handleLogout };
};

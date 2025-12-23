import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { GET_PROFILE } from "../graphql/queries";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { LOGOUT } from "../graphql/queries";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isChangePasswordPage =
    location.pathname.startsWith("/change-password/");

  const { data, loading, error } = useQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
    skip: isChangePasswordPage,
    onError: (err) => {
      console.error("Error al obtener el perfil:", err);
    },
  });

  useEffect(() => {
    if (loading) return;
    if (error || !data?.profile) {
      console.warn("Fallo de autenticación:", error);
      setAuthFailed(true);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userAuthenticated");
    } else {
      setAuthFailed(false);
      setIsAuthenticated(true);
      setUser(data.profile);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userAuthenticated", JSON.stringify(data.profile));
    }
    setReady(true);
  }, [loading, data, error]);

  useEffect(() => {
    const handleAuthFailed = () => {
      console.warn("Evento auth-failed recibido");
      setAuthFailed(true);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userAuthenticated");
      if (!isLoginPage) {
        console.log("Estoy redirigiendo en AuthProvider.");
        navigate("/login");
        //window.location.href = "/login";
      }
    };

    window.addEventListener("auth-failed", handleAuthFailed);
    return () => {
      window.removeEventListener("auth-failed", handleAuthFailed);
    };
  }, [navigate]);

  const login = (profileData) => {
    setAuthFailed(false);
    setReady(true);
    setIsAuthenticated(true);
    setUser(profileData);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userAuthenticated", JSON.stringify(profileData));
  };

  const [logoutMutation] = useMutation(LOGOUT);
  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userAuthenticated");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        authFailed,
        login,
        logout,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

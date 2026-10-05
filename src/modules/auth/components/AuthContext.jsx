import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { GET_PROFILE } from "../graphql/queries";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { LOGOUT } from "../graphql/queries";

const AuthContext = createContext();

const PUBLIC_PATHS = ["/login", "/cfu", "/forgot-password", "/two-factor"];
const TWO_FACTOR_STEP_KEY = "twoFactorStep";

/** Paso de 2FA pendiente tras el login: "verify", "setup" o null */
export const getTwoFactorStep = () =>
  sessionStorage.getItem(TWO_FACTOR_STEP_KEY);

const isTwoFactorRequiredError = (error) =>
  error?.graphQLErrors?.some((e) => /Two-factor/i.test(e.message));

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isPublicPage =
    PUBLIC_PATHS.includes(location.pathname) ||
    location.pathname.startsWith("/change-password/");
  // En el login solo se consulta el perfil si el navegador recuerda una sesión,
  // para redirigir al panel sin provocar un 401 a quien todavía no ha entrado.
  const hasSessionHint = localStorage.getItem("isAuthenticated") === "true";
  const skipProfile = isPublicPage && !(isLoginPage && hasSessionHint);

  const { data, loading, error } = useQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
    skip: skipProfile,
    onError: (err) => {
      console.error("Error al obtener el perfil:", err);
    },
  });

  useEffect(() => {
    if (skipProfile) {
      setReady(true);
      return;
    }

    if (loading) return;
    if (error || !data?.profile) {
      console.warn("Fallo de autenticación:", error);
      setAuthFailed(true);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userAuthenticated");
      // La sesión existe pero falta el segundo factor: se pide el código
      if (isTwoFactorRequiredError(error)) {
        sessionStorage.setItem(
          TWO_FACTOR_STEP_KEY,
          getTwoFactorStep() ?? "verify"
        );
        navigate("/two-factor", { replace: true });
      }
    } else {
      setAuthFailed(false);
      setIsAuthenticated(true);
      setUser(data.profile);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userAuthenticated", JSON.stringify(data.profile));
    }

    setReady(true);
  }, [loading, data, error, skipProfile, navigate]);

  useEffect(() => {
    const handleAuthFailed = () => {
      console.warn("Evento auth-failed recibido");
      setAuthFailed(true);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userAuthenticated");
      sessionStorage.removeItem(TWO_FACTOR_STEP_KEY);
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
  }, [navigate, isLoginPage]);

  /**
   * Registra el resultado del login. Devuelve la ruta a la que debe ir el
   * usuario: el panel, o el paso de 2FA si su cuenta lo exige.
   */
  const login = (profileData) => {
    if (profileData.isTwoFactorEnabled) {
      sessionStorage.setItem(
        TWO_FACTOR_STEP_KEY,
        profileData.isTwoFactorConfigured ? "verify" : "setup"
      );
      return "/two-factor";
    }

    completeLogin(profileData);
    return "/statistics/analytics";
  };

  const completeLogin = (profileData) => {
    sessionStorage.removeItem(TWO_FACTOR_STEP_KEY);
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
    sessionStorage.removeItem(TWO_FACTOR_STEP_KEY);
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
        completeLogin,
        logout,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

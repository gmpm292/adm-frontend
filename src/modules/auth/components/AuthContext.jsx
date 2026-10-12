import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { GET_PROFILE } from "../graphql/queries";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { LOGOUT } from "../graphql/queries";
import { getAuthEpoch, startAuthSession } from "../../../apollo/client";

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
  // `navigate` cambia con cada ruta: la consulta del perfil no debe repetirse
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const client = useApolloClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  // Sesión vigente: al cambiar se vuelve a pedir el perfil completo
  const [session, setSession] = useState(getAuthEpoch);
  const newSession = () => {
    startAuthSession();
    setSession(getAuthEpoch());
  };

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isPublicPage =
    PUBLIC_PATHS.includes(location.pathname) ||
    location.pathname.startsWith("/change-password/");
  // Solo se consulta el perfil si el navegador recuerda una sesión: quien
  // todavía no ha entrado va al login sin provocar un 401. En el login, con
  // sesión recordada, la consulta sirve para redirigir al panel.
  const hasSessionHint = localStorage.getItem("isAuthenticated") === "true";
  const skipProfile = !hasSessionHint || (isPublicPage && !isLoginPage);

  useEffect(() => {
    if (skipProfile) {
      setLoading(false);
      setReady(true);
      return;
    }

    // Si mientras tanto se inicia sesión, este resultado es de la sesión
    // anterior y no debe tocar la nueva.
    const epoch = getAuthEpoch();
    let active = true;
    const isCurrent = () => active && epoch === getAuthEpoch();

    const fail = (error) => {
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
        navigateRef.current("/two-factor", { replace: true });
      }
    };

    setLoading(true);
    client
      .query({
        query: GET_PROFILE,
        fetchPolicy: "network-only",
        // Sin esto se reutilizaría una consulta igual aún en camino, que es
        // de la sesión anterior.
        context: { queryDeduplication: false },
      })
      .then(({ data }) => {
        if (!isCurrent()) return;
        if (!data?.profile) {
          fail();
          return;
        }
        setAuthFailed(false);
        setIsAuthenticated(true);
        setUser(data.profile);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userAuthenticated", JSON.stringify(data.profile));
      })
      .catch((error) => {
        if (!isCurrent()) return;
        console.error("Error al obtener el perfil:", error);
        fail(error);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setReady(true);
      });

    return () => {
      active = false;
    };
  }, [skipProfile, client, session]);

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
        navigate("/login");
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
    // Las cookies ya son de la sesión nueva, también con el 2FA pendiente
    newSession();
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
    newSession();
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
    newSession();
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

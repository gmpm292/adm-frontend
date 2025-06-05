import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading, authFailed, ready } = useAuthContext();

  if (!ready) {
    return <div>Cargando....</div>;
  }

  console.log("!isAuthenticated", !isAuthenticated);
  console.log("authFailed", authFailed);
  console.log("loading", loading);
  if (!isAuthenticated || authFailed) {
    console.log("Estoy redirigiendo en ProtectedRoute.");
    //window.location.href = "/login";
    return <Navigate to="/login" replace />;
    //return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;

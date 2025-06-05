import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import { ProgressSpinner } from "primereact/progressspinner";

const ProtectedRoute = () => {
  const { isAuthenticated, loading, authFailed, ready } = useAuthContext();

  if (!ready) {
    //return <div>Cargando....</div>;
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <ProgressSpinner />
      </div>
    );
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

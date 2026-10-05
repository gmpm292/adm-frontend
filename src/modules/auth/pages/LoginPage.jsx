import { Navigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useAuthContext } from "../components/AuthContext";
import { AuthLayout } from "../../../components/ui";

export function LoginPage() {
  const { isAuthenticated } = useAuthContext();

  // Con una sesión activa no tiene sentido mostrar el formulario
  if (isAuthenticated) {
    return <Navigate to="/statistics/analytics" replace />;
  }

  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Inicia sesión para continuar"
    >
      <LoginForm />
    </AuthLayout>
  );
}

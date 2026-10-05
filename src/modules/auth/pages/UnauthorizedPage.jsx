import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../../components/ui";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <EmptyState
        icon="pi pi-ban"
        title="Acceso denegado"
        actions={
          <>
            <Button
              label="Volver al panel"
              icon="pi pi-home"
              onClick={() => navigate("/statistics/analytics")}
            />
            <Button
              label="Ir al inicio de sesión"
              severity="secondary"
              onClick={() => navigate("/login")}
            />
          </>
        }
      >
        <p className="m-0">
          No tienes los permisos necesarios para acceder a esta página.
        </p>
      </EmptyState>
    </div>
  );
}

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Card className="p-shadow-8" style={{ width: "400px" }}>
        <div className="text-center">
          <i
            className="pi pi-ban"
            style={{ fontSize: "4rem", color: "#f44336" }}
          ></i>
          <h2>Acceso Denegado</h2>
          <p>No tienes los permisos necesarios para acceder a esta página.</p>
          <div className="flex gap-2 justify-content-center">
            <Button
              label="Volver al Dashboard"
              icon="pi pi-home"
              onClick={() => navigate("/statistics/analytics")}
            />
            <Button
              label="Ir al Login"
              icon="pi pi-sign-in"
              className="p-button-secondary"
              onClick={() => navigate("/login")}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

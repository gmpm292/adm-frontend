import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { LOGOUT } from "../../modules/auth/graphql/queries";
import "../styles/TopBar.css";
import useLogout from "../../hooks/useLogout";
import { PrintButton } from "../../modules/printing/printing.module";

export function TopBar() {
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const ticketData = {
    type: 'TICKET',
    content: [
      "********************************\n",
      "         TIENDA XYZ\n",
      "********************************\n",
      "Fecha: 2024-01-15 14:30\n",
      "Vendedor: Juan Pérez\n",
      "--------------------------------\n",
      "Producto      Cant.   Precio\n",
      "--------------------------------\n",
      "Café Negro    2       $20.00\n",
      "Azúcar        1       $5.00\n",
      "--------------------------------\n",
      "TOTAL: $25.00\n",
      "********************************\n"
    ],
    config: {
      cutAfterPrint: true
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-content">
        <div className="topbar-left flex align-items-center">
          <img
            src={logo}
            alt="Logo de la aplicación"
            style={{
              height: "30px",
              marginRight: "10px",
            }}
          />
          <span className="app-name">Administración</span>
        </div>
        <div className="topbar-right">
          <Button
            label="Perfil"
            icon="pi pi-user"
            className="p-button-text"
            onClick={() => navigate("/profile")}
          />
          <Button
            label="Idioma"
            icon="pi pi-globe"
            className="p-button-text"
            onClick={() => alert("Cambiar idioma")}
          />

          <PrintButton
            printData={ticketData}
            label="Imprimir Ticket"
            className="p-button-success"
            onSuccess={() => console.log("Ticket impreso")}
            onError={(error) => console.error("Error:", error)}
          />

          <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            className="p-button-text"
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

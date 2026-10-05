import { useRef } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../modules/auth/components/AuthContext";
import { routePermissions } from "../../config/routes";
import { menuConfig } from "../../config/menuConfig";
import { PrintButton } from "../../modules/printing/printing.module";

const ticketData = {
  type: "TICKET",
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
    "********************************\n",
  ],
  config: {
    cutAfterPrint: true,
  },
};

/** Sección del menú a la que pertenece la ruta, para la miga de pan */
const getSectionLabel = (pathname) =>
  menuConfig.find((group) =>
    (group.items ?? []).some(
      (item) =>
        item.path === pathname ||
        (item.items ?? []).some((nested) => nested.path === pathname)
    )
  )?.label;

const getInitials = (user) =>
  [user?.name, user?.lastName]
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

export function TopBar({ onToggleSidebar }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userMenu = useRef(null);

  const title = routePermissions[pathname]?.title ?? "";
  const section = getSectionLabel(pathname);

  const userMenuItems = [
    {
      label: "Mi perfil",
      icon: "pi pi-user",
      command: () => navigate("/profile"),
    },
    { separator: true },
    {
      label: "Cerrar sesión",
      icon: "pi pi-sign-out",
      command: () => logout(),
    },
  ];

  return (
    <header className="app-topbar">
      <Button
        icon="pi pi-bars"
        text
        rounded
        severity="secondary"
        aria-label="Mostrar u ocultar el menú"
        onClick={onToggleSidebar}
      />
      <nav className="app-topbar__breadcrumb" aria-label="Ubicación">
        {section && (
          <>
            <span>{section}</span>
            <i className="pi pi-chevron-right" />
          </>
        )}
        <span className="app-topbar__breadcrumb-current">{title}</span>
      </nav>

      <div className="app-topbar__actions">
        <PrintButton
          printData={ticketData}
          label="Imprimir ticket"
          className="p-button-outlined p-button-sm"
          onSuccess={() => console.log("Ticket impreso")}
          onError={(error) => console.error("Error:", error)}
        />

        <button
          type="button"
          className="app-user"
          onClick={(event) => userMenu.current.toggle(event)}
          aria-haspopup
        >
          <span className="app-user__avatar">{getInitials(user)}</span>
          <span className="app-user__text">
            <span className="app-user__name">
              {[user?.name, user?.lastName].filter(Boolean).join(" ") ||
                "Usuario"}
            </span>
            <span className="app-user__role">{user?.role?.join(", ")}</span>
          </span>
          <i className="pi pi-chevron-down text-xs" />
        </button>
        <Menu model={userMenuItems} popup ref={userMenu} />
      </div>
    </header>
  );
}

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * Marco de la aplicación: menú lateral, barra superior y contenido.
 * Se monta una sola vez; al navegar solo cambia el contenido.
 */
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={collapsed ? "app-shell app-shell--collapsed" : "app-shell"}>
      <Sidebar />
      <div className="app-shell__body">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

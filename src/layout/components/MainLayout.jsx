import { Card } from "primereact/card";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import "../styles/MainLayout.css";

export function MainLayout({ children }) {
  return (
    <div className="layout-wrapper">
      <TopBar />
      <Sidebar />
      <div className="layout-main">
        <Card className="layout-content">{children}</Card>
      </div>
    </div>
  );
}

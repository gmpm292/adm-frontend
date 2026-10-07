import { Button } from "primereact/button";

const TABS = [
  { key: null, label: "Todas", icon: "pi pi-list" },
  { key: "Query", label: "Consultas", icon: "pi pi-search" },
  { key: "Mutation", label: "Cambios", icon: "pi pi-pencil" },
  { key: "Subscription", label: "Suscripciones", icon: "pi pi-bell" },
];

export function RoleTypeTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Button
            key={tab.label}
            icon={tab.icon}
            label={tab.label}
            size="small"
            outlined={isActive}
            text={!isActive}
            severity={isActive ? undefined : "secondary"}
            onClick={() => onTabChange(tab.key)}
          />
        );
      })}
    </div>
  );
}

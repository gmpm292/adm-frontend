import React from "react";
import { Button } from "primereact/button";

export function RoleTypeTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "ALL", label: "Todos", icon: "pi pi-list" },
    { key: "QUERY", label: "Consultas", icon: "pi pi-search" },
    { key: "MUTATION", label: "Mutaciones", icon: "pi pi-pencil" },
    { key: "SUBSCRIPTION", label: "Suscripciones", icon: "pi pi-bell" },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Button
            key={tab.key}
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

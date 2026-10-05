import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { useFilteredMenu } from "../../hooks/useFilteredMenu";
import { APP_NAME } from "../../config/app";
import { BrandIcon } from "../../components/ui";

const itemClassName = ({ isActive }) =>
  isActive ? "app-nav-item app-nav-item--active" : "app-nav-item";

/** Indica si alguna ruta del grupo corresponde a la página actual */
const containsPath = (item, pathname) =>
  item.path === pathname ||
  (item.items ?? []).some((child) => containsPath(child, pathname));

function NavItem({ item }) {
  return (
    <NavLink to={item.path} className={itemClassName}>
      <i className={item.icon} />
      <span className="app-nav-item__label">{item.label}</span>
    </NavLink>
  );
}

function NavGroup({ item, open, active, onToggle }) {
  const className = [
    "app-nav-group",
    open && "app-nav-group--open",
    active && "app-nav-group--active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <button
        type="button"
        className="app-nav-group__toggle"
        onClick={onToggle}
        aria-expanded={open}
        title={item.label}
      >
        <i className={item.icon} />
        <span className="app-nav-group__label">{item.label}</span>
        <i className="pi pi-chevron-right app-nav-group__chevron" />
      </button>
      {open && (
        <div className="app-nav-group__items">
          {item.items.map((child) =>
            child.items?.length ? (
              child.items.map((nested) => (
                <NavItem key={nested.path ?? nested.label} item={nested} />
              ))
            ) : (
              <NavItem key={child.path ?? child.label} item={child} />
            )
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Menú lateral con las opciones a las que el usuario tiene acceso
 */
export function Sidebar() {
  const { pathname } = useLocation();
  const { filteredMenu, loading } = useFilteredMenu();
  const [openKey, setOpenKey] = useState(null);

  // Abre el grupo de la página actual al entrar o al navegar
  useEffect(() => {
    const current = filteredMenu.find((item) => containsPath(item, pathname));
    if (current) setOpenKey(current.key);
  }, [filteredMenu, pathname]);

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand" title={APP_NAME}>
        <span className="app-sidebar__mark">
          <BrandIcon />
        </span>
        <span className="app-sidebar__name">{APP_NAME}</span>
      </div>

      {loading ? (
        <div className="app-sidebar__status">
          <ProgressSpinner strokeWidth="4" className="w-3rem h-3rem" />
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="app-sidebar__status">
          <i className="pi pi-lock text-2xl" />
          <span>No tienes acceso a ninguna opción</span>
        </div>
      ) : (
        <nav className="app-sidebar__nav">
          {filteredMenu.map((item) =>
            item.items?.length ? (
              <NavGroup
                key={item.key}
                item={item}
                open={openKey === item.key}
                active={containsPath(item, pathname)}
                onToggle={() =>
                  setOpenKey(openKey === item.key ? null : item.key)
                }
              />
            ) : (
              <NavItem key={item.key} item={item} />
            )
          )}
        </nav>
      )}
    </aside>
  );
}

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { ProgressSpinner } from "primereact/progressspinner";
import { routePermissions } from "../../../config/routes";
import { EmptyState } from "../../../components/ui";
import { useHelpGuides } from "../useHelpGuides";
import { GuideView } from "./GuideView";

function HelpPanelContent({ onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { canOpen, findGuide, guidesForPath, loading } = useHelpGuides();
  const [selectedId, setSelectedId] = useState(null);

  if (loading) {
    return (
      <div className="help-panel__status">
        <ProgressSpinner strokeWidth="4" className="w-3rem h-3rem" />
      </div>
    );
  }

  const guides = guidesForPath(pathname);
  // Con una sola guía se abre directamente; con varias, se elige
  const guide = findGuide(selectedId) ?? (guides.length === 1 ? guides[0] : null);

  const goTo = (path) => {
    onClose();
    navigate(path);
  };
  const openHelpCenter = (id) =>
    goTo(id ? `/help?guia=${encodeURIComponent(id)}` : "/help");

  return (
    <div className="help-panel">
      {guide ? (
        <>
          {/* Vuelve a la lista, o a la guía de la pantalla tras abrir una relacionada */}
          {(selectedId || guides.length > 1) && (
            <Button
              label={guides.length > 1 ? "Otras guías de esta pantalla" : "Volver"}
              icon="pi pi-arrow-left"
              size="small"
              text
              className="help-panel__back"
              onClick={() => setSelectedId(null)}
            />
          )}
          <h2 className="help-panel__title">{guide.title}</h2>
          <GuideView
            guide={guide}
            canOpen={canOpen}
            onNavigate={goTo}
            onOpenGuide={setSelectedId}
            findGuide={findGuide}
            currentPath={pathname}
          />
        </>
      ) : guides.length > 0 ? (
        <>
          <p className="help-panel__intro">
            Guías sobre {routePermissions[pathname]?.title ?? "esta pantalla"}:
          </p>
          <div className="help-panel__choices">
            {guides.map((item) => (
              <button
                key={item.id}
                type="button"
                className="help-card"
                onClick={() => setSelectedId(item.id)}
              >
                <span className="help-card__title">{item.title}</span>
                <span className="help-card__more">
                  Ver la guía <i className="pi pi-arrow-right" />
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon="pi pi-book" title="Esta pantalla no tiene guía">
          <p>En el centro de ayuda están todos los procesos explicados.</p>
        </EmptyState>
      )}

      <div className="help-panel__footer">
        <Button
          label="Abrir el centro de ayuda"
          icon="pi pi-external-link"
          severity="secondary"
          className="w-full"
          onClick={() => openHelpCenter(guide?.id)}
        />
      </div>
    </div>
  );
}

/** Panel lateral con la guía de la pantalla actual, sin salir de ella */
export function HelpPanel({ visible, onHide }) {
  return (
    <Sidebar
      visible={visible}
      position="right"
      onHide={onHide}
      header="Ayuda de esta pantalla"
      className="help-panel-sidebar"
    >
      {visible && <HelpPanelContent onClose={onHide} />}
    </Sidebar>
  );
}

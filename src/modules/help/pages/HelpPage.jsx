import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { EmptyState, LoadingScreen, PageHeader } from "../../../components/ui";
import { GuideView, HelpText } from "../components/GuideView";
import { normalize, useHelpGuides } from "../useHelpGuides";

/**
 * Centro de ayuda: índice de guías por área con buscador y, con `?guia=`,
 * la guía elegida. Cada usuario ve solo las guías de las pantallas que puede
 * abrir.
 */
export function HelpPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { sections, canOpen, findGuide, loading } = useHelpGuides();

  if (loading) return <LoadingScreen message="Cargando la ayuda..." />;

  const guide = findGuide(searchParams.get("guia"));
  const openGuide = (id) => {
    setSearchParams({ guia: id });
    window.scrollTo(0, 0);
  };

  if (guide) {
    return (
      <>
        <PageHeader title={guide.title} subtitle={guide.sectionLabel}>
          <Button
            label="Todas las guías"
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={() => setSearchParams({})}
          />
        </PageHeader>
        <div className="help-page__guide">
          <GuideView
            guide={guide}
            canOpen={canOpen}
            onNavigate={navigate}
            onOpenGuide={openGuide}
            findGuide={findGuide}
          />
        </div>
      </>
    );
  }

  const terms = normalize(search).split(/\s+/).filter(Boolean);
  const visibleSections = sections
    .map((section) => ({
      ...section,
      guides: section.guides.filter((item) =>
        terms.every((term) => item.searchText.includes(term))
      ),
    }))
    .filter((section) => section.guides.length > 0);

  return (
    <>
      <PageHeader
        title="Ayuda"
        subtitle="Cómo se hacen los procesos principales y a qué pantalla ir en cada paso. En cualquier pantalla, el botón ? de la barra superior abre su guía."
      />

      <IconField iconPosition="left" className="help-search">
        <InputIcon className="pi pi-search" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar: devolver una venta, cerrar período, existencias..."
          aria-label="Buscar en la ayuda"
        />
      </IconField>

      {visibleSections.length === 0 ? (
        <EmptyState icon="pi pi-search" title="Ninguna guía coincide">
          <p>Prueba con otras palabras, por ejemplo el nombre de la pantalla.</p>
        </EmptyState>
      ) : (
        visibleSections.map((section) => (
          <section key={section.key} className="help-section">
            <h2 className="help-section__title">
              <i className={section.icon} />
              {section.label}
            </h2>
            <div className="help-cards">
              {section.guides.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="help-card"
                  onClick={() => openGuide(item.id)}
                >
                  <span className="help-card__title">{item.title}</span>
                  <span className="help-card__summary">
                    <HelpText text={item.summary} />
                  </span>
                  <span className="help-card__more">
                    Ver la guía <i className="pi pi-arrow-right" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

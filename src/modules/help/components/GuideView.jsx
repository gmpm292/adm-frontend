import { Button } from "primereact/button";
import { routePermissions } from "../../../config/routes";

/**
 * Texto de una guía. Lo que va entre «» es algo que se ve en pantalla (un
 * botón, un campo, una opción) y se destaca para encontrarlo.
 */
export function HelpText({ text }) {
  return text.split(/«([^»]+)»/).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="help-label">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function GuideList({ title, icon, items, className }) {
  if (!items?.length) return null;

  return (
    <section className={`help-guide__block ${className ?? ""}`}>
      <h3 className="help-guide__block-title">
        <i className={icon} />
        {title}
      </h3>
      <ul className="help-guide__list">
        {items.map((item) => (
          <li key={item}>
            <HelpText text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Una guía completa: para qué sirve, qué hace falta antes, los pasos con un
 * acceso a cada pantalla y lo que conviene saber.
 *
 * - `canOpen(path)`: si el usuario puede abrir esa pantalla.
 * - `onNavigate(path)`: lleva a la pantalla de un paso.
 * - `onOpenGuide(id)`: abre una guía relacionada.
 * - `currentPath`: pantalla en la que está; su paso no lleva botón.
 */
export function GuideView({
  guide,
  canOpen,
  onNavigate,
  onOpenGuide,
  findGuide,
  currentPath,
}) {
  const related = (guide.related ?? []).map(findGuide).filter(Boolean);

  return (
    <article className="help-guide">
      <p className="help-guide__summary">
        <HelpText text={guide.summary} />
      </p>

      <GuideList
        title="Antes de empezar"
        icon="pi pi-check-square"
        items={guide.before}
      />

      <section className="help-guide__block">
        <h3 className="help-guide__block-title">
          <i className="pi pi-list" />
          Pasos
        </h3>
        <ol className="help-steps">
          {guide.steps.map((step, index) => {
            const showLink =
              step.path && step.path !== currentPath && canOpen(step.path);
            return (
              <li key={index} className="help-step">
                <span className="help-step__number">{index + 1}</span>
                <div className="help-step__body">
                  <p className="help-step__text">
                    <HelpText text={step.text} />
                  </p>
                  {showLink && (
                    <Button
                      label={`Ir a ${routePermissions[step.path]?.title ?? "la pantalla"}`}
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      size="small"
                      text
                      className="help-step__link"
                      onClick={() => onNavigate(step.path)}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <GuideList
        title="Ten en cuenta"
        icon="pi pi-info-circle"
        items={guide.notes}
        className="help-guide__block--notes"
      />

      {related.length > 0 && (
        <section className="help-guide__block">
          <h3 className="help-guide__block-title">
            <i className="pi pi-book" />
            Guías relacionadas
          </h3>
          <div className="help-related">
            {related.map((item) => (
              <Button
                key={item.id}
                label={item.title}
                icon="pi pi-angle-right"
                severity="secondary"
                outlined
                size="small"
                onClick={() => onOpenGuide(item.id)}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

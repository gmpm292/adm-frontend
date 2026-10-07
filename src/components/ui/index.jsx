/**
 * Componentes compartidos del sistema de diseño.
 * Las pantallas se construyen con estos componentes, los de PrimeReact y las
 * clases de utilidad de PrimeFlex; sus estilos viven en src/theme.
 */
import { InputText } from "primereact/inputtext";
import { ProgressBar } from "primereact/progressbar";
import { ProgressSpinner } from "primereact/progressspinner";
import { QRCodeSVG } from "qrcode.react";
import { APP_NAME } from "../../config/app";

const QR_SIZE = 176;

// El nombre de la marca se muestra con la primera palabra destacada
const [APP_NAME_LEAD, ...APP_NAME_REST] = APP_NAME.split(" ");

/** Lo que el sistema ofrece, mostrado en el panel de marca del acceso */
const AUTH_FEATURES = [
  {
    icon: "pi pi-shopping-cart",
    title: "Ventas",
    text: "Registra y da seguimiento a tus ventas fácilmente.",
  },
  {
    icon: "pi pi-box",
    title: "Inventario",
    text: "Ten el control de tu stock en tiempo real.",
  },
  {
    icon: "pi pi-credit-card",
    title: "Pagos",
    text: "Gestiona tus cobros y pagos sin complicaciones.",
  },
  {
    icon: "pi pi-chart-line",
    title: "Reportes",
    text: "Visualiza el progreso de tu negocio en un vistazo.",
  },
];

/** Icono de la marca: gráfico de barras simple, del color del texto */
export function BrandIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="12" width="4.5" height="9" rx="1.5" />
      <rect x="9.75" y="7.5" width="4.5" height="13.5" rx="1.5" />
      <rect x="16.5" y="3" width="4.5" height="18" rx="1.5" />
    </svg>
  );
}

/** Encabezado de una página: título, descripción y acciones */
export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="ui-page-header">
      <div>
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle && <p className="ui-page-header__subtitle">{subtitle}</p>}
      </div>
      {children && <div className="ui-page-header__actions">{children}</div>}
    </header>
  );
}

/** Campo de formulario: etiqueta, control, ayuda y error */
export function FormField({ label, htmlFor, required, hint, error, children }) {
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ui-field__required"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <small className="ui-field__error">{error}</small>
      ) : (
        hint && <small className="ui-field__hint">{hint}</small>
      )}
    </div>
  );
}

/** Bloque con título dentro de un formulario largo */
export function FormSection({ title, hint, children }) {
  return (
    <section className="ui-form-section">
      <h3 className="ui-form-section__title">{title}</h3>
      {hint && <p className="ui-form-section__hint">{hint}</p>}
      <div className="ui-form-section__body">{children}</div>
    </section>
  );
}

/** Pantalla completa de espera */
export function LoadingScreen({ message = "Cargando..." }) {
  return (
    <div className="ui-loading-screen">
      <ProgressSpinner strokeWidth="4" />
      <span>{message}</span>
    </div>
  );
}

/** Estado vacío o informativo con icono, texto y acciones */
export function EmptyState({ icon = "pi pi-inbox", title, children, actions }) {
  return (
    <div className="ui-empty-state">
      <span className="ui-empty-state__icon">
        <i className={icon} />
      </span>
      {title && <h2 className="ui-empty-state__title">{title}</h2>}
      {children}
      {actions && <div className="ui-empty-state__actions">{actions}</div>}
    </div>
  );
}

/** Marco de las pantallas de acceso: panel de marca y formulario */
export function AuthLayout({
  title,
  subtitle,
  footer,
  wide,
  icon = "pi pi-lock",
  children,
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__brand">
        <div className="auth-layout__mark">
          <span className="auth-layout__mark-icon">
            <BrandIcon />
          </span>
          <span>
            <strong>{APP_NAME_LEAD}</strong> {APP_NAME_REST.join(" ")}
          </span>
        </div>
        <div>
          <h2 className="auth-layout__headline">
            Gestiona tu negocio,
            <span className="auth-layout__headline-accent">
              todo en un solo lugar.
            </span>
          </h2>
          <p className="auth-layout__tagline">
            <span>Controla tus ventas, inventario, pagos y más.</span>
            <span>Toma decisiones con información clara y actualizada.</span>
          </p>
          <ul className="auth-layout__features">
            {AUTH_FEATURES.map((feature) => (
              <li key={feature.title} className="auth-feature">
                <span className="auth-feature__icon">
                  <i className={feature.icon} />
                </span>
                <span className="auth-feature__title">{feature.title}</span>
                <span className="auth-feature__text">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="auth-layout__footnote">
          <i className="pi pi-shield" />
          <span>Más control. Más tiempo. Más crecimiento.</span>
        </div>
      </aside>
      <main className="auth-layout__main">
        <div className={wide ? "auth-card auth-card--wide" : "auth-card"}>
          <span className="auth-card__badge">
            <i className={icon} />
          </span>
          <h1 className="auth-card__title">{title}</h1>
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
          {children}
          {footer && <div className="auth-card__footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

/** Campo para el código de 6 dígitos de la aplicación de autenticación */
export function OtpInput({ id = "otp", value, onChange, disabled, invalid }) {
  return (
    <span className="ui-otp">
      <InputText
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        maxLength={6}
        disabled={disabled}
        invalid={invalid}
        className="w-full"
        autoFocus
      />
    </span>
  );
}

/** Código QR de emparejamiento 2FA con su clave para escribirla a mano */
export function QrPanel({ otpAuthUrl }) {
  const secret = new URL(otpAuthUrl).searchParams.get("secret");

  return (
    <div className="ui-qr-panel">
      <div className="ui-qr-panel__code">
        <QRCodeSVG value={otpAuthUrl} size={QR_SIZE} />
      </div>
      <span className="ui-field__hint">
        ¿No puedes escanearlo? Escribe esta clave en la aplicación:
      </span>
      <span className="ui-qr-panel__secret">{secret}</span>
    </div>
  );
}

/** Aviso breve de que una sección no tiene información que mostrar */
export function NoData({ message = "No hay datos en este periodo" }) {
  return (
    <div className="ui-no-data">
      <i className="pi pi-inbox" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Indicador: una cifra con su etiqueta, su icono y, si se da, la variación
 * frente al periodo anterior.
 */
export function StatCard({ label, value, icon, change, changeLabel, hint }) {
  const trend = change > 0 ? "up" : change < 0 ? "down" : "flat";

  return (
    <div className="ui-stat">
      <div className="ui-stat__head">
        <span className="ui-stat__label">{label}</span>
        {icon && (
          <span className="ui-stat__icon">
            <i className={icon} />
          </span>
        )}
      </div>
      <span className="ui-stat__value">{value}</span>
      {changeLabel ? (
        <span className={`ui-stat__change ui-stat__change--${trend}`}>
          {trend !== "flat" && (
            <i
              className={
                trend === "up" ? "pi pi-arrow-up-right" : "pi pi-arrow-down-right"
              }
            />
          )}
          {changeLabel}
          <span className="ui-stat__hint">frente al periodo anterior</span>
        </span>
      ) : (
        hint && <span className="ui-stat__hint">{hint}</span>
      )}
    </div>
  );
}

/**
 * Lista ordenada con una barra proporcional al valor de cada elemento
 * (productos más vendidos, vendedores, clientes...).
 */
export function RankingList({ items, emptyMessage }) {
  if (!items?.length) {
    return <NoData message={emptyMessage} />;
  }

  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <ol className="ui-ranking">
      {items.map((item, index) => (
        <li key={item.key ?? index} className="ui-ranking__item">
          <div className="ui-ranking__row">
            <span className="ui-ranking__name">
              {item.name}
              {item.detail && (
                <span className="ui-ranking__detail">{item.detail}</span>
              )}
            </span>
            <span className="ui-ranking__value">{item.valueLabel}</span>
          </div>
          <ProgressBar
            value={max > 0 ? (item.value / max) * 100 : 0}
            showValue={false}
          />
        </li>
      ))}
    </ol>
  );
}

/** Fila de una lista de pares etiqueta/valor dentro de una tarjeta */
export function InfoRow({ icon, label, detail, children }) {
  return (
    <li className="ui-info-row">
      {icon && (
        <span className="ui-info-row__icon">
          <i className={icon} />
        </span>
      )}
      <span className="ui-info-row__text">
        <span className="ui-info-row__label">{label}</span>
        {detail && <span className="ui-info-row__detail">{detail}</span>}
      </span>
      <span className="ui-info-row__value">{children}</span>
    </li>
  );
}
